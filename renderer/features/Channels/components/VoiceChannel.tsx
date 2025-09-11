import { Box, Stack, StackProps, Text } from '@chakra-ui/react';
import { GuildVoiceChannel } from '@main/features/channels/types';
import ChannelAdditionalActions from '@renderer/features/Channels/components/ChannelAdditionalActions';
import GuildBaseChannel, { GuildBaseChannelProps } from '@renderer/features/Channels/components/GuildBaseChannel';
import VoiceMemberList from '@renderer/features/Voices/components/VoiceMemberList';
import { VoiceContext } from '@renderer/features/Voices/context';
import { memo, RefAttributes } from 'react';
import { useContextSelector } from 'use-context-selector';

export type VoiceChannelBaseProps = { channel: GuildVoiceChannel };
export type VoiceChannelProps = VoiceChannelBaseProps & {
  wrapperProps?: StackProps & RefAttributes<HTMLDivElement>;
} & GuildBaseChannelProps;

const VoiceChannel = ({ channel, wrapperProps, ...props }: VoiceChannelProps) => {
  const membersInVoice = useContextSelector(
    VoiceContext,
    (c) => c?.voiceMembers?.[channel.guidId]?.[channel.id]?.length ?? 0
  );
  const userLimitReached = channel.userLimit ? (membersInVoice ?? 0) >= channel.userLimit : false;

  return (
    <Stack gap="1" {...wrapperProps}>
      <Box className="group" width="100%" position="relative">
        <GuildBaseChannel
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
        {!!channel.userLimit && (
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
            {membersInVoice} / {channel.userLimit}
          </Text>
        )}
      </Box>
      <VoiceMemberList channel={channel} marginLeft="7" />
    </Stack>
  );
};

export default memo(VoiceChannel);
