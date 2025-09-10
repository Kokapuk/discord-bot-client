import { Box, Stack, StackProps, Text } from '@chakra-ui/react';
import { GuildMember } from '@main/features/guilds/types';
import { RefAttributes, useMemo } from 'react';
import { useMessageContext } from '../context';
import FormattedMessageContent from './FormattedMessageContent';

export type ReferenceMessageBaseProps = { referenceMessageId: string };
export type ReferenceMessageProps = ReferenceMessageBaseProps & StackProps & RefAttributes<HTMLDivElement>;

export default function ReferenceMessage({ referenceMessageId, ...props }: ReferenceMessageProps) {
  const { messages, users } = useMessageContext();

  const referenceMessage = useMemo(
    () => messages.find((message) => message.id === referenceMessageId),
    [messages, referenceMessageId]
  );

  const referenceMessageAuthor = useMemo(
    () => users?.find((user) => user.id === referenceMessage?.authorId) ?? referenceMessage?.fallbackAuthor,
    [users, referenceMessage]
  );

  return (
    <Stack direction="row" alignItems="center" {...props}>
      <Box
        width="7"
        height="2.5"
        marginLeft="5"
        borderTopWidth="2px"
        borderLeftWidth="2px"
        borderTopLeftRadius="md"
        borderColor="fg.subtle"
        alignSelf="flex-end"
        flexShrink="0"
      />
      <Text
        fontSize="sm"
        fontWeight="600"
        color={(referenceMessageAuthor as GuildMember)?.displayHexColor}
        opacity="0.6"
        flexShrink="0"
      >
        {referenceMessageAuthor?.displayName ?? 'unknown-user'}
      </Text>
      <FormattedMessageContent
        rawContent={referenceMessage?.content ?? 'Message could not be loaded'}
        oneLine
        as="div"
        fontStyle={!referenceMessage ? 'italic' : undefined}
        fontSize="sm"
        opacity="0.6"
        width="100%"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      />
    </Stack>
  );
}
