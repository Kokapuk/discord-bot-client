import { Box } from '@chakra-ui/react';
import { CSSProperties } from 'react';

export default function Titlebar() {
  return <Box height="env(titlebar-area-height)" flexShrink="0" style={{ WebkitAppRegion: 'drag' } as CSSProperties} />;
}
