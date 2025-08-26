import { Group, GroupProps, IconButton, IconButtonProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';
import { FaPen, FaTrash } from 'react-icons/fa6';

export type ManageMessageActionsProps = { onEdit?(): void; onDelete?(): void } & GroupProps &
  RefAttributes<HTMLDivElement>;

const BASE_ICON_BUTTON_PROPS: IconButtonProps = { size: 'xs', variant: 'subtle' };

export default function ManageMessageActions({ onEdit, onDelete, ...props }: ManageMessageActionsProps) {
  return (
    <Group attached position="absolute" top="0" right="0" transform="translate(-0.75rem, -50%)" zIndex="1" {...props}>
      {!!onEdit && (
        <IconButton {...BASE_ICON_BUTTON_PROPS} onClick={onEdit}>
          <FaPen />
        </IconButton>
      )}
      {!!onDelete && (
        <IconButton {...BASE_ICON_BUTTON_PROPS} colorPalette="red" onClick={onDelete}>
          <FaTrash />
        </IconButton>
      )}
    </Group>
  );
}
