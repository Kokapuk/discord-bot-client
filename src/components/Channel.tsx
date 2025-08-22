import { Button, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { FaVolumeDown } from 'react-icons/fa';
import { FaCodeBranch, FaHashtag } from 'react-icons/fa6';
import { NavLink, useParams } from 'react-router';
import { SupportedChannelType, type Channel } from '../../electron/api/types';

export interface ChannelProps {
  channel: Channel;
}

export default function Channel({ channel }: ChannelProps) {
  const { channelId } = useParams();

  const channelTypeIcon = useMemo(() => {
    switch (channel.type) {
      case SupportedChannelType.GuildAnnouncement:
      case SupportedChannelType.GuildText:
        return <FaHashtag />;
      case SupportedChannelType.GuildVoice:
        return <FaVolumeDown />;
      case SupportedChannelType.PublicThread:
      case SupportedChannelType.PrivateThread:
        return <FaCodeBranch />;
    }
  }, [channel.type]);

  return (
    <NavLink to={`${channel.id}`}>
      <Button
        variant="ghost"
        justifyContent="flex-start"
        width="100%"
        data-hover={channelId === channel.id ? '' : undefined}
      >
        {channelTypeIcon}{' '}
        <Text width="100%" minWidth="0" textAlign="start" overflow="hidden" textOverflow="ellipsis">
          {channel.name}
        </Text>
      </Button>
    </NavLink>
  );
}
