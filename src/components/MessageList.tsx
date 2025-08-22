import { Stack, StackProps } from '@chakra-ui/react';
import { Message as MessageType } from '@main/api/types';
import Message from '@renderer/components/Message';
import { RefAttributes, useMemo } from 'react';

export type MessageListProps = { messages: MessageType[] } & StackProps & RefAttributes<HTMLDivElement>;

export const CHAIN_MESSAGES_TIME_GAP = 1000 * 60 * 5; // 5 minutes

export default function MessageList({ messages, ...props }: MessageListProps) {
  const chainedMessages = useMemo(() => {
    const chainedMessages: { message: MessageType; chain?: boolean }[] = [];
    const reversedMessages = [...messages].reverse();

    reversedMessages.forEach((message) => {
      const lastStructuredMessage = chainedMessages[chainedMessages.length - 1];

      if (
        lastStructuredMessage?.message.authorId === message.authorId &&
        message.createdTimestamp - lastStructuredMessage.message.createdTimestamp < CHAIN_MESSAGES_TIME_GAP
      ) {
        chainedMessages.push({ message, chain: true });
      } else {
        chainedMessages.push({ message, chain: false });
      }
    });

    return chainedMessages.reverse();
  }, [messages]);

  return (
    <Stack overflow="auto" paddingInline="10px" paddingBottom="10px" gap="0" direction="column-reverse" {...props}>
      {chainedMessages.map((m) => (
        <Message key={m.message.id} message={m.message} chain={m.chain} marginTop={m.chain ? '3px' : '17px'} />
      ))}
    </Stack>
  );
}
