import { Message } from '@main/api/types';
import { ipcRendererDiscordApiFunctions } from '@renderer/api/discord';
import { create } from 'zustand';

interface MessagesState {
  messages: Record<string, Message[] | null | undefined>;
  topReachedChannels: Record<string, boolean>;
  isFetchingMessages: boolean;
  fetchMessages(channelId: string): Promise<void>;
  addMessage(message: Message): void;
  removeMessage(message: { id: string; channelId: string }): void;
  updateMessage(message: Message): void;
  editingMessage: Message | null;
  setEditingMessage(editingMessage: Message | null): void;
  replyingMessage: Message | null;
  setReplyingMessage(replyingMessage: Message | null): void;
}

const useMessagesStore = create<MessagesState>()((set, get) => ({
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
  editingMessage: null,
  setEditingMessage: (editingMessage) => set({ editingMessage }),
  replyingMessage: null,
  setReplyingMessage: (replyingMessage) => set({ replyingMessage }),
}));

export default useMessagesStore;
