import { Spinner, SpinnerProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';

export type RouteSpinnerProps = SpinnerProps & RefAttributes<HTMLSpanElement>;

export default function RouteSpinner(props: RouteSpinnerProps) {
  return (
    <Spinner
      position="absolute"
      left="50%"
      top="50%"
      transform="translateX(-50%) translateY(-50%)"
      size="xl"
      color='colorPalette.fg'
      {...props}
    />
  );
}
