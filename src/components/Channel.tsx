import { SupportedChannelType, type Channel } from '@main/api/discord/types';
import { useChannelContext } from './ChannelContext';
import TextChannel from './TextChannel';
import VoiceChannel from './VoiceChannel';

export type ChannelProps = { channel: Channel };

export default function Channel({ channel }: ChannelProps) {
  const { activeChannel, unreadChannels } = useChannelContext();
  const active = activeChannel?.id === channel.id;
  const unread = unreadChannels?.includes(channel.id);

  switch (channel.type) {
    case SupportedChannelType.GuildText:
    case SupportedChannelType.GuildAnnouncement:
    case SupportedChannelType.PublicThread:
    case SupportedChannelType.PrivateThread:
      return <TextChannel channel={channel} active={active} unread={unread} />;
    case SupportedChannelType.GuildVoice:
    case SupportedChannelType.GuildStageVoice:
      return <VoiceChannel channel={channel} active={active} unread={unread} />;
  }
}
