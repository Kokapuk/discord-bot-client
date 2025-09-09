import { Stack, StackProps } from '@chakra-ui/react';
import { Channel } from '@main/ipc/guilds/types';
import { RefAttributes } from 'react';
import { useVoiceContext } from '../context';
import VoiceMember from './VoiceMember';

export type VoiceMemberListBaseProps = { channel: Channel };
export type VoiceMemberListProps = VoiceMemberListBaseProps & StackProps & RefAttributes<HTMLDivElement>;

export default function VoiceMemberList({ channel, ...props }: VoiceMemberListProps) {
  const { voiceMembers, speakingMemberIds } = useVoiceContext();
  const channelMembers = voiceMembers?.[channel.guidId]?.[channel.id];

  if (!channelMembers) {
    return null;
  }

  return (
    <Stack {...props}>
      {channelMembers.map((member) => (
        <VoiceMember key={member.id} member={member} speaking={speakingMemberIds?.includes(member.id)} />
      ))}
    </Stack>
  );
}
