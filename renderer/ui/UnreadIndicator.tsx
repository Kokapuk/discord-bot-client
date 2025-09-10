import { Circle, CircleProps, Float, FloatProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';

export type UnreadIndicatorBaseProps = {
  placement?: FloatProps['placement'];
  size?: CircleProps['size'];
  color?: CircleProps['backgroundColor'];
};

export type UnreadIndicatorProps = UnreadIndicatorBaseProps & {
  wrapperProps?: FloatProps & RefAttributes<HTMLDivElement>;
  indicatorProps?: CircleProps & RefAttributes<HTMLDivElement>;
};

export default function UnreadIndicator({
  placement = 'middle-start',
  size = '2',
  color = 'colorPalette.fg',
  wrapperProps,
  indicatorProps,
}: UnreadIndicatorProps) {
  return (
    <Float placement={placement} zIndex="1" {...wrapperProps}>
      <Circle size={size} backgroundColor={color} {...indicatorProps} />
    </Float>
  );
}
