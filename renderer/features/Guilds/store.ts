import { GuildChannel } from '@main/features/channels/types';
import { Guild, GuildMember, Role } from '@main/features/guilds/types';
import { create } from 'zustand';

interface GuildsState {
  guilds: Guild[] | null;
  pullGuilds(): Promise<void>;
  channels: Record<string, GuildChannel[]>;
  pullChannels(): Promise<void>;
  members: Record<string, GuildMember[]>;
  pullMembers(): Promise<void>;
  roles: Record<string, Role[]>;
  pullRoles(): Promise<void>;
}

const useGuildsStore = create<GuildsState>()((set) => ({
  guilds: null,
  pullGuilds: async () => {
    const response = await window.ipcRenderer.invoke('getGuilds');

    if (!response.success) {
      set({ guilds: null });
      console.error(`Failed to pull guilds: ${response.error}`);
      return;
    }

    set({ guilds: response.payload });
  },
  channels: {},
  pullChannels: async () => {
    const response = await window.ipcRenderer.invoke('getGuildsChannels');

    if (!response.success) {
      set((prev) => ({ ...prev, channels: {} }));
      console.error(`Failed to pull channels: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, channels: response.payload }));
  },
  members: {},
  pullMembers: async () => {
    const response = await window.ipcRenderer.invoke('getGuildsMembers');

    if (!response.success) {
      set((prev) => ({ ...prev, members: {} }));
      console.error(`Failed to pull members: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, members: response.payload }));
  },
  roles: {},
  pullRoles: async () => {
    const response = await window.ipcRenderer.invoke('getGuildsRoles');

    if (!response.success) {
      set((prev) => ({ ...prev, roles: {} }));
      console.error(`Failed to pull roles: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, roles: response.payload }));
  },
}));

export default useGuildsStore;
