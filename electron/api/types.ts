import { ChannelType } from 'discord.js';

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
}

export interface Guild {
  id: string;
  name: string;
  iconUrl: string | null;
  channels: Channel[];
}
