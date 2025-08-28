import { User } from '@main/api/discord/types';
import { ipcRendererApiFunctions } from '@renderer/api';
import { create } from 'zustand';

interface AppState {
  client: User | null;
  pullClient(): Promise<void>;
  mediaVolume: number;
  setMediaVolume(volume: number): void;
}

const useAppStore = create<AppState>()((set) => ({
  client: null,
  pullClient: async () => {
    const response = await ipcRendererApiFunctions.getClient();

    if (!response.success) {
      set({ client: null });
      console.error(`Failed to pull client: ${response.error}`);
      return;
    }

    set({ client: response.payload });
  },
  mediaVolume: 0.3,
  setMediaVolume: (mediaVolume) => set({ mediaVolume }),
}));

export default useAppStore;
