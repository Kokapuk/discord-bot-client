import { SupportedChannelType, type Channel } from '@main/ipc/guilds/types';
import VoiceChannel from '@renderer/features/Channels/components/VoiceChannel';
import { useChannelContext } from '../context';
import { BaseChannelProps } from './BaseChannel';
import TextChannel from './TextChannel';

export type ChannelBaseProps = { channel: Channel };
export type ChannelProps = ChannelBaseProps & Omit<BaseChannelProps, 'channel'>;

export default function Channel({ channel, ...props }: ChannelProps) {
  const { activeChannel, unreadChannels } = useChannelContext();
  const active = activeChannel?.id === channel.id;
  const unread = unreadChannels?.includes(channel.id);

  switch (channel.type) {
    case SupportedChannelType.GuildText:
    case SupportedChannelType.GuildAnnouncement:
    case SupportedChannelType.PublicThread:
    case SupportedChannelType.PrivateThread:
      return <TextChannel channel={channel} active={active} unread={unread} {...props} />;
    case SupportedChannelType.GuildVoice:
    case SupportedChannelType.GuildStageVoice:
      return <VoiceChannel channel={channel} active={active} unread={unread} {...props} />;
  }
}
