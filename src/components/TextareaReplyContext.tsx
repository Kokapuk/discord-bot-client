import { Text } from '@chakra-ui/react';
import { Message } from '@main/api/types';
import { useMemo } from 'react';
import TextareaActionContext, { TextareaActionContextProps } from './TextareaActionContext';
import { useTextareaContext } from './TextareaContext';

export type TextareaReplyContextProps = { message: Message } & Omit<TextareaActionContextProps, 'label' | 'onCancel'>;

export default function TextareaReplyContext({ message, ...props }: TextareaReplyContextProps) {
  const { users, onReplyClose } = useTextareaContext();
  const author = useMemo(() => users?.find((user) => user.id === message.authorId) ?? message.fallbackAuthor, []);

  return (
    <TextareaActionContext
      label={
        <>
          Replying to{' '}
          <Text as="span" color={author.displayHexColor ?? undefined} fontWeight="600">
            {author.displayName}
          </Text>
        </>
      }
      onCancel={onReplyClose}
      {...props}
    />
  );
}
