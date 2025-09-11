import { Text } from '@chakra-ui/react';
import { GuildMember } from '@main/features/guilds/types';
import { Message } from '@main/features/messages/types';
import { useContextSelector } from 'use-context-selector';
import { TextareaContext } from '../context';
import TextareaActionContext, { TextareaActionContextProps } from './TextareaActionContext';

export type TextareaReplyContextBaseProps = { message: Message };
export type TextareaReplyContextProps = TextareaReplyContextBaseProps &
  Omit<TextareaActionContextProps, 'label' | 'onCancel'>;

export default function TextareaReplyContext({ message, ...props }: TextareaReplyContextProps) {
  const author = useContextSelector(
    TextareaContext,
    (c) => c?.users?.find((user) => user.id === message.authorId) ?? message.fallbackAuthor
  );
  const onReplyClose = useContextSelector(TextareaContext, (c) => c?.onReplyClose);

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
