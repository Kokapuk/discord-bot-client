import { type DmChannel } from '@main/features/channels/types';
import Avatar, { AvatarProps } from '@renderer/ui/Avatar';
import Link from '@renderer/ui/Link';
import { Tooltip } from '@renderer/ui/Tooltip';
import UnreadIndicator from '@renderer/ui/UnreadIndicator';

export type DmChannelBaseProps = { channel: DmChannel; unread?: boolean };
export type DmChannelProps = DmChannelBaseProps & Partial<AvatarProps>;

export default function DmChannel({ channel, unread, ...props }: DmChannelProps) {
  return (
    <Tooltip content={channel.recipient?.displayName} positioning={{ placement: 'right' }}>
      <Link to={`/dm/${channel.id}`} textDecoration="none" position="relative">
        {unread && <UnreadIndicator />}
        <Avatar src={channel.recipient?.displayAvatarUrl ?? ''} size="10" {...props} />
      </Link>
    </Tooltip>
  );
}
