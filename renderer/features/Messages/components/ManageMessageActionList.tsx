import { Group, GroupProps } from '@chakra-ui/react';
import { isChannelGuildBased } from '@main/features/channels/rendererSafeUtils';
import { Message } from '@main/features/messages/types';
import { RefAttributes, useState } from 'react';
import { FaPen, FaReply, FaTrash } from 'react-icons/fa6';
import { useContextSelector } from 'use-context-selector';
import { MessageContext } from '../context';
import ManageMessageActionButton from './ManageMessageActionButton';

export type ManageMessageActionsBaseProps = { message: Message };
export type ManageMessageActionsProps = ManageMessageActionsBaseProps & GroupProps & RefAttributes<HTMLDivElement>;

export default function ManageMessageActionList({ message, ...props }: ManageMessageActionsProps) {
  const author = useContextSelector(
    MessageContext,
    (c) => c?.users?.find((user) => user.id === message.authorId) ?? message.fallbackAuthor
  );
  const clientUser = useContextSelector(MessageContext, (c) => c?.clientUser);
  const channel = useContextSelector(MessageContext, (c) => c?.channel);
  const onEdit = useContextSelector(MessageContext, (c) => c?.onEdit);
  const onReply = useContextSelector(MessageContext, (c) => c?.onReply);
  const [deleting, setDeleting] = useState(false);

  if (!clientUser) {
    throw Error('Client user is not valid');
  }

  if (!channel) {
    throw Error('Channel is not valid');
  }

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
      {clientUser.id === author.id && !!onEdit && (
        <ManageMessageActionButton tooltip="Edit" onClick={() => onEdit(message)}>
          <FaPen />
        </ManageMessageActionButton>
      )}
      {(clientUser.id === author.id || (isChannelGuildBased(channel) && channel.manageMessagesPermission)) && (
        <ManageMessageActionButton tooltip="Delete" onClick={deleteMessage} loading={deleting} colorPalette="red">
          <FaTrash />
        </ManageMessageActionButton>
      )}
    </Group>
  );
}
