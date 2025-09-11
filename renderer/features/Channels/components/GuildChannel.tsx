import { ChannelType } from '@main/features/channels/types';
import VoiceChannel from '@renderer/features/Channels/components/VoiceChannel';
import { memo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { ChannelContext } from '../context';
import { GuildBaseChannelProps } from './GuildBaseChannel';
import TextChannel from './TextChannel';

const GuildChannel = ({ channel, ...props }: GuildBaseChannelProps) => {
  const active = useContextSelector(ChannelContext, (c) => c?.activeChannel?.id === channel.id);
  const unread = useContextSelector(ChannelContext, (c) => c?.unreadChannels?.includes(channel.id));

  switch (channel.type) {
    case ChannelType.GuildText:
    case ChannelType.GuildAnnouncement:
    case ChannelType.PublicThread:
    case ChannelType.PrivateThread:
      return <TextChannel channel={channel} active={active} unread={unread} {...props} />;
    case ChannelType.GuildVoice:
    case ChannelType.GuildStageVoice:
      return <VoiceChannel channel={channel} active={active} unread={unread} {...props} />;
  }
};

export default memo(GuildChannel);
