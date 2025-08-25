import { Avatar, Image, Stack, StackProps, Text } from '@chakra-ui/react';
import { type Message } from '@main/api/types';
import useAppStore from '@renderer/stores/app';
import dayjs from 'dayjs';
import { RefAttributes, useMemo } from 'react';
import { useParams } from 'react-router';
import Attachments from './Attachments';
import Embeds from './Embeds';
import FormattedMessageContent from './FormattedMessageContent';
import ManageMessageActions from './ManageMessageActions';

export type MessageProps = { message: Message; chain?: boolean } & StackProps & RefAttributes<HTMLDivElement>;

export default function Message({ message, chain, ...props }: MessageProps) {
  const { guildId } = useParams();
  const { members } = useAppStore();

  const author = useMemo(() => {
    if (!guildId) {
      return;
    }

    return members[guildId]?.find((member) => member.id === message.authorId) ?? message.fallbackAuthor;
  }, [members, message.authorId, guildId]);

  const createdAtFormattedFull = useMemo(
    () => dayjs(message.createdTimestamp).format('DD MMM YYYY [at] HH:mm'),
    [message.createdTimestamp]
  );

  const createdAtFormattedTime = useMemo(
    () => dayjs(message.createdTimestamp).format('HH:mm'),
    [message.createdTimestamp]
  );

  if (!author) {
    throw Error(`Author for message does not exist.\nMessage details: ${JSON.stringify(message, undefined, '\t')}`);
  }

  return (
    <Stack
      direction="row"
      gap="4"
      className="group"
      position="relative"
      _hover={{ backgroundColor: 'whiteAlpha.50' }}
      {...props}
    >
      <ManageMessageActions visibility="hidden" message={message} _groupHover={{ visibility: 'visible' }} />
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
