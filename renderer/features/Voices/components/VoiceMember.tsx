import { Button, ButtonProps, Icon, Text } from '@chakra-ui/react';
import { type VoiceMember } from '@main/features/voice/types';
import Avatar from '@renderer/ui/Avatar';
import { RefAttributes } from 'react';
import { FaMicrophoneSlash, FaVolumeXmark } from 'react-icons/fa6';
import VoiceMemberMenu from './VoiceMemberMenu';

export type VoiceMemberBaseProps = { member: VoiceMember; speaking?: boolean };
export type VoiceMemberProps = VoiceMemberBaseProps & ButtonProps & RefAttributes<HTMLButtonElement>;

export default function VoiceMember({ member, speaking, ...props }: VoiceMemberProps) {
  return (
    <VoiceMemberMenu member={member}>
      <Button
        variant="ghost"
        height="fit-content"
        paddingBlock="1"
        paddingInline="2"
        direction="row"
        width="100%"
        alignItems="center"
        {...props}
      >
        <Avatar
          src={member.displayAvatarUrl}
          size="6"
          outlineWidth={speaking ? '2px' : '0'}
          outlineColor="green.500"
          outlineStyle="solid"
        />
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
      </Button>
    </VoiceMemberMenu>
  );
}
