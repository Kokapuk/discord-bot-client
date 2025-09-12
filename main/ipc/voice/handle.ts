import {
  createAudioResource,
  EndBehaviorType,
  entersState,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
} from '@discordjs/voice';
import { app, BrowserWindow, WebContents } from 'electron';
import { createRequire } from 'module';
import { PassThrough } from 'stream';
import { VoiceIpcSlice } from '.';
import { IpcApiResponse } from '..';
import { OutputAudioWindowSource, VoiceConnectionStatus, VoiceMember } from '../../features/voice/types';
import { structVoiceMember, structVoiceState } from '../../features/voice/utils';
import { createIpcMain } from '../../utils/createIpcMain';
import { client } from '../client/utils';
import {
  audioOutputStream,
  audioPlayer,
  startHandlingOutputAudioIsolatedCaptureSource,
  startHandlingOutputAudioIsolatedExternalSource,
  startHandlingOutputAudioSystemwideSource,
  stopHandlingAudioOutputSource,
} from './utils';
import path from 'path';

const require = createRequire(import.meta.url);
const prism = require('prism-media');
const Speaker = require('speaker');

const { getActiveWindowProcessIds } = require(process.env['VITE_DEV_SERVER_URL']
  ? 'application-loopback'
  : path.join(path.parse(app.getPath('exe')).dir, './resources/app.asar.unpacked/node_modules/application-loopback'));

export const ipcMain = createIpcMain<VoiceIpcSlice>();

let connection: VoiceConnection | null = null;
let receiverEnabled = false;
const activeSpeakers: any[] = [];
const userVolumes: Record<string, number> = {};

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
  ipcMain.handle('getGuildsVoiceChannelsMembers', async () => {
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

    return { success: true, payload: guildVoiceChannelsMembers } as IpcApiResponse<
      Record<string, Record<string, VoiceMember[]>>
    >;
  });

  ipcMain.handle('enableReceiver', async (event) => {
    if (!connection || receiverEnabled) {
      return;
    }

    receiverEnabled = true;

    const receiver = connection.receiver;

    receiver.speaking.on('start', (userId) => {
      if (!receiverEnabled) {
        return;
      }

      ipcMain.send(event.sender, 'userSpeakingStart', userId);

      const stream = receiver.subscribe(userId, {
        end: { behavior: EndBehaviorType.Manual },
      });

      const decoder = new prism.opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });
      const volume = new prism.VolumeTransformer({ type: 's16le', volume: userVolumes[userId] ?? 1 });

      const speaker = new Speaker({
        channels: 2,
        bitDepth: 16,
        sampleRate: 48000,
      });
      activeSpeakers.push(speaker);
      stream.pipe(decoder).pipe(volume).pipe(speaker);

      stream.on('end', () => {
        speaker.close();
        const speakerIndex = activeSpeakers.indexOf(speaker);

        if (speakerIndex !== -1) {
          activeSpeakers.splice(speakerIndex, 1);
        }

        volume.destroy();
        decoder.destroy();
      });
    });

    receiver.speaking.on('end', (userId) => {
      if (!receiverEnabled) {
        return;
      }

      ipcMain.send(event.sender, 'userSpeakingEnd', userId);

      const stream = receiver.subscriptions.get(userId);

      if (stream) {
        stream.emit('end');
        stream.destroy();
      }
    });
  });

  ipcMain.handle('disableReceiver', async () => disableReceiver());

  ipcMain.handle('joinVoice', async (event, guildId, channelId) => {
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

  ipcMain.handle('leaveVoice', async () => {
    if (!connection) {
      return;
    }

    connection.destroy();
  });

  ipcMain.handle('getAudioCaptureWindows', async () => {
    try {
      const windows: OutputAudioWindowSource[] = await getActiveWindowProcessIds();
      return {
        success: true,
        payload: windows.filter(
          (window, index) => !windows.slice(0, index).some((cmpWindow) => cmpWindow.processId === window.processId)
        ),
      } as IpcApiResponse<OutputAudioWindowSource[]>;
    } catch (err: any) {
      return { success: false, error: err.message } as IpcApiResponse<OutputAudioWindowSource[]>;
    }
  });

  ipcMain.handle('startHandlingOutputAudioSource', async (event, source, processId) => {
    switch (source) {
      case 'systemwide':
        startHandlingOutputAudioSystemwideSource();
        break;
      case 'isolatedExternal':
        startHandlingOutputAudioIsolatedExternalSource(BrowserWindow.fromWebContents(event.sender)!);
        break;
      case 'isolatedExternalWithLocalEcho':
        startHandlingOutputAudioIsolatedExternalSource(BrowserWindow.fromWebContents(event.sender)!, true);
        break;
      case 'isolatedCapture':
        startHandlingOutputAudioIsolatedCaptureSource(processId!);
        break;
    }

    audioOutputStream.current = new PassThrough({ highWaterMark: 1024 });
    const resource = createAudioResource(audioOutputStream.current, { inputType: StreamType.Raw });
    audioPlayer.play(resource);
  });

  ipcMain.on('sendAudioPort', (event) => {
    const port = event.ports[0];

    port.on('message', (e) => {
      const buffer = Buffer.from(e.data);
      audioOutputStream.current?.write(buffer);
    });

    port.start();
  });

  ipcMain.handle('stopHandlingOutputAudioSource', async (event) => {
    stopHandlingAudioOutputSource(event.sender);
    audioPlayer.stop();
    audioOutputStream.current = null;
  });

  ipcMain.handle('getUserVolume', async (_, userId) => {
    return userVolumes[userId] ?? 1;
  });

  ipcMain.handle('setUserVolume', async (_, userId, volume) => {
    userVolumes[userId] = volume;
  });
};

export const handleIpcMainAutoInvokeEvents = (webContents: WebContents) => {
  client.on('voiceStateUpdate', (oldState, newState) =>
    ipcMain.send(webContents, 'voiceStateUpdate', structVoiceState(oldState), structVoiceState(newState))
  );
};
