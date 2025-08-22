import { Box, Heading } from '@chakra-ui/react';
import MessageList from '@renderer/components/MessageList';
import RouteSpinner from '@renderer/components/RouteSpinner';
import useAppStore from '@renderer/stores/app';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export default function Channel() {
  const { guildId, channelId } = useParams();
  const { channels, messages, fetchMessages } = useAppStore();
  const [isFetchingMessages, setFetchingMessages] = useState(false);

  useEffect(() => {
    if (!channelId) {
      return;
    }

    if (!messages[channelId]?.length) {
      (async () => {
        setFetchingMessages(true);
        await fetchMessages(channelId);
        setFetchingMessages(false);
      })();
    }
  }, [channelId]);

  if (!guildId || !channelId) {
    return null;
  }

  const activeChannel = channels[guildId]?.find((channel) => channel.id === channelId);

  if (!activeChannel) {
    return null;
  }

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box as="header" paddingBottom="10px" flexShrink="0">
        <Heading as="h2">{activeChannel.name}</Heading>
      </Box>
      {isFetchingMessages ? (
        <RouteSpinner />
      ) : (
        <MessageList height="100%" minHeight="0" messages={messages[channelId] ?? []} />
      )}
    </Box>
  );
}
