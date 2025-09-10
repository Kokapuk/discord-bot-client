import { GuildTextChannel } from '@main/features/channels/types';
import Link from '@renderer/ui/Link';
import GuildBaseChannel, { GuildBaseChannelProps } from './GuildBaseChannel';

export type TextChannelBaseProps = { channel: GuildTextChannel };
export type TextChannelProps = TextChannelBaseProps & GuildBaseChannelProps;

export default function TextChannel({ channel, ...props }: TextChannelProps) {
  const channelNode = <GuildBaseChannel channel={channel} disabled={!channel.viewChannelPermission} {...props} />;

  if (channel.viewChannelPermission && !props.disabled) {
    return (
      <Link to={`${channel.id}`} width="100%" textDecoration="none">
        {channelNode}
      </Link>
    );
  }

  return channelNode;
}
