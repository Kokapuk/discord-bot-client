import { Box, BoxProps, Stack, Text } from '@chakra-ui/react';
import { type VoiceChannel } from '@main/ipc/guilds/types';
import { RefAttributes } from 'react';
import BaseChannel, { BaseChannelProps } from './BaseChannel';
import ChannelAdditionalActions from './ChannelAdditionalActions';
import { useChannelContext } from './ChannelContext';
import VoiceMemberList from './VoiceMemberList';

export type VoiceChannelProps = {
  channel: VoiceChannel;
  wrapperProps?: BoxProps & RefAttributes<HTMLDivElement>;
} & Omit<BaseChannelProps, 'channel'>;

export default function VoiceChannel({
  channel,
  wrapperProps,
  ...props
}: VoiceChannelProps & RefAttributes<HTMLButtonElement>) {
  const { voiceMembers } = useChannelContext();
  const membersInVoice = voiceMembers?.[channel.guidId]?.[channel.id]?.length ?? 0;
  const userLimitReached = channel.userLimit ? (membersInVoice ?? 0) >= channel.userLimit : false;

  return (
    <Stack gap="1">
      <Box className="group" width="100%" position="relative" {...wrapperProps}>
        <BaseChannel
          channel={channel}
          disabled={!channel.connectPermission || !channel.viewChannelPermission || userLimitReached}
          onClick={() => window.ipcRenderer.invoke('joinVoice', channel.guidId, channel.id)}
          {...props}
        />
        <ChannelAdditionalActions
          channel={channel}
          position="absolute"
          top="50%"
          right="1"
          transform="translateY(-50%)"
          visibility="hidden"
          _groupHover={{ visibility: 'visible' }}
        />
        {!!channel.userLimit && !!voiceMembers && (
          <Text
            fontSize="xs"
            color="colorPalette.fg"
            fontWeight="600"
            position="absolute"
            top="50%"
            right="3"
            transform="translateY(-50%)"
            _groupHover={{ visibility: 'hidden' }}
          >
            {membersInVoice ?? 0} / {channel.userLimit}
          </Text>
        )}
      </Box>
      <VoiceMemberList channel={channel} marginLeft="7" />
    </Stack>
  );
}
