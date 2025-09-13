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

export enum OutputAudioSourceType {
  Systemwide = 'systemwide',
  IsolatedExternal = 'isolatedExternal',
  LoopbackCapture = 'isolatedCapture',
  Device = 'device',
}

export interface OutputAudioSourceBase {
  type: OutputAudioSourceType;
  name: string;
}

export interface OutputAudioSourceSystemwide extends OutputAudioSourceBase {
  type: OutputAudioSourceType.Systemwide;
}

export interface OutputAudioSourceIsolatedExternal extends OutputAudioSourceBase {
  type: OutputAudioSourceType.IsolatedExternal;
  withLocalEcho?: boolean;
}

export interface LoopbackCaptureWindow {
  processId: number;
  processName: string;
  title: string;
  icon: string | null;
}

export interface OutputAudioSourceLoopbackCapture extends OutputAudioSourceBase {
  type: OutputAudioSourceType.LoopbackCapture;
  window: LoopbackCaptureWindow;
}

export interface OutputAudioSourceDevice extends OutputAudioSourceBase {
  type: OutputAudioSourceType.Device;
  device: MediaDeviceInfo;
}

export type OutputAudioSource =
  | OutputAudioSourceSystemwide
  | OutputAudioSourceIsolatedExternal
  | OutputAudioSourceLoopbackCapture
  | OutputAudioSourceDevice;
