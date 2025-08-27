import { Image, Stack, StackProps, Text } from '@chakra-ui/react';
import { type EmbedFooter } from '@main/api/types';
import { RefAttributes } from 'react';

export type EmbedFooterProps = { footer?: EmbedFooter | null; timestamp?: string | null } & StackProps &
  RefAttributes<HTMLDivElement>;

export default function EmbedFooter({ footer, timestamp, ...props }: EmbedFooterProps) {
  return (
    <Stack direction="row" alignItems="center" {...props}>
      {!!footer?.iconURL && <Image loading="lazy" src={footer.iconURL} height="5" width="5" borderRadius="full" />}
      <Text fontSize="xs" color="fg.muted">
        {[footer?.text, timestamp].filter(Boolean).join(' • ')}
      </Text>
    </Stack>
  );
}
