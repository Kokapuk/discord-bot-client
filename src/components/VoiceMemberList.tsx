import { Stack, StackProps } from '@chakra-ui/react';
import { Channel } from '@main/api/discord/types';
import { RefAttributes } from 'react';
import { useChannelContext } from './ChannelContext';
import VoiceMember from './VoiceMember';

export type VoiceMemberListProps = { channel: Channel } & StackProps;

export default function VoiceMemberList({ channel, ...props }: VoiceMemberListProps & RefAttributes<HTMLDivElement>) {
  const { voiceMembers } = useChannelContext();
  const channelMembers = voiceMembers?.[channel.guidId]?.[channel.id];

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
