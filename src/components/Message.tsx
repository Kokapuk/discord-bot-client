import { Stack, StackProps, Text } from '@chakra-ui/react';
import { type Message } from '@main/api/discord/types';
import { useColorMode } from '@renderer/ui/color-mode';
import dayjs from 'dayjs';
import { memo, RefAttributes, useMemo } from 'react';
import Attachments from './Attachments';
import Avatar from './Avatar';
import Embeds from './Embeds';
import FormattedMessageContent from './FormattedMessageContent';
import ManageMessageActions from './ManageMessageActions';
import { useMessageContext } from './MessageContext';
import ReferenceMessage from './ReferenceMessage';

export type MessageProps = {
  message: Message;
  chain?: boolean;
} & StackProps &
  RefAttributes<HTMLDivElement>;

const Message = ({ message, chain, ...props }: MessageProps) => {
  const { users } = useMessageContext();
  const { colorMode } = useColorMode();
  const author = useMemo(
    () => users?.find((user) => user.id === message.authorId) ?? message.fallbackAuthor,
    [users, message.authorId, message.fallbackAuthor]
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
        <ManageMessageActions message={message} visibility="hidden" _groupHover={{ visibility: 'visible' }} />
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
              <Text color={author.displayHexColor} fontWeight="600" fontSize="md">
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

          <Attachments attachments={message.attachments} />
          <Embeds embeds={message.embeds} />

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
