import { Group, GroupProps } from '@chakra-ui/react';
import { Message } from '@main/api/discord/types';
import { ipcRendererApiFunctions } from '@renderer/api';
import { RefAttributes, useMemo, useState } from 'react';
import { FaPen, FaReply, FaTrash } from 'react-icons/fa6';
import ManageMessageButton from './ManageMessageButton';
import { useMessageContext } from './MessageContext';

export type ManageMessageActionsProps = { message: Message } & GroupProps & RefAttributes<HTMLDivElement>;

export default function ManageMessageActions({ message, ...props }: ManageMessageActionsProps) {
  const { users, client, channel, onEdit, onReply } = useMessageContext();
  const author = useMemo(
    () => users?.find((user) => user.id === message.authorId) ?? message.fallbackAuthor,
    [users, message.authorId, message.fallbackAuthor]
  );
  const [deleting, setDeleting] = useState(false);

  const deleteMessage = async () => {
    setDeleting(true);

    const response = await ipcRendererApiFunctions.deleteMessage(message.id, channel.id);

    if (!response.success) {
      console.error(`Failed to delete message: ${response.error}`);
    }

    setDeleting(false);
  };

  return (
    <Group attached position="absolute" top="0" right="0" transform="translate(-0.75rem, -50%)" zIndex="1" {...props}>
      {!!onReply && (
        <ManageMessageButton tooltip="Reply" onClick={() => onReply(message)}>
          <FaReply />
        </ManageMessageButton>
      )}
      {client.id === author.id && !!onEdit && (
        <ManageMessageButton tooltip="Edit" onClick={() => onEdit(message)}>
          <FaPen />
        </ManageMessageButton>
      )}
      {(client.id === author.id || channel.manageMessagesPermission) && (
        <ManageMessageButton tooltip="Delete" onClick={deleteMessage} loading={deleting} colorPalette="red">
          <FaTrash />
        </ManageMessageButton>
      )}
    </Group>
  );
}
