import { VoiceConnectionStatus } from '@main/api/voice/types';

export const handleIpcRendererVoiceApiConnectionStatusUpdateEvent = (
  callback: (status: VoiceConnectionStatus, activeChannel: { guildId: string; channelId: string }) => void
) => {
  const unsubscribe = window.ipcRenderer.on('voiceConnectionStatusUpdate', (_, status, activeChannel) =>
    callback(status, activeChannel)
  );

  return unsubscribe;
};
