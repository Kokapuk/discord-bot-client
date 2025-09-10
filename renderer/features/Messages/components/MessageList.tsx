import { Center, Spinner, Stack, StackProps } from '@chakra-ui/react';
import { Message as MessageType } from '@main/ipc/messages/types';
import dayjs from 'dayjs';
import { memo, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react';
import Message from './Message';
import TimeSeparator from './TimeSeparator';

export type MessageListBaseProps = { messages: MessageType[]; onPaginate?(): void };
export type MessageListProps = MessageListBaseProps & StackProps & RefAttributes<HTMLDivElement>;

export const CHAIN_MESSAGES_TIME_GAP = 1000 * 60 * 5; // 5 minutes

const MessageList = ({ messages, onPaginate, ...props }: MessageListProps) => {
  const paginationTrigger = useRef<HTMLDivElement>(null);

  const chainedMessages = useMemo(() => {
    const chainedMessages: ReactNode[] = [];
    const reversedMessages = [...messages].reverse();
    let lastStructuredMessage: MessageType | null = null;

    reversedMessages.forEach((message) => {
      if (
        !lastStructuredMessage ||
        !dayjs(message.createdTimestamp).isSame(dayjs(lastStructuredMessage.createdTimestamp), 'day')
      ) {
        chainedMessages.push(
          <TimeSeparator
            key={`timeSeparator-${message.id}`}
            timestamp={message.createdTimestamp}
            marginTop="4.5"
            marginInline="2.5"
          />
        );
      }

      if (
        lastStructuredMessage?.authorId === message.authorId &&
        message.createdTimestamp - lastStructuredMessage.createdTimestamp < CHAIN_MESSAGES_TIME_GAP &&
        !message.referenceMessageId
      ) {
        chainedMessages.push(<Message key={message.id} message={message} chain marginTop="1" />);
      } else {
        chainedMessages.push(<Message key={message.id} message={message} marginTop="4.5" />);
      }

      lastStructuredMessage = message;
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
      {chainedMessages}
      {!!onPaginate && (
        <Center ref={paginationTrigger} height="12" flexShrink={0}>
          <Spinner size="md" color="colorPalette.fg" />
        </Center>
      )}
    </Stack>
  );
};

export default memo(MessageList);
