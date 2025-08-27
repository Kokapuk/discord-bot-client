import { Box, Heading } from '@chakra-ui/react';
import { handleIpcRendererDiscordApiEventWithPayload } from '@renderer/api/discord';
import { MessageContext, MessageProvider } from '@renderer/components/MessageContext';
import MessageList from '@renderer/components/MessageList';
import Textarea from '@renderer/components/Textarea';
import useAppStore from '@renderer/stores/app';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

export default function Channel() {
  const { guildId, channelId } = useParams();
  const {
    client,
    channels,
    members,
    roles,
    messages,
    topReachedChannels,
    fetchMessages,
    updateMessage,
    addMessage,
    removeMessage,
    editingMessage,
    setEditingMessage,
  } = useAppStore();

  useEffect(() => {
    setEditingMessage(null);

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
      activeChannel,
      channels: guildChannels,
      members: guildMembers,
      roles: guildRoles,
      onEdit: (message) => setEditingMessage(message),
    }),
    [client, activeChannel, guildChannels, guildMembers, guildRoles]
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
      <Textarea
        channel={activeChannel}
        editingMessage={editingMessage}
        onEditCancel={() => setEditingMessage(null)}
        flexShrink="0"
        marginBottom="5"
      />
    </Box>
  );
}
