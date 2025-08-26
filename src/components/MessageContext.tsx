import { Channel, Role, User } from '@main/api/types';
import { createContext, useContext } from 'react';

export type MessageContext = {
  client: User;
  activeChannel: Channel;
  channels?: Channel[];
  members?: User[];
  roles?: Role[];
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
