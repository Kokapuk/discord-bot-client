import { Box, Heading, Stack } from '@chakra-ui/react';
import { Message } from '@main/features/messages/types';
import useClientStore from '@renderer/features/Client/store';
import useDmsStore from '@renderer/features/Dms/store';
import MessageList from '@renderer/features/Messages/components/MessageList';
import { MessageContext } from '@renderer/features/Messages/context';
import useMessagesStore from '@renderer/features/Messages/store';
import Textarea from '@renderer/features/TextArea/components/Textarea';
import { TextareaContext } from '@renderer/features/TextArea/context';
import useTextAreaStore from '@renderer/features/TextArea/store';
import Avatar from '@renderer/ui/Avatar';
import { useCallback, useEffect, useMemo } from 'react';
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

  const handlePaginate = useMemo(
    () => (topReachedChannels[channelId] ? undefined : () => fetchMessages(channelId)),
    [topReachedChannels[channelId]]
  );
  const handleEdit = useCallback((message: Message) => setEditingMessage(message), []);
  const handleReply = useCallback((message: Message) => setReplyingMessage(message), []);

  const messageContext = useMemo<MessageContext>(
    () => ({
      clientUser: client,
      channel: activeChannel,
      messages: activeChannelMessages ?? [],
      onPaginate: handlePaginate,
      onEdit: handleEdit,
      onReply: handleReply,
    }),
    [client, activeChannel, activeChannelMessages]
  );

  const handleEditClose = useCallback(() => setEditingMessage(null), []);
  const handleReplyClose = useCallback(() => setReplyingMessage(null), []);

  const textareaContext = useMemo<TextareaContext>(
    () => ({
      channel: activeChannel,
      editingMessage,
      onEditClose: handleEditClose,
      replyingMessage,
      onReplyClose: handleReplyClose,
    }),
    [activeChannel, editingMessage, handleEditClose, replyingMessage, handleReplyClose]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Stack as="header" direction="row" alignItems="center" paddingBottom="2.5" flexShrink="0">
        <Avatar size="6" src={activeChannel.recipient.displayAvatarUrl} alt="Avatar" />
        <Heading as="h2" size='lg'>{activeChannel.recipient.displayName}</Heading>
      </Stack>
      <MessageContext.Provider value={messageContext}>
        <MessageList key={channelId} height="100%" minHeight="0" marginBottom="4" />
      </MessageContext.Provider>
      <TextareaContext.Provider value={textareaContext}>
        <Textarea flexShrink="0" marginBottom="2" paddingInline="2.5" width="100%" />
      </TextareaContext.Provider>
    </Box>
  );
}
