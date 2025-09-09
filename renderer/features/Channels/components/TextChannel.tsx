import { type TextChannel } from '@main/ipc/guilds/types';
import Link from '@renderer/ui/Link';
import BaseChannel, { BaseChannelProps } from './BaseChannel';

export type TextChannelBaseProps = { channel: TextChannel };
export type TextChannelProps = TextChannelBaseProps & BaseChannelProps;

export default function TextChannel({ channel, ...props }: TextChannelProps) {
  const channelNode = <BaseChannel channel={channel} disabled={!channel.viewChannelPermission} {...props} />;

  if (channel.viewChannelPermission && !props.disabled) {
    return (
      <Link to={`${channel.id}`} width="100%" textDecoration="none">
        {channelNode}
      </Link>
    );
  }

  return channelNode;
}
