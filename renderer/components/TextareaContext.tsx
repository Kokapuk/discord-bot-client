import { User } from '@main/ipc/client/types';
import { Channel, GuildMember, Role } from '@main/ipc/guilds/types';
import { Message } from '@main/ipc/messages/types';
import { createContext, useContext } from 'react';

export type TextareaContext = {
  channel: Channel;
  users?: (User | GuildMember)[];
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
