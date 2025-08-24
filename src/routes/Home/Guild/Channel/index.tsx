import { Box, Heading } from '@chakra-ui/react';
import { handleIpcRendererDiscordApiEventWithPayload } from '@renderer/api/discord';
import MessageList from '@renderer/components/MessageList';
import Textarea from '@renderer/components/TextArea';
import useAppStore from '@renderer/stores/app';
import { useEffect } from 'react';
import { useParams } from 'react-router';

export default function Channel() {
  const { guildId, channelId } = useParams();
  const { channels, messages, topReachedChannels, fetchMessages, updateMessage, addMessage, removeMessage } =
    useAppStore();

  useEffect(() => {
    const unsubscribeMessageUpdate = handleIpcRendererDiscordApiEventWithPayload('messageUpdate', updateMessage);
    const unsubscribeMessageCreate = handleIpcRendererDiscordApiEventWithPayload('messageCreate', addMessage);
    const unsubscribeMessageDelete = handleIpcRendererDiscordApiEventWithPayload('messageDelete', removeMessage);

    return () => {
      unsubscribeMessageUpdate();
      unsubscribeMessageCreate();
      unsubscribeMessageDelete();
    };
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
      <Box as="header" paddingBottom="2.5" flexShrink="0">
        <Heading as="h2">{activeChannel.name}</Heading>
      </Box>
      <MessageList
        height="100%"
        minHeight="0"
        marginBottom="4"
        messages={messages[channelId] ?? []}
        onPaginate={topReachedChannels[channelId] ? undefined : () => fetchMessages(channelId)}
      />
      <Textarea flexShrink="0" marginBottom="5" />
    </Box>
  );
}
