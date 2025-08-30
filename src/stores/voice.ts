import { VoiceMember } from '@main/api/discord/types';
import { ipcRendererApiFunctions } from '@renderer/api';
import { create } from 'zustand';

interface VoicesState {
  members: Record<string, VoiceMember[] | null | undefined>;
  pullMembers(guildId: string): Promise<void>;
}

const useVoicesStore = create<VoicesState>()((set) => ({
  members: {},
  pullMembers: async (guildId) => {
    const response = await ipcRendererApiFunctions.getGuildVoiceMembers(guildId);

    if (!response.success) {
      set((prev) => ({ ...prev, members: {} }));
      console.error(`Failed to pull voice members: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, members: response.payload }));
  },
}));

export default useVoicesStore;
