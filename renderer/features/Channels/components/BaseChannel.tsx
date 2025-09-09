import { Button, ButtonProps, Text } from '@chakra-ui/react';
import { SupportedChannelType, type BaseChannel } from '@main/ipc/guilds/types';
import UnreadIndicator from '@renderer/ui/UnreadIndicator';
import { RefAttributes, useMemo } from 'react';
import { FaCodeBranch, FaHashtag, FaVolumeLow } from 'react-icons/fa6';

export type BaseChannelBaseProps = { channel: BaseChannel; active?: boolean; unread?: boolean };
export type BaseChannelProps = BaseChannelBaseProps & ButtonProps & RefAttributes<HTMLButtonElement>;

export default function BaseChannel({ channel, active, unread, ...props }: BaseChannelProps) {
  const channelTypeIcon = useMemo(() => {
    switch (channel.type) {
      case SupportedChannelType.GuildAnnouncement:
      case SupportedChannelType.GuildText:
        return <FaHashtag />;
      case SupportedChannelType.GuildVoice:
        return <FaVolumeLow />;
      case SupportedChannelType.PublicThread:
      case SupportedChannelType.PrivateThread:
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
