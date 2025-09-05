import { VoiceConnectionStatus, VoiceMember } from '@main/ipc/voice/types';
import { create } from 'zustand';

interface VoicesState {
  members: Record<string, Record<string, VoiceMember[]>>;
  pullMembers(): Promise<void>;
  connectionStatus: VoiceConnectionStatus;
  setConnectionStatus(connectionStatus: VoiceConnectionStatus): void;
  activeChannel: { guildId: string; channelId: string } | null;
  setActiveChannel(activeChannel: VoicesState['activeChannel']): void;
  receiving: boolean;
  setReceiving(receiving: boolean): void;
  sending: boolean;
  setSending(sending: boolean): void;
}

const useVoicesStore = create<VoicesState>()((set) => ({
  members: {},
  pullMembers: async () => {
    const response = await window.ipcRenderer.invoke('getGuildsVoiceChannelsMembers');

    if (!response.success) {
      set((prev) => ({ ...prev, members: {} }));
      console.error(`Failed to pull voice members: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, members: response.payload }));
  },
  connectionStatus: VoiceConnectionStatus.Destroyed,
  setConnectionStatus: (connectionStatus) => {
    set({ connectionStatus });
  },
  activeChannel: null,
  setActiveChannel: (activeChannel) => {
    set({ activeChannel });
  },
  receiving: false,
  setReceiving: (receiving) => {
    set({ receiving });
  },
  sending: false,
  setSending: (sending) => {
    set({ sending });
  },
}));

export default useVoicesStore;
