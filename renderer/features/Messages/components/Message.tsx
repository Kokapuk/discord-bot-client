import { Stack, StackProps, Text } from '@chakra-ui/react';
import { GuildMember } from '@main/features/guilds/types';
import { type Message } from '@main/features/messages/types';
import Avatar from '@renderer/ui/Avatar';
import { useColorMode } from '@renderer/ui/ColorMode';
import dayjs from 'dayjs';
import { memo, RefAttributes, useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { MessageContext } from '../context';
import AttachmentList from './AttachmentList';
import EmbedList from './EmbedList';
import FormattedMessageContent from './FormattedMessageContent';
import ManageMessageActionList from './ManageMessageActionList';
import ReferenceMessage from './ReferenceMessage';

export type MessageBaseProps = { message: Message; chain?: boolean };
export type MessageProps = MessageBaseProps & StackProps & RefAttributes<HTMLDivElement>;

const Message = ({ message, chain, ...props }: MessageProps) => {
  const { colorMode } = useColorMode();
  const author = useContextSelector(
    MessageContext,
    (c) => c?.users?.find((user) => user.id === message.authorId) ?? message.fallbackAuthor
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
      className="group"
      gap="0"
      position="relative"
      paddingInline="2.5"
      backgroundColor={message.clientMentioned ? 'yellow.focusRing/10' : undefined}
      _hover={{
        backgroundColor: message.clientMentioned
          ? 'yellow.focusRing/15'
          : colorMode === 'light'
          ? 'blackAlpha.50'
          : 'whiteAlpha.50',
      }}
      {...props}
    >
      {!!message.referenceMessageId && (
        <ReferenceMessage referenceMessageId={message.referenceMessageId} marginBottom="1" />
      )}
      <Stack direction="row" gap="4">
        <ManageMessageActionList message={message} visibility="hidden" _groupHover={{ visibility: 'visible' }} />
        {chain ? (
          <Text
            color="fg.muted"
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
          <Avatar src={author.displayAvatarUrl} size="10" />
        )}
        <Stack gap="0" width="100%" minWidth="0">
          {!chain && (
            <Stack direction="row" alignItems="center">
              <Text color={(author as GuildMember).displayHexColor} fontWeight="600" fontSize="md">
                {author.displayName}
              </Text>
              <Text color="fg.muted" fontSize="xs">
                {createdAtFormattedFull}
              </Text>
              {message.editedTimestamp !== null && (
                <Text fontSize="2xs" color="fg.subtle">
                  (edited)
                </Text>
              )}
            </Stack>
          )}

          <FormattedMessageContent rawContent={message.content} />
          {message.messageSnapshots.length > 0 && (
            <Text fontSize="sm" color="fg.muted" fontStyle="italic">
              Forwarded
            </Text>
          )}

          <AttachmentList attachments={message.attachments} />
          <EmbedList embeds={message.embeds} />

          {chain && message.editedTimestamp !== null && (
            <Text fontSize="2xs" color="fg.subtle">
              (edited)
            </Text>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default memo(Message);
