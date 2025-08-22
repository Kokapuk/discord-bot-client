import { create } from 'zustand';
import { Channel, Guild, User } from '../../electron/api/types';
import { ipcRendererDiscordApiFunctions } from '../api/discord';

interface AppState {
  guilds: Guild[];
  pullGuilds(): Promise<void>;
  channels: Record<string, Channel[]>;
  pullChannels(guildId: string): Promise<void>;
  members: Record<string, User[]>;
  pullMembers(guildId: string): Promise<void>;
}

const useAppStore = create<AppState>()((set) => ({
  guilds: [],
  pullGuilds: async () => {
    const response = await ipcRendererDiscordApiFunctions.getGuilds();

    if (!response.success) {
      set({ guilds: [] });
      console.error(`Failed to pull guilds: ${response.error}`);
      return;
    }

    set({ guilds: response.payload });
  },
  channels: {},
  pullChannels: async (guildId) => {
    const response = await ipcRendererDiscordApiFunctions.getGuildChannels(guildId);

    if (!response.success) {
      set((prev) => ({ ...prev, channels: { ...prev.channels, [guildId]: [] } }));
      console.error(`Failed to pull channels: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, channels: { ...prev.channels, [guildId]: response.payload } }));
  },
  members: {},
  pullMembers: async (guildId) => {
    const response = await ipcRendererDiscordApiFunctions.getGuildMembers(guildId);

    if (!response.success) {
      set((prev) => ({ ...prev, members: { ...prev.members, [guildId]: [] } }));
      console.error(`Failed to pull members: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, members: { ...prev.members, [guildId]: response.payload } }));
  },
}));

export default useAppStore;
