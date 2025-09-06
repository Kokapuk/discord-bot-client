import {
  createAudioResource,
  EndBehaviorType,
  entersState,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
} from '@discordjs/voice';
import { BrowserWindow, WebContents } from 'electron';
import { createRequire } from 'module';
import { PassThrough } from 'stream';
import { VoiceIpcSlice } from '.';
import { createIpcMain } from '../../utils/createIpcMain';
import { client } from '../client/utils';
import { VoiceConnectionStatus, VoiceMember } from './types';
import {
  audioOutputStream,
  audioPlayer,
  startHandlingOutputAudioIsolatedExternalSource,
  startHandlingOutputAudioSystemwideSource,
  stopHandlingAudioOutputSource,
  structVoiceMember,
  structVoiceState,
} from './utils';

const require = createRequire(import.meta.url);
const prism = require('prism-media');
const Speaker = require('speaker');

export const ipcMain = createIpcMain<VoiceIpcSlice>();

let connection: VoiceConnection | null = null;
let receiverEnabled = false;
const activeSpeakers: any[] = [];

const disableReceiver = () => {
  if (!receiverEnabled) {
    return;
  }

  receiverEnabled = false;

  if (connection) {
    connection.receiver.speaking.removeAllListeners('start');
  }

  activeSpeakers.forEach((speaker) => speaker.close());
  activeSpeakers.length = 0;
};

const updateEvents = (webContents: WebContents) => {
  if (!connection) {
    return;
  }

  const savedConnection = connection;

  savedConnection.removeAllListeners();
  savedConnection.subscribe(audioPlayer);

  savedConnection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(savedConnection, VoiceConnectionStatus.Signalling, 5000),
        entersState(savedConnection, VoiceConnectionStatus.Connecting, 5000),
      ]);
    } catch {
      savedConnection.destroy();
    }
  });

  savedConnection.on(VoiceConnectionStatus.Destroyed, () => {
    disableReceiver();
    stopHandlingAudioOutputSource(webContents);
    connection = null;
  });
};

const handleConnectionStateChangeEvent = (
  connection: VoiceConnection,
  webContents: WebContents,
  activeChannel: { guildId: string; channelId: string }
) => {
  connection.on('stateChange', (_, state) => {
    ipcMain.send(webContents, 'voiceConnectionStatusUpdate', state.status, activeChannel);
  });
};

export const handleIpcMainEvents = () => {
  ipcMain.handle('getGuildsVoiceChannelsMembers', () => {
    const guilds = client.guilds.cache;
    const guildVoiceChannelsMembers: Record<string, Record<string, VoiceMember[]>> = {};

    guilds.forEach((guild) => {
      const membersInVoice = guild.members.cache.filter((member) => !!member.voice.channel);

      membersInVoice.forEach((member) => {
        if (!guildVoiceChannelsMembers[guild.id]) {
          guildVoiceChannelsMembers[guild.id] = {};
        }

        if (!guildVoiceChannelsMembers[guild.id][member.voice.channelId!]) {
          guildVoiceChannelsMembers[guild.id][member.voice.channelId!] = [];
        }

        guildVoiceChannelsMembers[guild.id][member.voice.channelId!].push(structVoiceMember(member));
      });
    });

    return { success: true, payload: guildVoiceChannelsMembers };
  });

  ipcMain.handle('enableReceiver', () => {
    if (!connection || receiverEnabled) {
      return;
    }

    receiverEnabled = true;

    const receiver = connection.receiver;

    receiver.speaking.on('start', (userId) => {
      if (!receiverEnabled) {
        return;
      }

      const opusStream = receiver.subscribe(userId, {
        end: { behavior: EndBehaviorType.AfterSilence, duration: 300 },
      });

      const decoder = new prism.opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });

      const speaker = new Speaker({
        channels: 2,
        bitDepth: 16,
        sampleRate: 48000,
      });
      activeSpeakers.push(speaker);

      opusStream.pipe(decoder).pipe(speaker);

      opusStream.on('end', () => {
        speaker.close();
        const speakerIndex = activeSpeakers.indexOf(speaker);

        if (speakerIndex !== -1) {
          activeSpeakers.splice(speakerIndex, 1);
        }
      });
    });
  });

  ipcMain.handle('disableReceiver', disableReceiver);

  ipcMain.handle('joinVoice', (event, guildId, channelId) => {
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
      throw new Error('Guild does not exist');
    }

    const channel = guild.channels.cache.get(channelId);

    if (!channel) {
      throw new Error('Channel does not exist');
    }

    if (connection) {
      connection.destroy();
    }

    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true,
    });

    updateEvents(event.sender);
    handleConnectionStateChangeEvent(connection, event.sender, { guildId: guild.id, channelId: channel.id });
  });

  ipcMain.handle('leaveVoice', () => {
    if (!connection) {
      return;
    }

    connection.destroy();
  });

  ipcMain.handle('startHandlingOutputAudioSource', (event, source) => {
    if (source === 'systemwide') {
      startHandlingOutputAudioSystemwideSource();
    } else if (source === 'isolatedExternal') {
      startHandlingOutputAudioIsolatedExternalSource(BrowserWindow.fromWebContents(event.sender)!);
    } else if (source === 'isolatedExternalWithLocalEcho') {
      startHandlingOutputAudioIsolatedExternalSource(BrowserWindow.fromWebContents(event.sender)!, true);
    }

    audioOutputStream.current = new PassThrough({ highWaterMark: 1024 });
    const resource = createAudioResource(audioOutputStream.current, { inputType: StreamType.Raw });
    audioPlayer.play(resource);

    // audioOutputStream.current.pipe(new Speaker({ frameSize: 960, channels: 2, rate: 48000 }));
  });

  ipcMain.handle('stopHandlingOutputAudioSource', (event) => {
    stopHandlingAudioOutputSource(event.sender);
    audioPlayer.stop();
    audioOutputStream.current = null;
  });

  ipcMain.handle('voiceChunk', (_, buffer) => {
    audioOutputStream.current?.write(Buffer.from(buffer));
  });
};

export const handleIpcMainAutoInvokeEvents = (webContents: WebContents) => {
  client.on('voiceStateUpdate', (oldState, newState) =>
    ipcMain.send(webContents, 'voiceStateUpdate', structVoiceState(oldState), structVoiceState(newState))
  );
};
