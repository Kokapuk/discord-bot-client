import { Group, GroupProps, IconButton, IconButtonProps } from '@chakra-ui/react';
import { Message } from '@main/api/types';
import useAppStore from '@renderer/stores/app';
import { RefAttributes, useMemo } from 'react';
import { FaPen, FaTrash } from 'react-icons/fa6';
import { useParams } from 'react-router';

export type ManageMessageActionsProps = { message: Message } & GroupProps & RefAttributes<HTMLDivElement>;

const BASE_ICON_BUTTON_PROPS: IconButtonProps = { size: 'xs', variant: 'subtle' };

export default function ManageMessageActions({ message, ...props }: ManageMessageActionsProps) {
  const { guildId, channelId } = useParams();
  const { client, members, channels } = useAppStore();

  const activeChannel = useMemo(() => {
    if (!guildId || !channelId) {
      return null;
    }

    return channels[guildId]?.find((channel) => channel.id === channelId) ?? null;
  }, []);

  const author = useMemo(() => {
    if (!guildId) {
      return;
    }

    return members[guildId]?.find((member) => member.id === message.authorId) ?? message.fallbackAuthor;
  }, [members, message.authorId, guildId]);

  if (!activeChannel) {
    throw Error(`Failed to find channel with id ${channelId} in guild with id ${guildId}`);
  }

  if (!author) {
    throw Error(`Author for message does not exist.\nMessage details: ${JSON.stringify(message, undefined, '\t')}`);
  }

  if (!client) {
    throw Error(`Client does not exist`);
  }

  return (
    <Group attached position="absolute" top="0" right="0" transform="translate(-0.75rem, -50%)" zIndex="1" {...props}>
      {author.id === client.id && (
        <IconButton {...BASE_ICON_BUTTON_PROPS}>
          <FaPen />
        </IconButton>
      )}
      <IconButton {...BASE_ICON_BUTTON_PROPS} colorPalette="red">
        <FaTrash />
      </IconButton>
    </Group>
  );
}
