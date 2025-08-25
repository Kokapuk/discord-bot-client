import { Stack, StackProps } from '@chakra-ui/react';
import { handleIpcRendererDiscordApiEvents } from '@renderer/api/discord';
import useAppStore from '@renderer/stores/app';
import { RefAttributes, useEffect } from 'react';
import { useParams } from 'react-router';
import User from './User';

export type MemberListProps = StackProps & RefAttributes<HTMLDivElement>;

export default function MemberList(props: MemberListProps) {
  const { guildId } = useParams();
  const { members, pullMembers } = useAppStore();

  useEffect(() => {
    if (!guildId) {
      return;
    }

    pullMembers(guildId);

    const unsubscribe = handleIpcRendererDiscordApiEvents(
      ['guildMemberUpdate', 'guildMemberAdd', 'guildMemberRemove', 'presenceUpdate'],
      () => pullMembers(guildId)
    );

    return () => {
      unsubscribe();
    };
  }, [guildId]);

  if (!guildId || !members[guildId]) {
    throw Error(`Members for guild with id ${guildId} does not exist`);
  }

  return (
    <Stack overflow="auto" paddingInline="2.5" paddingBottom="2.5" gap="4" {...props}>
      {members[guildId].map((member) => (
        <User key={member.id} user={member} />
      ))}
    </Stack>
  );
}
