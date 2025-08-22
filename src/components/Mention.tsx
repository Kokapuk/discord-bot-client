import { Mark, MarkProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';

export type MentionProps = MarkProps & RefAttributes<HTMLElement>;

export default function Mention(props: MentionProps) {
  return (
    <Mark
      backgroundColor="colorPalette.800"
      color="colorPalette.300"
      paddingInline="5px"
      borderRadius="3px"
      {...props}
    />
  );
}
