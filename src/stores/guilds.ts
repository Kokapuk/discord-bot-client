import { Channel, Guild, Role, User } from '@main/api/discord/types';
import { ipcRendererApiFunctions } from '@renderer/api';
import { create } from 'zustand';

interface GuildsState {
  guilds: Guild[] | null;
  pullGuilds(): Promise<void>;
  channels: Record<string, Channel[] | null | undefined>;
  pullChannels(guildId: string): Promise<void>;
  members: Record<string, User[] | null | undefined>;
  pullMembers(guildId: string): Promise<void>;
  roles: Record<string, Role[] | null | undefined>;
  pullRoles(guildId: string): Promise<void>;
}

const useGuildsStore = create<GuildsState>()((set) => ({
  guilds: null,
  pullGuilds: async () => {
    const response = await ipcRendererApiFunctions.getGuilds();

    if (!response.success) {
      set({ guilds: null });
      console.error(`Failed to pull guilds: ${response.error}`);
      return;
    }

    set({ guilds: response.payload });
  },
  channels: {},
  pullChannels: async (guildId) => {
    const response = await ipcRendererApiFunctions.getGuildChannels(guildId);

    if (!response.success) {
      set((prev) => ({ ...prev, channels: { ...prev.channels, [guildId]: [] } }));
      console.error(`Failed to pull channels: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, channels: { ...prev.channels, [guildId]: response.payload } }));
  },
  members: {},
  pullMembers: async (guildId) => {
    const response = await ipcRendererApiFunctions.getGuildMembers(guildId);

    if (!response.success) {
      set((prev) => ({ ...prev, members: { ...prev.members, [guildId]: [] } }));
      console.error(`Failed to pull members: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, members: { ...prev.members, [guildId]: response.payload } }));
  },
  roles: {},
  pullRoles: async (guildId) => {
    const response = await ipcRendererApiFunctions.getGuildRoles(guildId);

    if (!response.success) {
      set((prev) => ({ ...prev, roles: { ...prev.roles, [guildId]: [] } }));
      console.error(`Failed to pull roles: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, roles: { ...prev.roles, [guildId]: response.payload } }));
  },
}));

export default useGuildsStore;
