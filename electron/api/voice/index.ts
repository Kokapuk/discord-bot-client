import {
  EndBehaviorType,
  entersState,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { IpcMainInvokeEvent } from 'electron';
// import type Speaker from 'speaker';
import { client } from '../discord/client';
import { bindIpcVoiceApiEvents } from './events';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const prism = require('prism-media');
const Speaker = require('speaker');

type SpeakerInstance = InstanceType<typeof Speaker>;

let connection: VoiceConnection | null = null;
let receiverEnabled = false;
const activeSpeakers: SpeakerInstance[] = [];

const updateEvents = () => {
  if (!connection) {
    return;
  }

  const savedConnection = connection;
  savedConnection.removeAllListeners();

  savedConnection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(savedConnection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(savedConnection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
    } catch {
      savedConnection.destroy();
    }
  });

  savedConnection.on(VoiceConnectionStatus.Destroyed, () => {
    connection = null;
  });
};

export const joinVoice = (event: IpcMainInvokeEvent, guildId: string, channelId: string) => {
  const guild = client.guilds.cache.find((guild) => guild.id === guildId);

  if (!guild) {
    throw Error('Guild does not exist');
  }

  const channel = guild.channels.cache.find((channel) => channel.id === channelId);

  if (!channel) {
    throw Error('Channel does not exist');
  }

  if (connection) {
    connection.destroy();
  }

  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });
  updateEvents();
  bindIpcVoiceApiEvents(connection, event.sender, { guildId: guild.id, channelId: channel.id });
};

export const enableReceiver = () => {
  if (!connection || receiverEnabled) {
    return;
  }

  receiverEnabled = true;
  const receiver = connection.receiver;

  receiver.speaking.on('start', (userId) => {
    if (!receiverEnabled) return;

    const opusStream = receiver.subscribe(userId, {
      end: { behavior: EndBehaviorType.AfterSilence, duration: 200 },
    });
    const decoder = new prism.opus.Decoder({
      frameSize: 960,
      channels: 2,
      rate: 48000,
    });
    // const speaker = new Speaker({
    //   channels: 2,
    //   bitDepth: 16,
    //   sampleRate: 48000,
    // });
    // activeSpeakers.push(speaker);
    // opusStream.pipe(decoder).pipe(speaker);
    // opusStream.on('end', () => {
    //   speaker.end();
    //   const idx = activeSpeakers.indexOf(speaker);
    //   if (idx !== -1) activeSpeakers.splice(idx, 1);
    // });
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

  for (const sp of activeSpeakers) {
    sp.end();
  }

  activeSpeakers.length = 0;
};

export const leaveVoice = () => {
  if (!connection) {
    return;
  }

  disableReceiver();
  connection.destroy();
};
