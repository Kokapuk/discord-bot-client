import { Mark, MarkProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';

export default function Mention(props: MarkProps & RefAttributes<HTMLElement>) {
  return (
    <Mark
      backgroundColor="colorPalette.muted"
      color="colorPalette.fg"
      paddingInline="1.5"
      borderRadius="xs"
      {...props}
    />
  );
}
