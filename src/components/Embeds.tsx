import { Stack, StackProps } from '@chakra-ui/react';
import { Embed as EmbedType } from '@main/api/types';
import { RefAttributes } from 'react';
import Embed from './Embed';

export type EmbedsProps = { embeds: EmbedType[] } & StackProps & RefAttributes<HTMLDivElement>;

export default function Embeds({ embeds, ...props }: EmbedsProps) {
  return (
    <Stack {...props}>
      {embeds.map((embed, index) => (
        <Embed key={index} embed={embed} />
      ))}
    </Stack>
  );
}
