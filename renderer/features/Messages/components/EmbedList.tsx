import { Stack, StackProps } from '@chakra-ui/react';
import { Embed as EmbedType } from '@main/ipc/messages/types';
import { RefAttributes } from 'react';
import Embed from './Embed';

export type EmbedListProps = { embeds: EmbedType[] } & StackProps & RefAttributes<HTMLDivElement>;

export default function EmbedList({ embeds, ...props }: EmbedListProps) {
  return (
    <Stack {...props}>
      {embeds.map((embed, index) => (
        <Embed key={index} embed={embed} />
      ))}
    </Stack>
  );
}
