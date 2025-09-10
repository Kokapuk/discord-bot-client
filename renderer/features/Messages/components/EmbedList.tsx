import { Stack, StackProps } from '@chakra-ui/react';
import { Embed as EmbedType } from '@main/features/messages/types';
import { RefAttributes } from 'react';
import Embed from './Embed';

export type EmbedListBaseProps = { embeds: EmbedType[] };
export type EmbedListProps = EmbedListBaseProps & StackProps & RefAttributes<HTMLDivElement>;

export default function EmbedList({ embeds, ...props }: EmbedListProps) {
  return (
    <Stack {...props}>
      {embeds.map((embed, index) => (
        <Embed key={index} embed={embed} />
      ))}
    </Stack>
  );
}
