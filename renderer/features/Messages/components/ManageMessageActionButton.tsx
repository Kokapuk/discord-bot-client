import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { Tooltip } from '@renderer/ui/Tooltip';
import { RefAttributes } from 'react';

export type ManageMessageActionButtonProps = { tooltip: string } & IconButtonProps & RefAttributes<HTMLButtonElement>;

export default function ManageMessageActionButton({ tooltip, ...props }: ManageMessageActionButtonProps) {
  return (
    <Tooltip content={tooltip}>
      <IconButton aria-label={tooltip} size="xs" variant="subtle" {...props} />
    </Tooltip>
  );
}
