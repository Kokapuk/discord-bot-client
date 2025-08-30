import { Button, ButtonProps, Circle, Float, Text } from '@chakra-ui/react';
import { SupportedChannelType, type BaseChannel } from '@main/api/discord/types';
import { RefAttributes, useMemo } from 'react';
import { FaCodeBranch, FaHashtag, FaVolumeLow } from 'react-icons/fa6';

export type BaseChannelProps = { channel: BaseChannel; active?: boolean; unread?: boolean } & ButtonProps;

export default function BaseChannel({
  channel,
  active,
  unread,
  ...props
}: BaseChannelProps & RefAttributes<HTMLButtonElement>) {
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
    <Button variant="ghost" justifyContent="flex-start" width="100%" data-hover={active ? '' : undefined} {...props}>
      {unread && (
        <Float placement="middle-start">
          <Circle size="2" backgroundColor="colorPalette.fg"></Circle>
        </Float>
      )}
      {channelTypeIcon}{' '}
      <Text width="100%" minWidth="0" textAlign="start" overflow="hidden" textOverflow="ellipsis">
        {channel.name}
      </Text>
    </Button>
  );
}
