import { Box, Heading } from '@chakra-ui/react';
import useClientStore from '@renderer/features/Client/store';
import useGuildsStore from '@renderer/features/Guilds/store';
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
        <Textarea flexShrink="0" marginBottom="2" paddingInline="2.5" width="100%" />
      </TextareaProvider>
    </Box>
  );
}
