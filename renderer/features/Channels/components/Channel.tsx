import { SupportedChannelType, type Channel } from '@main/ipc/guilds/types';
import VoiceChannel from '@renderer/features/Voices/components/VoiceChannel';
import { useChannelContext } from '../context';
import TextChannel from './TextChannel';

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
