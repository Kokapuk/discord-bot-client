import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { CSSProperties, RefAttributes } from 'react';

export default function MiniBrowserActionButton(props: IconButtonProps & RefAttributes<HTMLButtonElement>) {
  return (
    <IconButton
      style={{ 'WebkitAppRegion': 'no-drag' } as CSSProperties}
      size="xs"
      variant="ghost"
      borderRadius="full"
      {...props}
    />
  );
}
