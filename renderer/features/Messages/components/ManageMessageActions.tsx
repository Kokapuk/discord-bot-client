import { Group, GroupProps } from '@chakra-ui/react';
import { isChannelGuildBased } from '@main/features/channels/rendererSafeUtils';
import { Message } from '@main/features/messages/types';
import { RefAttributes, useMemo, useState } from 'react';
import { FaPen, FaReply, FaTrash } from 'react-icons/fa6';
import { useMessageContext } from '../context';
import ManageMessageActionButton from './ManageMessageActionButton';

export type ManageMessageActionsBaseProps = { message: Message };
export type ManageMessageActionsProps = ManageMessageActionsBaseProps & GroupProps & RefAttributes<HTMLDivElement>;

export default function ManageMessageActionList({ message, ...props }: ManageMessageActionsProps) {
  const { users, clientUser: client, channel, onEdit, onReply } = useMessageContext();
  const author = useMemo(
    () => users?.find((user) => user.id === message.authorId) ?? message.fallbackAuthor,
    [users, message.authorId, message.fallbackAuthor]
  );
  const [deleting, setDeleting] = useState(false);

  const deleteMessage = async () => {
    setDeleting(true);

    const response = await window.ipcRenderer.invoke('deleteMessage', message.id, channel.id);

    if (!response.success) {
      console.error(`Failed to delete message: ${response.error}`);
    }

    setDeleting(false);
  };

  return (
    <Group attached position="absolute" top="0" right="0" transform="translate(-0.75rem, -50%)" zIndex="1" {...props}>
      {!!onReply && (
        <ManageMessageActionButton tooltip="Reply" onClick={() => onReply(message)}>
          <FaReply />
        </ManageMessageActionButton>
      )}
      {client.id === author.id && !!onEdit && (
        <ManageMessageActionButton tooltip="Edit" onClick={() => onEdit(message)}>
          <FaPen />
        </ManageMessageActionButton>
      )}
      {(client.id === author.id || (isChannelGuildBased(channel) && channel.manageMessagesPermission)) && (
        <ManageMessageActionButton tooltip="Delete" onClick={deleteMessage} loading={deleting} colorPalette="red">
          <FaTrash />
        </ManageMessageActionButton>
      )}
    </Group>
  );
}
