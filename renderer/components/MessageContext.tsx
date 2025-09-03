import { User } from '@main/ipc/client/types';
import { Channel, GuildMember, Role } from '@main/ipc/guilds/types';
import { Message } from '@main/ipc/messages/types';
import { createContext, useContext } from 'react';

export type MessageContext = {
  clientUser: User;
  channel: Channel;
  messages: Message[];
  channels?: Channel[];
  users?: (User | GuildMember)[];
  roles?: Role[];
  onEdit?(message: Message): void;
  onReply?(message: Message): void;
};

const MessageContext = createContext<MessageContext | null>(null);

export const useMessageContext = () => {
  const ctx = useContext(MessageContext);

  if (!ctx) {
    throw Error('useMessageContext must be used inside MessageProvider');
  }

  return ctx;
};

export const MessageProvider = MessageContext.Provider;
