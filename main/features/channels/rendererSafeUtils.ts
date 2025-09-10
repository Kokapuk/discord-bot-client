import { Channel, ChannelType, DmChannel, GuildChannel, GuildTextChannel, GuildVoiceChannel } from './types';

export const GuildChannelTypes = [
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
  ChannelType.GuildVoice,
  ChannelType.GuildStageVoice,
] as const;

export const isChannelGuildBased = (channel: Channel): channel is GuildChannel => {
  return GuildChannelTypes.includes(channel.type as number);
};

export const GuildTextChannelTypes = [
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
] as const;

export const isChannelGuildTextBased = (channel: Channel): channel is GuildTextChannel => {
  return GuildTextChannelTypes.includes(channel.type as number);
};

export const GuildVoiceChannelTypes = [ChannelType.GuildVoice, ChannelType.GuildStageVoice] as const;

export const isChannelGuildVoiceBased = (channel: Channel): channel is GuildVoiceChannel => {
  return GuildVoiceChannelTypes.includes(channel.type as number);
};

export const isChannelDmBased = (channel: Channel): channel is DmChannel => {
  return channel.type === ChannelType.DM;
};
