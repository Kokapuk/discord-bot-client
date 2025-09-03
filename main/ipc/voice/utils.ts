import { VoiceState as DiscordVoiceState, GuildMember, PermissionFlagsBits } from 'discord.js';
import { DesktopCapturerSource } from 'electron';
import { AudioSource, VoiceMember, VoiceState } from './types';

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

export const structAudioSource = (source: DesktopCapturerSource): AudioSource => ({
  name: source.name,
  windowId: source.id,
  appIconDataUrl: source.appIcon.toDataURL(),
  type: 'window',
});

export const structVoiceState = (voiceState: DiscordVoiceState): VoiceState => ({
  guildId: voiceState.guild.id,
  channelId: voiceState.channelId,
  member: voiceState.member ? structVoiceMember(voiceState.member) : null,
});
