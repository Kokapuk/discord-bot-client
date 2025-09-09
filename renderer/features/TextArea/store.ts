import { Message } from '@main/ipc/messages/types';
import { create } from 'zustand';

interface TextAreaState {
  editingMessage: Message | null;
  setEditingMessage(editingMessage: Message | null): void;
  replyingMessage: Message | null;
  setReplyingMessage(replyingMessage: Message | null): void;
}

const useTextAreaStore = create<TextAreaState>()((set) => ({
  editingMessage: null,
  setEditingMessage: (editingMessage) => set({ editingMessage }),
  replyingMessage: null,
  setReplyingMessage: (replyingMessage) => set({ replyingMessage }),
}));

export default useTextAreaStore;
