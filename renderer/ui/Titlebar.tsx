import { Box, BoxProps } from '@chakra-ui/react';
import { CSSProperties, RefAttributes } from 'react';

export default function Titlebar(props: BoxProps & RefAttributes<HTMLDivElement>) {
  return (
    <Box
      height="env(titlebar-area-height)"
      flexShrink="0"
      style={{ WebkitAppRegion: 'drag' } as CSSProperties}
      {...props}
    />
  );
}
