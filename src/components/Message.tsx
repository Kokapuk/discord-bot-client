import { Avatar, Image, Stack, StackProps, Text } from '@chakra-ui/react';
import { type Message } from '@main/api/types';
import dayjs from 'dayjs';
import { RefAttributes, useMemo } from 'react';
import Attachments from './Attachments';
import Embeds from './Embeds';
import FormattedMessageContent from './FormattedMessageContent';
import ManageMessageActions from './ManageMessageActions';
import { useMessageContext } from './MessageContext';

export type MessageProps = {
  message: Message;
  chain?: boolean;
} & StackProps &
  RefAttributes<HTMLDivElement>;

export default function Message({ message, chain, ...props }: MessageProps) {
  const { members, client, activeChannel } = useMessageContext();
  const author = useMemo(
    () => members?.find((member) => member.id === message.authorId) ?? message.fallbackAuthor,
    [members, message.authorId, message.fallbackAuthor]
  );

  const createdAtFormattedFull = useMemo(
    () => dayjs(message.createdTimestamp).format('DD MMM YYYY [at] HH:mm'),
    [message.createdTimestamp]
  );

  const createdAtFormattedTime = useMemo(
    () => dayjs(message.createdTimestamp).format('HH:mm'),
    [message.createdTimestamp]
  );

  return (
    <Stack
      direction="row"
      gap="4"
      className="group"
      position="relative"
      _hover={{ backgroundColor: 'whiteAlpha.50' }}
      {...props}
    >
      <ManageMessageActions
        onEdit={client.id === author.id ? () => {} : undefined}
        onDelete={client.id === author.id || activeChannel.manageMessagesPermission ? () => {} : undefined}
        visibility="hidden"
        _groupHover={{ visibility: 'visible' }}
      />
      {chain ? (
        <Text
          color="gray.400"
          fontSize="xs"
          visibility="hidden"
          width="10"
          flexShrink="0"
          paddingLeft="1"
          paddingTop="1"
          _groupHover={{ visibility: 'visible' }}
        >
          {createdAtFormattedTime}
        </Text>
      ) : (
        <Avatar.Root size="md" backgroundColor="transparent">
          <Image loading="lazy" src={author.displayAvatarUrl} position="absolute" inset="0" borderRadius="full" />
        </Avatar.Root>
      )}
      <Stack gap="0" width="100%" minWidth="0">
        {!chain && (
          <Stack direction="row" alignItems="center">
            <Text color={author.displayHexColor} fontWeight="600" fontSize="md">
              {author.displayName}
            </Text>
            <Text color="gray.400" fontSize="xs">
              {createdAtFormattedFull}
            </Text>
            {message.editedTimestamp !== null && (
              <Text fontSize="2xs" color="gray.500">
                (edited)
              </Text>
            )}
          </Stack>
        )}
        <FormattedMessageContent rawContent={message.content} />

        <Attachments attachments={message.attachments} />
        <Embeds embeds={message.embeds} />
      </Stack>
    </Stack>
  );
}
