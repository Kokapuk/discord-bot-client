import { Channel } from '@main/features/channels/types';
import { GuildMember, Role } from '@main/features/guilds/types';
import { Message } from '@main/features/messages/types';
import { User } from '@main/features/users/types';
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
