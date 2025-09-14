import { Button, ButtonProps, Text } from '@chakra-ui/react';
import { User } from '@main/features/users/types';
import AvatarWithStatus from '@renderer/ui/AvatarWithStatus';
import { RefAttributes } from 'react';

export type UserButtonBaseProps = { user: User };
export type UserButtonProps = UserButtonBaseProps & ButtonProps & RefAttributes<HTMLButtonElement>;

export default function UserButton({ user, ...props }: UserButtonProps) {
  return (
    <Button variant="ghost" justifyContent="flex-start" paddingInline="0.5" paddingBlock="1" width="100%" {...props}>
      <AvatarWithStatus src={user.displayAvatarUrl} status={user.status} flexShrink="0" />
      <Text fontSize="md" fontWeight="600" color="fg" overflow="hidden" textOverflow="ellipsis" textAlign="left">
        {user.displayName}
      </Text>
    </Button>
  );
}
