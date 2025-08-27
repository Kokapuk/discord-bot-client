import { Stack, StackProps, Text } from '@chakra-ui/react';
import { type EmbedField } from '@main/api/types';
import { RefAttributes } from 'react';

export type EmbedFieldProps = { field: EmbedField } & StackProps & RefAttributes<HTMLDivElement>;

export default function EmbedField({ field, ...props }: EmbedFieldProps) {
  return (
    <Stack display={field.inline ? 'inline-flex' : 'flex'} gap="2" {...props}>
      <Text fontSize="xs" lineHeight="100%" color="fg.muted">
        {field.name}
      </Text>
      <Text fontSize="xs" lineHeight="100%">
        {field.value}
      </Text>
    </Stack>
  );
}
