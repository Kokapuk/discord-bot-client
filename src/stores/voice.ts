import { VoiceMember } from '@main/api/discord/types';
import { VoiceConnectionStatus } from '@main/api/voice/types';
import { ipcRendererApiFunctions } from '@renderer/api';
import { create } from 'zustand';

interface VoicesState {
  members: Record<string, Record<string, VoiceMember[]>>;
  pullMembers(): Promise<void>;
  connectionStatus: VoiceConnectionStatus;
  setConnectionStatus(connectionStatus: VoiceConnectionStatus): void;
  activeChannel: { guildId: string; channelId: string } | null;
  setActiveChannel(activeChannel: VoicesState['activeChannel']): void;
}

const useVoicesStore = create<VoicesState>()((set) => ({
  members: {},
  pullMembers: async () => {
    const response = await ipcRendererApiFunctions.getGuildsVoiceChannelsMembers();

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
}));

export default useVoicesStore;
