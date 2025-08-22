import { Stack, StackProps } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { handleIpcRendererDiscordApiEvents } from '../api/discord';
import useAppStore from '../stores/app';
import User from './User';

export type MemberListProps = StackProps & React.RefAttributes<HTMLDivElement>;

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
    return null;
  }

  return (
    <Stack overflow="auto" paddingInline="5px" paddingBottom="10px" gap="15px" {...props}>
      {members[guildId].map((member) => (
        <User key={member.id} user={member} />
      ))}
    </Stack>
  );
}
