import { Box, BoxProps } from '@chakra-ui/react';
import { type VoiceChannel } from '@main/api/discord/types';
import { RefAttributes } from 'react';
import BaseChannel, { BaseChannelProps } from './BaseChannel';
import ChannelAdditionalActions from './ChannelAdditionalActions';

export type VoiceChannelProps = {
  channel: VoiceChannel;
  wrapperProps?: BoxProps & RefAttributes<HTMLDivElement>;
} & Omit<BaseChannelProps, 'channel'>;

export default function VoiceChannel({
  channel,
  wrapperProps,
  ...props
}: VoiceChannelProps & RefAttributes<HTMLButtonElement>) {
  return (
    <Box className="group" width="100%" position="relative" {...wrapperProps}>
      <BaseChannel channel={channel} flexShrink="1" disabled={!channel.connectPermission} {...props} />
      <ChannelAdditionalActions
        channel={channel}
        position="absolute"
        top="50%"
        right="1"
        transform="translateY(-50%)"
        visibility="hidden"
        _groupHover={{ visibility: 'visible' }}
      />
    </Box>
  );
}
