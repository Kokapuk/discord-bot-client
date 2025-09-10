import { Stack, StackProps, Text } from '@chakra-ui/react';
import { GuildMember } from '@main/features/guilds/types';
import AvatarWithStatus from '@renderer/ui/AvatarWithStatus';
import { memo, RefAttributes } from 'react';

export type MemberBaseProps = { member: GuildMember };
export type MemberProps = MemberBaseProps & StackProps & RefAttributes<HTMLDivElement>;

const Member = ({ member, ...props }: MemberProps) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap="3"
      opacity={['online', 'idle', 'dnd'].includes(member.status as any) ? 1 : 0.25}
      {...props}
    >
      <AvatarWithStatus src={member.displayAvatarUrl} status={member.status} flexShrink="0" size="8" />
      <Text
        color={member.displayHexColor}
        fontWeight="600"
        fontSize="md"
        width="100%"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {member.displayName}
      </Text>
    </Stack>
  );
};

export default memo(Member);
