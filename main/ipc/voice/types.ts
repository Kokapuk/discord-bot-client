import { User } from '../client/types';

export interface VoiceMember extends Pick<User, 'id' | 'displayName' | 'displayAvatarUrl'> {
  selfMute: boolean | null;
  selfDeaf: boolean | null;
  serverMute: boolean | null;
  serverDeaf: boolean | null;
  canSpeak: boolean;
}

export enum VoiceConnectionStatus {
  Connecting = 'connecting',
  Signalling = 'signalling',
  Ready = 'ready',
  Disconnected = 'disconnected',
  Destroyed = 'destroyed',
}

export interface VoiceConnectionState {
  status: VoiceConnectionStatus;
}

export interface VoiceState {
  guildId: string;
  channelId: string | null; 
  member: VoiceMember | null;
}

export interface WindowAudioSource {
  name: string;
  windowId: string;
  appIconDataUrl: string;
  type: 'window';
}

export interface OutputDeviceAudioSource {
  name: string;
  type: 'outputDevice';
}

export type AudioSource = WindowAudioSource | OutputDeviceAudioSource;
