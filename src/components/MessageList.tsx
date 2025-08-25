import { Center, Spinner, Stack, StackProps } from '@chakra-ui/react';
import { Message as MessageType } from '@main/api/types';
import Message from '@renderer/components/Message';
import { RefAttributes, useEffect, useMemo, useRef } from 'react';

export type MessageListProps = { messages: MessageType[]; onPaginate?(): void } & StackProps &
  RefAttributes<HTMLDivElement>;

export const CHAIN_MESSAGES_TIME_GAP = 1000 * 60 * 5; // 5 minutes

export default function MessageList({ messages, onPaginate, ...props }: MessageListProps) {
  const paginationTrigger = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!paginationTrigger.current) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        onPaginate?.();
      }
    });

    observer.observe(paginationTrigger.current);

    return () => {
      observer.disconnect();
    };
  }, [onPaginate]);

  return (
    <Stack overflow="auto" paddingBottom="2.5" gap="0" direction="column-reverse" {...props}>
      {chainedMessages.map((m) => (
        <Message
          key={m.message.id}
          message={m.message}
          chain={m.chain}
          marginTop={m.chain ? '1' : '4.5'}
          paddingInline="2.5"
        />
      ))}
      {!!onPaginate && (
        <Center ref={paginationTrigger} height="12" flexShrink={0}>
          <Spinner size="md" />
        </Center>
      )}
    </Stack>
  );
}
