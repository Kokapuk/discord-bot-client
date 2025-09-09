import { Stack, StackProps } from '@chakra-ui/react';
import { GuildMember } from '@main/ipc/guilds/types';
import { memo, RefAttributes } from 'react';
import Member from './Member';

export type MemberListProps = { members: GuildMember[] } & StackProps & RefAttributes<HTMLDivElement>;

const MemberList = ({ members, ...props }: MemberListProps) => {
  return (
    <Stack overflow="auto" paddingInline="2.5" paddingBottom="2.5" gap="4" {...props}>
      {members.map((member) => (
        <Member key={member.id} member={member} />
      ))}
    </Stack>
  );
};

export default memo(MemberList);
