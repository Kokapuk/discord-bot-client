import { Mark, MarkProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';

export type MentionProps = MarkProps & RefAttributes<HTMLElement>;

export default function Mention(props: MentionProps) {
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
