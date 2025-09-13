import {
  createAudioResource,
  EndBehaviorType,
  entersState,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
} from '@discordjs/voice';
import { BrowserWindow, nativeImage, WebContents } from 'electron';
import { createRequire } from 'module';
import { PassThrough } from 'stream';
import { VoiceIpcSlice } from '.';
import { IpcApiResponse } from '..';
import {
  OutputAudioSourceType,
  LoopbackCaptureWindow,
  VoiceConnectionStatus,
  VoiceMember,
} from '../../features/voice/types';
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

const require = createRequire(import.meta.url);
const prism = require('prism-media');
const Speaker = require('speaker');
const { getVisibleWindows } = require('@kokapuk/application-loopback');

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
      const windows = getVisibleWindows();

      return {
        success: true,
        payload: windows
          .filter(
            (window: any, index: number) =>
              !windows.slice(0, index).some((cmpWindow: any) => cmpWindow.processId === window.processId)
          )
          .map((window: any) => ({
            ...window,
            icon: window.icon
              ? nativeImage
                  .createFromBitmap(window.icon.buffer, {
                    width: window.icon.width,
                    height: window.icon.height,
                  })
                  .toDataURL()
              : null,
          })),
      } as IpcApiResponse<LoopbackCaptureWindow[]>;
    } catch (err: any) {
      return { success: false, error: err.message } as IpcApiResponse<LoopbackCaptureWindow[]>;
    }
  });

  ipcMain.handle('startHandlingOutputAudioSource', async (event, source) => {
    try {
      switch (source?.type) {
        case OutputAudioSourceType.Systemwide:
          startHandlingOutputAudioSystemwideSource();
          break;
        case OutputAudioSourceType.IsolatedExternal:
          startHandlingOutputAudioIsolatedExternalSource(
            BrowserWindow.fromWebContents(event.sender)!,
            source.withLocalEcho
          );
          break;
        case OutputAudioSourceType.LoopbackCapture:
          startHandlingOutputAudioIsolatedCaptureSource(source.window.processId);
          break;
      }
    } catch (err: any) {
      return { success: false, error: err.message } as IpcApiResponse;
    }

    audioOutputStream.current = new PassThrough({ highWaterMark: 1024 });
    const resource = createAudioResource(audioOutputStream.current, { inputType: StreamType.Raw });
    audioPlayer.play(resource);

    return { success: true } as IpcApiResponse;
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
