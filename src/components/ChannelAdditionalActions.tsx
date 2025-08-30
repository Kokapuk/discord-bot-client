import { IconButton, Stack, StackProps } from '@chakra-ui/react';
import { Channel, isChannelVoiceBased } from '@main/api/discord/types';
import { RefAttributes } from 'react';
import { FaMessage } from 'react-icons/fa6';
import { Link } from 'react-router';

export type ChannelAdditionalActionsProps = { channel: Channel } & StackProps;

export default function ChannelAdditionalActions({
  channel,
  ...props
}: ChannelAdditionalActionsProps & RefAttributes<HTMLDivElement>) {
  return (
    <Stack direction="row" {...props}>
      {isChannelVoiceBased(channel) && channel.viewChannelPermission && channel.connectPermission && (
        <Link to={`${channel.id}`}>
          <IconButton size="xs" variant="ghost">
            <FaMessage />
          </IconButton>
        </Link>
      )}
    </Stack>
  );
}
