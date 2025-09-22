import { Box, BoxProps, Heading, Stack } from '@chakra-ui/react';
import { isChannelDmBased } from '@main/features/channels/rendererSafeUtils';
import { Channel, GuildChannel } from '@main/features/channels/types';
import { GuildMember, Role } from '@main/features/guilds/types';
import { Message } from '@main/features/messages/types';
import useClientStore from '@renderer/features/Client/store';
import useGuildsStore from '@renderer/features/Guilds/store';
import MessageList from '@renderer/features/Messages/components/MessageList';
import { MessageContext } from '@renderer/features/Messages/context';
import useMessagesStore from '@renderer/features/Messages/store';
import Textarea from '@renderer/features/TextArea/components/Textarea';
import { TextareaContext } from '@renderer/features/TextArea/context';
import useTextAreaStore from '@renderer/features/TextArea/store';
import Avatar from '@renderer/ui/Avatar';
import { RefAttributes, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { useShallow } from 'zustand/shallow';

export type ViewChannelBaseProps = {
  channel: Channel;
};
export type ViewChannelProps = ViewChannelBaseProps & BoxProps & RefAttributes<HTMLDivElement>;

export default function ViewChannel({ channel }: ViewChannelProps) {
  const isDm = isChannelDmBased(channel);
  const { guildId } = useParams();
  const client = useClientStore((s) => s.clientUser);

  const { guildChannels, members, guildRoles } = useGuildsStore(
    useShallow((s) => ({ guildChannels: s.channels, members: s.members, guildRoles: s.roles }))
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

    removeUnreadChannel(channel.id);
  }, [channel.id]);

  useEffect(() => {
    const handleFocus = () => {
      removeUnreadChannel(channel.id);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [channel.id]);

  if (!isDm && !guildId) {
    return null;
  }

  if (!client) {
    throw Error('Client does not exist');
  }

  let channels: GuildChannel[] | undefined = undefined;
  let users: GuildMember[] | undefined = undefined;
  let roles: Role[] | undefined = undefined;

  if (!isDm && guildId) {
    channels = guildChannels[guildId];
    users = members[guildId];
    roles = guildRoles[guildId];

    if (!guildChannels) {
      throw Error(`Channels in guild with id ${guildId} do not exist`);
    }

    if (!users) {
      throw Error(`Members in guild with id ${guildId} do not exist`);
    }

    if (!roles) {
      throw Error(`Roles in guild with id ${guildId} do not exist`);
    }
  }

  const activeChannelMessages = messages[channel.id];

  const handlePaginate = useMemo(
    () => (topReachedChannels[channel.id] ? undefined : () => fetchMessages(channel.id)),
    [topReachedChannels[channel.id]]
  );
  const handleEdit = useCallback((message: Message) => setEditingMessage(message), []);
  const handleReply = useCallback((message: Message) => setReplyingMessage(message), []);

  const messageContext = useMemo<MessageContext>(
    () => ({
      clientUser: client,
      channel,
      messages: activeChannelMessages ?? [],
      onPaginate: handlePaginate,
      channels,
      users: users,
      roles: roles,
      onEdit: handleEdit,
      onReply: handleReply,
    }),
    [client, channel, activeChannelMessages, handlePaginate, channels, users, roles, handleEdit, handleReply]
  );
  const handleEditClose = useCallback(() => setEditingMessage(null), []);
  const handleReplyClose = useCallback(() => setReplyingMessage(null), []);

  const textareaContext = useMemo<TextareaContext>(
    () => ({
      channel,
      users: users,
      roles: roles,
      editingMessage,
      onEditClose: handleEditClose,
      replyingMessage,
      onReplyClose: handleReplyClose,
    }),
    [channel, users, roles, editingMessage, handleEditClose, replyingMessage, handleReplyClose]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Stack direction="row" alignItems="center" paddingBottom="2.5" flexShrink="0">
        {isDm && <Avatar size="6" src={channel.recipient.displayAvatarUrl} alt="Avatar" />}

        <Heading as="h2" size="lg">
          {isDm ? channel.recipient.displayName : channel.name}
        </Heading>
      </Stack>

      <MessageContext.Provider value={messageContext}>
        <MessageList key={channel.id} height="100%" minHeight="0" marginBottom="4" />
      </MessageContext.Provider>

      <TextareaContext.Provider value={textareaContext}>
        <Textarea key={channel.id} flexShrink="0" marginBottom="2" paddingInline="2.5" width="100%" />
      </TextareaContext.Provider>
    </Box>
  );
}
