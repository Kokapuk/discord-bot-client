import { Button, ButtonProps, Text } from '@chakra-ui/react';
import { ChannelType, GuildChannel } from '@main/features/channels/types';
import UnreadIndicator from '@renderer/ui/UnreadIndicator';
import { RefAttributes, useMemo } from 'react';
import { FaCodeBranch, FaHashtag, FaVolumeLow } from 'react-icons/fa6';

export type GuildBaseChannelBaseProps = { channel: GuildChannel; active?: boolean; unread?: boolean };
export type GuildBaseChannelProps = GuildBaseChannelBaseProps & ButtonProps & RefAttributes<HTMLButtonElement>;

export default function GuildBaseChannel({ channel, active, unread, ...props }: GuildBaseChannelProps) {
  const channelTypeIcon = useMemo(() => {
    switch (channel.type) {
      case ChannelType.GuildAnnouncement:
      case ChannelType.GuildText:
        return <FaHashtag />;
      case ChannelType.GuildVoice:
        return <FaVolumeLow />;
      case ChannelType.PublicThread:
      case ChannelType.PrivateThread:
        return <FaCodeBranch />;
    }
  }, [channel.type]);

  return (
    <Button
      data-hover={active ? '' : undefined}
      variant="ghost"
      justifyContent="flex-start"
      width="100%"
      height="fit-content"
      paddingBlock="1"
      paddingInline="2"
      {...props}
    >
      {unread && <UnreadIndicator />}
      {channelTypeIcon}
      <Text width="100%" minWidth="0" textAlign="start" overflow="hidden" textOverflow="ellipsis">
        {channel.name}
      </Text>
    </Button>
  );
}
