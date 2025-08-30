import { SupportedChannelType, type Channel } from '@main/api/discord/types';
import TextChannel from './TextChannel';
import VoiceChannel from './VoiceChannel';

export type ChannelProps = { channel: Channel; active?: boolean; unread?: boolean };

export default function Channel({ channel, active, unread }: ChannelProps) {
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
