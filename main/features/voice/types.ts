import { User } from '@main/features/users/types';

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

export type OutputAudioSource = 'systemwide' | 'isolatedExternal' | 'isolatedExternalWithLocalEcho' | 'isolatedCapture';

export interface OutputAudioWindowSource {
  processId: number;
  processName: string;
  title: string;
  icon: string | null;
}
