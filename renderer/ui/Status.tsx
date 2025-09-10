import { BoxProps, Status as ChakraStatus } from '@chakra-ui/react';
import { type Status } from '@main/features/users/types';
import { RefAttributes, useMemo } from 'react';

export type StatusBaseProps = { status: Status | undefined; size?: BoxProps['width'] };
export type StatusProps = StatusBaseProps & {
  indicatorProps?: ChakraStatus.IndicatorProps & RefAttributes<HTMLDivElement>;
} & ChakraStatus.RootProps &
  RefAttributes<HTMLDivElement>;

export default function Status({ status, size = '2.5', indicatorProps, ...props }: StatusProps) {
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
      <ChakraStatus.Indicator backgroundColor={statusColorPalette} width="100%" height="100%" {...indicatorProps} />
    </ChakraStatus.Root>
  );
}
