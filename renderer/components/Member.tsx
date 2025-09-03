import { Stack, StackProps, Text } from '@chakra-ui/react';
import { GuildMember } from '@main/ipc/guilds/types';
import { memo, RefAttributes } from 'react';
import AvatarWithStatus from './AvatarWithStatus';

export type MemberProps = { member: GuildMember } & StackProps;

const Member = ({ member, ...props }: MemberProps & RefAttributes<HTMLDivElement>) => {
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
