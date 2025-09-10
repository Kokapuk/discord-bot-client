import { Channel, GuildChannel } from '@main/features/channels/types';
import { createContext, useContext } from 'react';

export type ChannelContext = {
  channels?: GuildChannel[];
  activeChannel?: Channel;
  unreadChannels?: string[];
};

const ChannelContext = createContext<ChannelContext | null>(null);

export const useChannelContext = () => {
  const ctx = useContext(ChannelContext);

  if (!ctx) {
    throw Error('useChannelContext must be used inside ChannelProvider');
  }

  return ctx;
};

export const ChannelProvider = ChannelContext.Provider;
