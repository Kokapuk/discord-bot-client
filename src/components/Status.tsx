import { BoxProps, Status as ChakraStatus, StatusRootProps as ChakraStatusRootProps } from '@chakra-ui/react';
import { Status as StatusType } from '@main/api/discord/types';
import { RefAttributes, useMemo } from 'react';

export type StatusProps = { status: StatusType | undefined; size?: BoxProps['width'] } & Omit<
  ChakraStatusRootProps,
  'children' | 'size'
>;

export default function Status({ status, size = '2.5', ...props }: StatusProps & RefAttributes<HTMLDivElement>) {
  const statusColorPalette = useMemo(() => {
    switch (status) {
      case 'online':
        return 'green.600';
      case 'idle':
        return 'yellow.600';
      case 'dnd':
        return 'red.600';
      case 'invisible':
      case 'offline':
      case undefined:
        return 'gray.500';
    }
  }, [status]);

  return (
    <ChakraStatus.Root width={size} height={size} {...props}>
      <ChakraStatus.Indicator backgroundColor={statusColorPalette} width="100%" height="100%" />
    </ChakraStatus.Root>
  );
}
