import { Box, Heading } from '@chakra-ui/react';
import { Message } from '@main/features/messages/types';
import useClientStore from '@renderer/features/Client/store';
import useGuildsStore from '@renderer/features/Guilds/store';
import MessageList from '@renderer/features/Messages/components/MessageList';
import { MessageContext } from '@renderer/features/Messages/context';
import useMessagesStore from '@renderer/features/Messages/store';
import Textarea from '@renderer/features/TextArea/components/Textarea';
import { TextareaContext } from '@renderer/features/TextArea/context';
import useTextAreaStore from '@renderer/features/TextArea/store';
import { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

export default function Channel() {
  const { guildId, channelId } = useParams();
  const client = useClientStore((s) => s.clientUser);

  const { channels, members, roles } = useGuildsStore(
    useShallow((s) => ({ channels: s.channels, members: s.members, roles: s.roles }))
  );

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

  if (!guildId || !channelId) {
    return null;
  }

  if (!client) {
    throw Error('Client do not exist');
  }

  const guildChannels = channels[guildId];
  const activeChannel = channels[guildId]?.find((channel) => channel.id === channelId);
  const activeChannelMessages = messages[channelId];
  const guildMembers = members[guildId];
  const guildRoles = roles[guildId];

  if (!guildChannels) {
    throw Error(`Channels in guild with id ${guildId} do not exist`);
  }

  if (!activeChannel) {
    throw Error(`Channel with id ${channelId} in guild with id ${guildId} does not exist`);
  }

  if (!guildMembers) {
    throw Error(`Members in guild with id ${guildId} do not exist`);
  }

  if (!guildRoles) {
    throw Error(`Roles in guild with id ${guildId} do not exist`);
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
      channels: guildChannels,
      users: guildMembers,
      roles: guildRoles,
      onEdit: handleEdit,
      onReply: handleReply,
    }),
    [
      client,
      activeChannel,
      activeChannelMessages,
      handlePaginate,
      guildChannels,
      guildMembers,
      guildRoles,
      handleEdit,
      handleReply,
    ]
  );
  const handleEditClose = useCallback(() => setEditingMessage(null), []);
  const handleReplyClose = useCallback(() => setReplyingMessage(null), []);

  const textareaContext = useMemo<TextareaContext>(
    () => ({
      channel: activeChannel,
      users: guildMembers,
      roles: guildRoles,
      editingMessage,
      onEditClose: handleEditClose,
      replyingMessage,
      onReplyClose: handleReplyClose,
    }),
    [activeChannel, guildMembers, guildRoles, editingMessage, handleEditClose, replyingMessage, handleReplyClose]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box as="header" paddingBottom="2.5" flexShrink="0">
        <Heading as="h2" size="lg">
          {activeChannel.name}
        </Heading>
      </Box>
      <MessageContext.Provider value={messageContext}>
        <MessageList key={channelId} height="100%" minHeight="0" marginBottom="4" />
      </MessageContext.Provider>
      <TextareaContext.Provider value={textareaContext}>
        <Textarea flexShrink="0" marginBottom="2" paddingInline="2.5" width="100%" />
      </TextareaContext.Provider>
    </Box>
  );
}
