import { Stack, StackProps } from '@chakra-ui/react';
import { GuildVoiceChannel } from '@main/features/channels/types';
import { RefAttributes } from 'react';
import { useContextSelector } from 'use-context-selector';
import { VoiceContext } from '../context';
import VoiceMember from './VoiceMember';

export type VoiceMemberListBaseProps = { channel: GuildVoiceChannel };
export type VoiceMemberListProps = VoiceMemberListBaseProps & StackProps & RefAttributes<HTMLDivElement>;

export default function VoiceMemberList({ channel, ...props }: VoiceMemberListProps) {
  const channelMembers = useContextSelector(VoiceContext, (c) => c?.voiceMembers?.[channel.guidId]?.[channel.id]);
  const speakingMemberIds = useContextSelector(VoiceContext, (c) => c?.speakingMemberIds);

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
