import { Channel, GuildChannel } from '@main/features/channels/types';
import { createContext } from 'use-context-selector';

export type ChannelContext = {
  channels?: GuildChannel[];
  activeChannel?: Channel;
  unreadChannels?: string[];
};

export const ChannelContext = createContext<ChannelContext | null>(null);
