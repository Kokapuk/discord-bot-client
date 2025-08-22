import { Heading } from '@chakra-ui/react';
import { useParams } from 'react-router';
import useAppStore from '../../../../stores/app';

export default function Channel() {
  const { guildId, channelId } = useParams();
  const { channels } = useAppStore();

  if (!guildId || !channelId) {
    return null;
  }

  return <Heading as="h2">{channels[guildId]?.find((channel) => channel.id === channelId)?.name}</Heading>;
}
