import { Channel, SupportedChannelType, VoiceChannel } from '../guilds/types';

export const isChannelVoiceBased = (channel: Channel): channel is VoiceChannel => {
  return channel.type === SupportedChannelType.GuildVoice || channel.type === SupportedChannelType.GuildStageVoice;
};
