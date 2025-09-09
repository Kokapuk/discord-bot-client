import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { Tooltip } from '@renderer/ui/Tooltip';
import { RefAttributes } from 'react';

export type ClientActivityActionButtonBaseProps = { toggled?: boolean; tooltip?: string };
export type ClientActivityActionButtonProps = ClientActivityActionButtonBaseProps &
  IconButtonProps &
  RefAttributes<HTMLButtonElement>;

export default function ClientActivityActionButton({ toggled, tooltip, ...props }: ClientActivityActionButtonProps) {
  const button = <IconButton size="xs" variant={toggled ? 'ghost' : 'subtle'} aria-checked={toggled} {...props} />;

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  return button;
}
