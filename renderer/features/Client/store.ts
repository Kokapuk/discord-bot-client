import { User } from '@main/ipc/client/types';
import { create } from 'zustand';

interface ClientState {
  clientUser: User | null;
  pullClientUser(): Promise<void>;
  mediaVolume: number;
  setMediaVolume(volume: number): void;
}

const useClientStore = create<ClientState>()((set) => ({
  clientUser: null,
  pullClientUser: async () => {
    const response = await window.ipcRenderer.invoke('getClientUser');

    if (!response.success) {
      set({ clientUser: null });
      console.error(`Failed to pull client: ${response.error}`);
      return;
    }

    set({ clientUser: response.payload });
  },
  mediaVolume: 0.3,
  setMediaVolume: (mediaVolume) => set({ mediaVolume }),
}));

export default useClientStore;
