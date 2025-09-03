import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { Tooltip } from '@renderer/ui/tooltip';
import { RefAttributes } from 'react';

export type ManageMessageButtonProps = { tooltip: string } & IconButtonProps & RefAttributes<HTMLButtonElement>;

export default function ManageMessageButton({ tooltip, ...props }: ManageMessageButtonProps) {
  return (
    <Tooltip content={tooltip}>
      <IconButton aria-label={tooltip} size="xs" variant="subtle" {...props} />
    </Tooltip>
  );
}
