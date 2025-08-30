import { Channel, VoiceMember } from '@main/api/discord/types';
import { createContext, useContext } from 'react';

export type ChannelContext = {
  channels: Channel[];
  activeChannel?: Channel;
  unreadChannels?: string[];
  voiceMembers?: Record<string, VoiceMember[] | null | undefined>;
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
