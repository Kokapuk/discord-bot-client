import { Box, Heading } from '@chakra-ui/react';
import { handleIpcRendererDiscordApiEventWithPayload } from '@renderer/api/discord';
import { MessageContext, MessageProvider } from '@renderer/components/MessageContext';
import MessageList from '@renderer/components/MessageList';
import Textarea from '@renderer/components/Textarea';
import { TextareaContext, TextareaProvider } from '@renderer/components/TextareaContext';
import useAppStore from '@renderer/stores/app';
import useGuildsStore from '@renderer/stores/guilds';
import useMessagesStore from '@renderer/stores/messages';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

export default function Channel() {
  const { guildId, channelId } = useParams();
  const { client } = useAppStore();
  const { channels, members, roles } = useGuildsStore();
  const {
    messages,
    topReachedChannels,
    fetchMessages,
    updateMessage,
    addMessage,
    removeMessage,
    editingMessage,
    setEditingMessage,
    replyingMessage,
    setReplyingMessage,
  } = useMessagesStore();

  useEffect(() => {
    setEditingMessage(null);
    setReplyingMessage(null);

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
      client,
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
      editingMessage,
      onEditClose: () => setEditingMessage(null),
      replyingMessage,
      onReplyClose: () => setReplyingMessage(null),
    }),
    [activeChannel, guildMembers, editingMessage, replyingMessage]
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
        <Textarea flexShrink="0" marginBottom="5" />
      </TextareaProvider>
    </Box>
  );
}
