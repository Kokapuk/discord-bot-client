import { Group, GroupProps, IconButton, IconButtonProps } from '@chakra-ui/react';
import { Message } from '@main/api/types';
import { ipcRendererDiscordApiFunctions } from '@renderer/api/discord';
import { RefAttributes, useMemo, useState } from 'react';
import { FaPen, FaTrash } from 'react-icons/fa6';
import { useMessageContext } from './MessageContext';

export type ManageMessageActionsProps = { message: Message } & GroupProps & RefAttributes<HTMLDivElement>;

const BASE_ICON_BUTTON_PROPS: IconButtonProps = { size: 'xs', variant: 'subtle' };

export default function ManageMessageActions({ message, ...props }: ManageMessageActionsProps) {
  const { members, client, activeChannel, onEdit } = useMessageContext();
  const author = useMemo(
    () => members?.find((member) => member.id === message.authorId) ?? message.fallbackAuthor,
    [members, message.authorId, message.fallbackAuthor]
  );
  const [deleting, setDeleting] = useState(false);

  const deleteMessage = async () => {
    setDeleting(true);

    const response = await ipcRendererDiscordApiFunctions.deleteMessage(message.id, activeChannel.id);

    if (!response.success) {
      console.error(`Failed to delete message: ${response.error}`);
    }

    setDeleting(false);
  };

  return (
    <Group attached position="absolute" top="0" right="0" transform="translate(-0.75rem, -50%)" zIndex="1" {...props}>
      {client.id === author.id && !!onEdit && (
        <IconButton {...BASE_ICON_BUTTON_PROPS} aria-label="Edit message" onClick={() => onEdit(message)}>
          <FaPen />
        </IconButton>
      )}
      {(client.id === author.id || activeChannel.manageMessagesPermission) && (
        <IconButton
          {...BASE_ICON_BUTTON_PROPS}
          aria-label="Delete message"
          onClick={deleteMessage}
          loading={deleting}
          colorPalette="red"
        >
          <FaTrash />
        </IconButton>
      )}
    </Group>
  );
}
