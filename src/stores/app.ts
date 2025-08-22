import { Channel, Guild, Message, Role, User } from '@main/api/types';
import { ipcRendererDiscordApiFunctions } from '@renderer/api/discord';
import { create } from 'zustand';

interface AppState {
  guilds: Guild[];
  pullGuilds(): Promise<void>;
  channels: Record<string, Channel[]>;
  pullChannels(guildId: string): Promise<void>;
  members: Record<string, User[]>;
  pullMembers(guildId: string): Promise<void>;
  roles: Record<string, Role[]>;
  pullRoles(guildId: string): Promise<void>;
  messages: Record<string, Message[]>;
  fetchMessages(channelId: string): Promise<void>;
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
  roles: {},
  pullRoles: async (guildId) => {
    const response = await ipcRendererDiscordApiFunctions.getGuildRoles(guildId);

    if (!response.success) {
      set((prev) => ({ ...prev, roles: { ...prev.roles, [guildId]: [] } }));
      console.error(`Failed to pull roles: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, roles: { ...prev.roles, [guildId]: response.payload } }));
  },
  messages: {},
  fetchMessages: async (channelId) => {
    const response = await ipcRendererDiscordApiFunctions.fetchChannelsMessages(channelId);

    if (!response.success) {
      set((prev) => ({ ...prev, messages: { ...prev.messages, [channelId]: [] } }));
      console.error(`Failed to fetch messages: ${response.error}`);
      return;
    }

    set((prev) => ({ ...prev, messages: { ...prev.messages, [channelId]: response.payload } }));
  },
}));

export default useAppStore;
