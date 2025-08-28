import { Channel, Message, Role, User } from '@main/api/types';
import { createContext, useContext } from 'react';

export type TextareaContext = {
  channel: Channel;
  users?: User[];
  roles?: Role[];
  editingMessage?: Message | null;
  onEditClose?(): void;
  replyingMessage?: Message | null;
  onReplyClose?(): void;
};

const TextareaContext = createContext<TextareaContext | null>(null);

export const useTextareaContext = () => {
  const ctx = useContext(TextareaContext);

  if (!ctx) {
    throw Error('useTextareaContext must be used inside MessageProvider');
  }

  return ctx;
};

export const TextareaProvider = TextareaContext.Provider;
