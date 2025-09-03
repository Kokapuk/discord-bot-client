import { Box, Heading } from '@chakra-ui/react';
import { MessageContext, MessageProvider } from '@renderer/components/MessageContext';
import MessageList from '@renderer/components/MessageList';
import Textarea from '@renderer/components/Textarea';
import { TextareaContext, TextareaProvider } from '@renderer/components/TextareaContext';
import useAppStore from '@renderer/stores/app';
import useGuildsStore from '@renderer/stores/guilds';
import useMessagesStore from '@renderer/stores/messages';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

export default function Channel() {
  const { guildId, channelId } = useParams();
  const client = useAppStore((s) => s.clientUser);
  const { channels, members, roles } = useGuildsStore(
    useShallow((s) => ({ channels: s.channels, members: s.members, roles: s.roles }))
  );
  const {
    messages,
    topReachedChannels,
    fetchMessages,
    editingMessage,
    setEditingMessage,
    replyingMessage,
    setReplyingMessage,
    removeUnreadChannel,
  } = useMessagesStore(
    useShallow((s) => ({
      messages: s.messages,
      topReachedChannels: s.topReachedChannels,
      fetchMessages: s.fetchMessages,
      editingMessage: s.editingMessage,
      setEditingMessage: s.setEditingMessage,
      replyingMessage: s.replyingMessage,
      setReplyingMessage: s.setReplyingMessage,
      removeUnreadChannel: s.removeUnreadChannel,
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

  const messageContext = useMemo<MessageContext>(
    () => ({
      clientUser: client,
      channel: activeChannel,
      messages: activeChannelMessages ?? [],
      channels: guildChannels,
      users: guildMembers,
      roles: guildRoles,
      onEdit: (message) => setEditingMessage(message),
      onReply: (message) => setReplyingMessage(message),
    }),
    [client, activeChannel, activeChannelMessages, guildChannels, guildMembers, guildRoles]
  );

  const textareaContext = useMemo<TextareaContext>(
    () => ({
      channel: activeChannel,
      users: guildMembers,
      roles: guildRoles,
      editingMessage,
      onEditClose: () => setEditingMessage(null),
      replyingMessage,
      onReplyClose: () => setReplyingMessage(null),
    }),
    [activeChannel, guildMembers, guildRoles, editingMessage, replyingMessage]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box as="header" paddingBottom="2.5" flexShrink="0">
        <Heading as="h2">{activeChannel.name}</Heading>
      </Box>
      <MessageProvider value={messageContext}>
        <MessageList
          height="100%"
          minHeight="0"
          marginBottom="4"
          messages={messages[channelId] ?? []}
          onPaginate={topReachedChannels[channelId] ? undefined : () => fetchMessages(channelId)}
        />
      </MessageProvider>
      <TextareaProvider value={textareaContext}>
        <Textarea flexShrink="0" marginBottom="5" paddingInline="2.5" width="100%" />
      </TextareaProvider>
    </Box>
  );
}
