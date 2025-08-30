import { Stack, StackProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';
import { useChannelContext } from './ChannelContext';
import VoiceMember from './VoiceMember';

export type VoiceMemberListProps = { channelId: string } & StackProps;

export default function VoiceMemberList({ channelId, ...props }: VoiceMemberListProps & RefAttributes<HTMLDivElement>) {
  const { voiceMembers } = useChannelContext();
  const channelMembers = voiceMembers?.[channelId];

  if (!channelMembers) {
    return null;
  }

  return (
    <Stack {...props}>
      {channelMembers.map((member) => (
        <VoiceMember key={member.id} member={member} />
      ))}
    </Stack>
  );
}
