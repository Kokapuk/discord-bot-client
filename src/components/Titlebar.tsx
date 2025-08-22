import { Box, BoxProps } from '@chakra-ui/react';
import { CSSProperties, RefAttributes } from 'react';

export type TitlebarProps = BoxProps & RefAttributes<HTMLDivElement>;

export default function Titlebar(props: TitlebarProps) {
  return (
    <Box
      height="env(titlebar-area-height)"
      flexShrink="0"
      style={{ WebkitAppRegion: 'drag' } as CSSProperties}
      {...props}
    />
  );
}
