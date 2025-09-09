import { type TextChannel } from '@main/ipc/guilds/types';
import Link from '@renderer/ui/Link';
import BaseChannel, { BaseChannelProps } from './BaseChannel';
import { RefAttributes } from 'react';

export type TextChannelProps = { channel: TextChannel } & Omit<BaseChannelProps, 'channel'>;

export default function TextChannel({ channel, ...props }: TextChannelProps & RefAttributes<HTMLButtonElement>) {
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
