import { Channel } from '@main/features/channels/types';
import { GuildMember, Role } from '@main/features/guilds/types';
import { Message } from '@main/features/messages/types';
import { User } from '@main/features/users/types';
import { createContext } from 'use-context-selector';

export type MessageContext = {
  clientUser: User;
  channel: Channel;
  messages: Message[];
  onPaginate?(): void;
  channels?: Channel[];
  users?: (User | GuildMember)[];
  roles?: Role[];
  onEdit?(message: Message): void;
  onReply?(message: Message): void;
  
};

export const MessageContext = createContext<MessageContext | null>(null);
