import { Text } from '@chakra-ui/react';
import { GuildMember } from '@main/ipc/guilds/types';
import { Message } from '@main/ipc/messages/types';
import { useMemo } from 'react';
import { useTextareaContext } from '../context';
import TextareaActionContext, { TextareaActionContextProps } from './TextareaActionContext';

export type TextareaReplyContextBaseProps = { message: Message };
export type TextareaReplyContextProps = TextareaReplyContextBaseProps &
  Omit<TextareaActionContextProps, 'label' | 'onCancel'>;

export default function TextareaReplyContext({ message, ...props }: TextareaReplyContextProps) {
  const { users, onReplyClose } = useTextareaContext();
  const author = useMemo(() => users?.find((user) => user.id === message.authorId) ?? message.fallbackAuthor, []);

  return (
    <TextareaActionContext
      label={
        <>
          Replying to{' '}
          <Text as="span" color={(author as GuildMember).displayHexColor ?? undefined} fontWeight="600">
            {author.displayName}
          </Text>
        </>
      }
      onCancel={onReplyClose}
      {...props}
    />
  );
}
