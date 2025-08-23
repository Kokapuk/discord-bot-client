import { Card, Text } from '@chakra-ui/react';
import { type Embed } from '@main/api/types';

export type EmbedProps = { embed: Embed };

export default function Embed({ embed }: EmbedProps) {
  return (
    <Card.Root variant="subtle" width="fit-content" maxWidth="100%">
      <Card.Body gap="2px">
        <Text>{embed.title}</Text>
        <Text whiteSpace="pre-wrap">{embed.description}</Text>
      </Card.Body>
    </Card.Root>
  );
}
