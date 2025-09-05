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

export const stopHandlingAudioOutputIsolatedExternalSource = async () => {
  if (audioCaptureWindow && !audioCaptureWindow.isDestroyed()) {
    audioCaptureWindow.removeAllListeners('close');
    audioCaptureWindow.close();
  }

  audioCaptureWindow = null;
  session.defaultSession.setDevicePermissionHandler(null);
};

export const stopHandlingAudioOutputSource = async (webContents: WebContents) => {
  audioPlayer.stop();
  audioOutputStream.current = null;

  await stopHandlingAudioOutputIsolatedExternalSource();

  try {
    ipcMain.send(webContents, 'audioOutputHandlingStop');
  } catch {}
};

export const startHandlingOutputAudioIsolatedExternalSource = async (window: BrowserWindow) => {
  return await new Promise<void>((resolve) =>
    session.defaultSession.setDisplayMediaRequestHandler((_, callback) => {
      audioCaptureWindow = createAudioCaptureWindow(window);
      callback({ audio: audioCaptureWindow.webContents.mainFrame, enableLocalEcho: false });

      audioCaptureWindow.once('closed', () => stopHandlingAudioOutputSource(window.webContents));

      resolve();
    })
  );
};
