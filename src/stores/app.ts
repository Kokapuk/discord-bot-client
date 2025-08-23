import { Channel, Guild, Message, Role, User } from '@main/api/types';
import { ipcRendererDiscordApiFunctions } from '@renderer/api/discord';
import { create } from 'zustand';

interface AppState {
  guilds: Guild[] | null;
  pullGuilds(): Promise<void>;
  channels: Record<string, Channel[] | null | undefined>;
  pullChannels(guildId: string): Promise<void>;
  members: Record<string, User[] | null | undefined>;
  pullMembers(guildId: string): Promise<void>;
  roles: Record<string, Role[] | null | undefined>;
  pullRoles(guildId: string): Promise<void>;
  messages: Record<string, Message[] | null | undefined>;
  topReachedChannels: Record<string, boolean>;
  isFetchingMessages: boolean;
  fetchMessages(channelId: string): Promise<void>;
  addMessage(message: Message): void;
  removeMessage(message: { id: string; channelId: string }): void;
  updateMessage(message: Message): void;
  mediaVolume: number;
  setMediaVolume(volume: number): void;
}

const useAppStore = create<AppState>()((set, get) => ({
  guilds: null,
  pullGuilds: async () => {
    const response = await ipcRendererDiscordApiFunctions.getGuilds();

    if (!response.success) {
      set({ guilds: null });
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
  topReachedChannels: {},
  isFetchingMessages: false,
  fetchMessages: async (channelId) => {
    const state = get();

    if (state.topReachedChannels[channelId] || state.isFetchingMessages) {
      return;
    }

    const lastChannelMessageId = state.messages[channelId]?.[state.messages[channelId].length - 1].id;

    set({ isFetchingMessages: true });
    const response = await ipcRendererDiscordApiFunctions.fetchChannelsMessages(channelId, lastChannelMessageId);
    set({ isFetchingMessages: false });

    if (!response.success) {
      set((prev) => ({ ...prev, messages: { ...prev.messages, [channelId]: [] } }));
      console.error(`Failed to fetch messages: ${response.error}`);
      return;
    }

    set((prev) => ({
      ...prev,
      messages: {
        ...prev.messages,
        [channelId]: [...(prev.messages[channelId] ?? []), ...response.payload.messages],
      },
      topReachedChannels: { ...prev.topReachedChannels, [channelId]: response.payload.topReached },
    }));
  },
  addMessage: (message) => {
    set((prev) => ({
      ...prev,
      messages: { ...prev.messages, [message.channelId]: [message, ...(prev.messages[message.channelId] ?? [])] },
    }));
  },
  removeMessage(removeMessage) {
    set((prev) => ({
      ...prev,
      messages: {
        ...prev.messages,
        [removeMessage.channelId]: (prev.messages[removeMessage.channelId] ?? []).filter(
          (message) => message.id !== removeMessage.id
        ),
      },
    }));
  },
  updateMessage: (updateMessage) => {
    set((prev) => {
      const clonedPrev: typeof prev = JSON.parse(JSON.stringify(prev));
      const channelMessages = clonedPrev.messages[updateMessage.channelId];

      if (!channelMessages) {
        return prev;
      }

      const messageToUpdateIndex = channelMessages.findIndex((message) => message.id === updateMessage.id);

      if (messageToUpdateIndex === -1) {
        return prev;
      }

      channelMessages[messageToUpdateIndex] = updateMessage;

      return clonedPrev;
    });
  },
  mediaVolume: 0.3,
  setMediaVolume: (mediaVolume) => set({ mediaVolume }),
}));

export default useAppStore;
