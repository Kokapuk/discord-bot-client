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
