import { ChannelType } from '@main/features/channels/types';
import VoiceChannel from '@renderer/features/Channels/components/VoiceChannel';
import { useChannelContext } from '../context';
import { GuildBaseChannelProps } from './GuildBaseChannel';
import TextChannel from './TextChannel';

export default function GuildChannel({ channel, ...props }: GuildBaseChannelProps) {
  const { activeChannel, unreadChannels } = useChannelContext();
  const active = activeChannel?.id === channel.id;
  const unread = unreadChannels?.includes(channel.id);

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
}
