import { Avatar, Stack, StackProps, Text } from '@chakra-ui/react';
import { type Message } from '@main/api/types';
import useAppStore from '@renderer/stores/app';
import dayjs from 'dayjs';
import { RefAttributes, useMemo } from 'react';
import { useParams } from 'react-router';
import Attachments from './Attachments';
import FormattedMessageContent from './FormattedMessageContent';
import Embeds from './Embeds';

export type MessageProps = { message: Message; chain?: boolean } & StackProps & RefAttributes<HTMLDivElement>;

export default function Message({ message, chain, ...props }: MessageProps) {
  const { guildId } = useParams();
  const { members } = useAppStore();

  const author = useMemo(() => {
    if (!guildId) {
      return;
    }

    return members[guildId]?.find((member) => member.id === message.authorId);
  }, [members, message.authorId, guildId]);

  const createdAtFormatted = useMemo(
    () => dayjs(message.createdTimestamp).format('DD MMM YYYY [at] HH:mm'),
    [message.createdTimestamp]
  );

  if (!author) {
    return null;
  }

  return (
    <Stack direction="row" gap="15px" {...props}>
      <Avatar.Root
        size="md"
        backgroundColor="transparent"
        visibility={chain ? 'hidden' : undefined}
        height={chain ? 0 : undefined}
      >
        {!chain && (
          <img
            loading="lazy"
            src={author.displayAvatarUrl}
            style={{ position: 'absolute', inset: 0, borderRadius: '50%' }}
          />
        )}
      </Avatar.Root>
      <Stack gap="0" width="100%" minWidth="0">
        {!chain && (
          <Stack direction="row" alignItems="center">
            <Text color={author.displayHexColor} fontWeight="600" fontSize="16px">
              {author.displayName}
            </Text>
            <Text color="gray.400" fontSize="12px">
              {createdAtFormatted}
            </Text>
            {message.editedTimestamp !== null && (
              <Text fontSize="10px" color="gray.500">
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
