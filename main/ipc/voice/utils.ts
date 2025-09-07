import { createAudioPlayer, NoSubscriberBehavior } from '@discordjs/voice';
import { VoiceState as DiscordVoiceState, GuildMember, PermissionFlagsBits } from 'discord.js';
import { BrowserWindow, session, WebContents } from 'electron';
import { PassThrough } from 'stream';
import createAudioCaptureWindow from '../../utils/createAudioCaptureWindow';
import { ipcMain } from './handle';
import { VoiceMember, VoiceState } from './types';

let audioCaptureWindow: BrowserWindow | null = null;

export const audioPlayer = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause,
  },
});
export const audioOutputStream: { current: PassThrough | null } = { current: null };

export const structVoiceMember = (user: GuildMember): VoiceMember => ({
  id: user.id,
  displayName: user.displayName,
  displayAvatarUrl: user.displayAvatarURL({ size: 64 }),
  selfMute: user.voice.selfMute,
  selfDeaf: user.voice.selfDeaf,
  serverMute: user.voice.serverMute,
  serverDeaf: user.voice.serverDeaf,
  canSpeak: user.voice.channel?.permissionsFor(user).has(PermissionFlagsBits.Speak) ?? false,
});

export const structVoiceState = (voiceState: DiscordVoiceState): VoiceState => ({
  guildId: voiceState.guild.id,
  channelId: voiceState.channelId,
  member: voiceState.member ? structVoiceMember(voiceState.member) : null,
});

export const startHandlingOutputAudioSystemwideSource = async () => {
  session.defaultSession.setDisplayMediaRequestHandler((_, callback) => {
    callback({ audio: 'loopback' });
  });
};

export const startHandlingOutputAudioIsolatedExternalSource = async (window: BrowserWindow, enableLocalEcho?: true) => {
  return await new Promise<void>((resolve) =>
    session.defaultSession.setDisplayMediaRequestHandler((_, callback) => {
      const audioCaptureWindowData = createAudioCaptureWindow(window);
      audioCaptureWindow = audioCaptureWindowData.window;

      callback({ audio: audioCaptureWindowData.webFrameMain, enableLocalEcho: enableLocalEcho });

      audioCaptureWindow.once('closed', () => {
        if (!window.isDestroyed()) {
          stopHandlingAudioOutputSource(window.webContents);
        }
      });

      resolve();
    })
  );
};

export const stopHandlingAudioOutputIsolatedExternalSource = () => {
  if (audioCaptureWindow && !audioCaptureWindow.isDestroyed()) {
    audioCaptureWindow.close();
  }

  audioCaptureWindow = null;
};

export const stopHandlingAudioOutputSource = async (webContents: WebContents) => {
  stopHandlingAudioOutputIsolatedExternalSource();

  session.defaultSession.setDevicePermissionHandler(null);

  try {
    ipcMain.send(webContents, 'audioOutputHandlingStop');
    audioPlayer.stop();
    audioOutputStream.current?.end();
    audioOutputStream.current = null;
  } catch {}
};
