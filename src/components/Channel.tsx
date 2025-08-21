import { Button } from '@chakra-ui/react';
import { useMemo } from 'react';
import { FaHashtag, FaVolumeLow } from 'react-icons/fa6';
import { SupportedChannelType, type Channel } from '../../electron/api/types';

export interface ChannelProps {
  channel: Channel;
}

export default function Channel({ channel }: ChannelProps) {
  const channelTypeIcon = useMemo(() => {
    switch (channel.type) {
      case SupportedChannelType.GuildAnnouncement:
      case SupportedChannelType.GuildText:
        return <FaHashtag />;
      case SupportedChannelType.GuildVoice:
        return <FaVolumeLow />;
    }
  }, [channel.type]);

  return (
    <Button variant="ghost" justifyContent="flex-start">
      {channelTypeIcon} {channel.name}
    </Button>
  );
}
