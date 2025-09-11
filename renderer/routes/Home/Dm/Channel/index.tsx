import { Box, Heading } from '@chakra-ui/react';
import useClientStore from '@renderer/features/Client/store';
import useDmsStore from '@renderer/features/Dms/store';
import MessageList from '@renderer/features/Messages/components/MessageList';
import { MessageContext, MessageProvider } from '@renderer/features/Messages/context';
import useMessagesStore from '@renderer/features/Messages/store';
import Textarea from '@renderer/features/TextArea/components/Textarea';
import { TextareaContext, TextareaProvider } from '@renderer/features/TextArea/context';
import useTextAreaStore from '@renderer/features/TextArea/store';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

export default function Channel() {
  const { channelId } = useParams();
  const client = useClientStore((s) => s.clientUser);
  const channels = useDmsStore((s) => s.channels);

  const { messages, topReachedChannels, fetchMessages, removeUnreadChannel } = useMessagesStore(
    useShallow((s) => ({
      messages: s.messages,
      topReachedChannels: s.topReachedChannels,
      fetchMessages: s.fetchMessages,
      removeUnreadChannel: s.removeUnreadChannel,
    }))
  );

  const { editingMessage, setEditingMessage, replyingMessage, setReplyingMessage } = useTextAreaStore(
    useShallow((s) => ({
      editingMessage: s.editingMessage,
      setEditingMessage: s.setEditingMessage,
      replyingMessage: s.replyingMessage,
      setReplyingMessage: s.setReplyingMessage,
    }))
  );

  useEffect(() => {
    setEditingMessage(null);
    setReplyingMessage(null);

    if (channelId) {
      removeUnreadChannel(channelId);
    }
  }, [channelId]);

  if (!channelId) {
    return null;
  }

  if (!client) {
    throw Error('Client do not exist');
  }

  const activeChannel = Object.values(channels).find((channel) => channel.id === channelId);
  const activeChannelMessages = messages[channelId];

  if (!activeChannel) {
    throw Error('Channel do not exist');
  }

  const messageContext = useMemo<MessageContext>(
    () => ({
      clientUser: client,
      channel: activeChannel,
      messages: activeChannelMessages ?? [],
      onEdit: (message) => setEditingMessage(message),
      onReply: (message) => setReplyingMessage(message),
    }),
    [client, activeChannel, activeChannelMessages]
  );

  const textareaContext = useMemo<TextareaContext>(
    () => ({
      channel: activeChannel,
      editingMessage,
      onEditClose: () => setEditingMessage(null),
      replyingMessage,
      onReplyClose: () => setReplyingMessage(null),
    }),
    [activeChannel, editingMessage, replyingMessage]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box as="header" paddingBottom="2.5" flexShrink="0">
        <Heading as="h2">{activeChannel.recipient?.displayName}</Heading>
      </Box>
      <MessageProvider value={messageContext}>
        <MessageList
          key={channelId}
          height="100%"
          minHeight="0"
          marginBottom="4"
          messages={messages[channelId] ?? []}
          onPaginate={topReachedChannels[channelId] ? undefined : () => fetchMessages(channelId)}
        />
      </MessageProvider>
      <TextareaProvider value={textareaContext}>
        <Textarea flexShrink="0" marginBottom="2" paddingInline="2.5" width="100%" />
      </TextareaProvider>
    </Box>
  );
}
