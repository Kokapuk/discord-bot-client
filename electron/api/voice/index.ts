import {
  EndBehaviorType,
  entersState,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { desktopCapturer, IpcMainInvokeEvent } from 'electron';
import { createRequire } from 'module';
import { IpcApiResponse } from '..';
import { client } from '../discord/client';
import { bindIpcVoiceApiEvents } from './events';
import { AudioSource } from './types';
import { structAudioSource } from './utils';

const require = createRequire(import.meta.url);
const prism = require('prism-media');
const Speaker = require('speaker');

let connection: VoiceConnection | null = null;
let receiverEnabled = false;
const activeSpeakers: any[] = [];

export const enableReceiver = () => {
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
};

export const disableReceiver = () => {
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

const updateEvents = () => {
  if (!connection) {
    return;
  }

  const savedConnection = connection;
  savedConnection.removeAllListeners();

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
    connection = null;
  });
};

export const joinVoice = (event: IpcMainInvokeEvent, guildId: string, channelId: string) => {
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

  updateEvents();
  bindIpcVoiceApiEvents(connection, event.sender, { guildId: guild.id, channelId: channel.id });
};

export const leaveVoice = () => {
  if (!connection) {
    return;
  }

  connection.destroy();
};

export const getAudioSources = async (): Promise<IpcApiResponse<AudioSource[]>> => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window'],
      fetchWindowIcons: true,
      thumbnailSize: { height: 0, width: 0 },
    });

    return { success: true, payload: sources.map(structAudioSource) };
  } catch (err) {
    return { success: false, error: 'Failed to get desktop sources' };
  }
};
