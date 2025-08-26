import { Button, Text } from '@chakra-ui/react';
import { SupportedChannelType, type Channel } from '@main/api/types';
import { useMemo } from 'react';
import { FaCodeBranch, FaHashtag, FaVolumeLow } from 'react-icons/fa6';
import { NavLink } from 'react-router';

export type ChannelProps = { channel: Channel; active?: boolean };

export default function Channel({ channel, active }: ChannelProps) {
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
    <NavLink to={`${channel.id}`}>
      <Button variant="ghost" justifyContent="flex-start" width="100%" data-hover={active ? '' : undefined}>
        {channelTypeIcon}{' '}
        <Text width="100%" minWidth="0" textAlign="start" overflow="hidden" textOverflow="ellipsis">
          {channel.name}
        </Text>
      </Button>
    </NavLink>
  );
}
