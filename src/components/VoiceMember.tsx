import { Button, ButtonProps, Icon, Stack, Text } from '@chakra-ui/react';
import { type VoiceMember } from '@main/api/discord/types';
import { RefAttributes } from 'react';
import { FaMicrophoneSlash, FaVolumeXmark } from 'react-icons/fa6';
import Avatar from './Avatar';

export type VoiceMemberProps = { member: VoiceMember } & ButtonProps;

export default function VoiceMember({ member, ...props }: VoiceMemberProps & RefAttributes<HTMLButtonElement>) {
  return (
    <Button variant="ghost" height="fit-content" paddingBlock="1" paddingInline="2" {...props}>
      <Stack direction="row" width="100%" alignItems="center">
        <Avatar src={member.displayAvatarUrl} size="6" />
        <Text textAlign="left" fontSize="sm" width="100%" overflow="hidden" textOverflow="ellipsis">
          {member.displayName}
        </Text>
        {(member.selfMute || member.serverMute || !member.canSpeak) && (
          <Icon size="sm" color={member.serverMute ? 'red.fg' : undefined}>
            <FaMicrophoneSlash />
          </Icon>
        )}
        {(member.selfDeaf || member.serverDeaf) && (
          <Icon size="sm" color={member.serverDeaf ? 'red.fg' : undefined}>
            <FaVolumeXmark />
          </Icon>
        )}
      </Stack>
    </Button>
  );
}
