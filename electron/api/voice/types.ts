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
