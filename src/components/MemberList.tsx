import { Stack, StackProps } from '@chakra-ui/react';
import { User as UserType } from '@main/api/discord/types';
import { memo, RefAttributes } from 'react';
import User from './Member';

export type MemberListProps = { members: UserType[] } & StackProps & RefAttributes<HTMLDivElement>;

const MemberList = ({ members, ...props }: MemberListProps) => {
  return (
    <Stack overflow="auto" paddingInline="2.5" paddingBottom="2.5" gap="4" {...props}>
      {members.map((member) => (
        <User key={member.id} member={member} />
      ))}
    </Stack>
  );
};

export default memo(MemberList);
