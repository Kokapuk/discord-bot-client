import { Channel } from '@main/features/channels/types';
import { GuildMember, Role } from '@main/features/guilds/types';
import { Message } from '@main/features/messages/types';
import { User } from '@main/features/users/types';
import { createContext } from 'use-context-selector';

export type TextareaContext = {
  channel: Channel;
  users?: (User | GuildMember)[];
  roles?: Role[];
  editingMessage?: Message | null;
  onEditClose?(): void;
  replyingMessage?: Message | null;
  onReplyClose?(): void;
};

export const TextareaContext = createContext<TextareaContext | null>(null);
