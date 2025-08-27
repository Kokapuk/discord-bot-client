import { Channel, Message, Role, User } from '@main/api/types';
import { createContext, useContext } from 'react';

export type MessageContext = {
  client: User;
  channel: Channel;
  messages: Message[];
  channels?: Channel[];
  users?: User[];
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
