import { Box, Card, Image, Stack, Text } from '@chakra-ui/react';
import Link from '@renderer/ui/Link';
import { EmbedProps } from './Embed';
import EmbedAuthor from './EmbedAuthor';
import EmbedField from './EmbedField';
import EmbedFooter from './EmbedFooter';

export default function EmbedRich({ embed }: EmbedProps) {
  // const testEmbed: Embed = {
  //   hexColor: '#0099FF',
  //   title: 'Some title',
  //   url: 'https://discord.js.org/',
  //   author: { name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' },
  //   description: 'Some description here',
  //   thumbnail: { url: 'https://i.imgur.com/AfFp7pu.png', height: 760, width: 760 },
  //   fields: [
  //     { name: 'Regular field title', value: 'Some value here' },
  //     { name: '\u200B', value: '\u200B' },
  //     { name: 'Inline field title', value: 'Some value here', inline: true },
  //     { name: 'Inline field title', value: 'Some value here', inline: true },
  //     { name: 'Inline field title', value: 'Some value here', inline: true },
  //   ],
  //   image: { url: 'https://i.imgur.com/AfFp7pu.png', height: 760, width: 760 },
  //   timestamp: '01/01/2018',
  //   footer: { text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' },
  // };

  return (
    <Card.Root
      variant="subtle"
      width="fit-content"
      maxWidth="32rem"
      overflow="hidden"
      paddingBlock="4"
      paddingRight="4"
      paddingLeft="6"
    >
      {!!embed.hexColor && (
        <Box position="absolute" left="0" top="0" bottom="0" width="1" backgroundColor={embed.hexColor} />
      )}

      <Card.Body padding="0">
        <Stack
          direction="row"
          marginBottom={!!embed.fields.length || !!embed.image || !!embed.footer || !!embed.timestamp ? '4' : undefined}
          gap="6"
        >
          <Stack width="100%">
            {!!embed.author && <EmbedAuthor author={embed.author} />}

            {embed.title &&
              (embed.url ? (
                <Link to={embed.url} target="_blank" fontSize="md" width="fit-content">
                  {embed.title}
                </Link>
              ) : (
                <Text fontSize="md" width="fit-content">
                  {embed.title}
                </Text>
              ))}

            {!!embed.description && <Text fontSize="xs">{embed.description}</Text>}
          </Stack>

          {!!embed.thumbnail && (
            <Image loading="lazy" src={embed.thumbnail.url} width="16" height="16" flexShrink="0" borderRadius="md" />
          )}
        </Stack>

        {(!!embed.fields.length || !!embed.image) && (
          <Stack marginBottom={!!embed.footer || !!embed.timestamp ? '2.5' : undefined}>
            <Box>
              {embed.fields.map((field, index) => (
                <EmbedField
                  key={index}
                  field={field}
                  marginRight={field.inline ? '2.5' : undefined}
                  marginBottom="2.5"
                />
              ))}
            </Box>
            {!!embed.image && <Image loading="lazy" src={embed.image.url} width="40" height="40" borderRadius="md" />}
          </Stack>
        )}

        {(!!embed.footer || !!embed.timestamp) && <EmbedFooter footer={embed.footer} timestamp={embed.timestamp} />}
      </Card.Body>
    </Card.Root>
  );
}
