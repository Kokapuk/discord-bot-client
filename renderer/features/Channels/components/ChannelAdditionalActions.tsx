import { Stack, StackProps } from '@chakra-ui/react';
import { Channel } from '@main/ipc/guilds/types';
import { isChannelVoiceBased } from '@main/ipc/voice/rendererSafeUtils';
import Link from '@renderer/ui/Link';
import { RefAttributes } from 'react';
import { FaMessage } from 'react-icons/fa6';
import ChannelAdditionalActionButton from './ChannelAdditionalActionButton';

export type ChannelAdditionalActionsBaseProps = { channel: Channel };
export type ChannelAdditionalActionsProps = ChannelAdditionalActionsBaseProps &
  StackProps &
  RefAttributes<HTMLDivElement>;

export default function ChannelAdditionalActions({ channel, ...props }: ChannelAdditionalActionsProps) {
  return (
    <Stack direction="row" {...props}>
      {isChannelVoiceBased(channel) && channel.viewChannelPermission && channel.connectPermission && (
        <Link to={`${channel.id}`}>
          <ChannelAdditionalActionButton size="xs" variant="ghost">
            <FaMessage />
          </ChannelAdditionalActionButton>
        </Link>
      )}
    </Stack>
  );
}
