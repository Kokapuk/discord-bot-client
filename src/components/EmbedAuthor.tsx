import { Image, Link, Stack, StackProps, Text } from '@chakra-ui/react';
import { type EmbedAuthor } from '@main/api/types';
import { RefAttributes } from 'react';

export type EmbedAuthorProps = { author: EmbedAuthor } & StackProps & RefAttributes<HTMLDivElement>;

export default function EmbedAuthor({ author, ...props }: EmbedAuthorProps) {
  return (
    <Stack direction="row" alignItems="center" {...props}>
      {!!author.iconURL && <Image loading="lazy" src={author.iconURL} height="6" width="6" borderRadius="full" />}
      {author.url ? (
        <Link href={author.url} target="_blank" color="white" fontSize="xs">
          {author.name}
        </Link>
      ) : (
        <Text color="white" fontSize="xs">
          {author.name}
        </Text>
      )}
    </Stack>
  );
}
