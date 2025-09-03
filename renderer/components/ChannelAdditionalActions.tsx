import { IconButton, Stack, StackProps } from '@chakra-ui/react';
import { Channel } from '@main/ipc/guilds/types';
import { isChannelVoiceBased } from '@main/ipc/voice/rendererSafeUtils';
import { Tooltip } from '@renderer/ui/tooltip';
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
        <Tooltip content="Text channel">
          <Link to={`${channel.id}`}>
            <IconButton size="xs" variant="ghost">
              <FaMessage />
            </IconButton>
          </Link>
        </Tooltip>
      )}
    </Stack>
  );
}
