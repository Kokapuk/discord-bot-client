import { DmChannel } from '@main/features/channels/types';
import { create } from 'zustand';

interface DmsState {
  channels: Record<string, DmChannel>;
  pullChannel(userId: string): void;
}

const useDmsStore = create<DmsState>()((set) => ({
  channels: {},
  pullChannel: async (userId: string) => {
    const response = await window.ipcRenderer.invoke('getDmChannel', userId);

    if (!response.success) {
      console.error(`Failed to pull channels: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, channels: { ...prev.channels, [userId]: response.payload } }));
  },
}));

export default useDmsStore;
