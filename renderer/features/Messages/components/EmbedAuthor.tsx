import { Image, Stack, StackProps, Text } from '@chakra-ui/react';
import { type EmbedAuthor } from '@main/ipc/messages/types';
import Link from '@renderer/ui/Link';
import { RefAttributes } from 'react';

export type EmbedAuthorBaseProps = { author: EmbedAuthor };
export type EmbedAuthorProps = EmbedAuthorBaseProps & StackProps & RefAttributes<HTMLDivElement>;

export default function EmbedAuthor({ author, ...props }: EmbedAuthorProps) {
  return (
    <Stack direction="row" alignItems="center" {...props}>
      {!!author.iconURL && <Image loading="lazy" src={author.iconURL} height="6" width="6" borderRadius="full" />}
      {author.url ? (
        <Link to={author.url} target="_blank" color="fg" fontSize="xs" fontWeight="600">
          {author.name}
        </Link>
      ) : (
        <Text color="fg" fontSize="xs" fontWeight="600">
          {author.name}
        </Text>
      )}
    </Stack>
  );
}
