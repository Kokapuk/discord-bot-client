import { Button, ButtonProps, Text } from '@chakra-ui/react';
import AvatarWithStatus from '@renderer/ui/AvatarWithStatus';
import { RefAttributes } from 'react';
import useClientStore from '../store';

export default function ClientUserButton(props: ButtonProps & RefAttributes<HTMLButtonElement>) {
  const client = useClientStore((s) => s.clientUser);

  if (!client) {
    return null;
  }

  return (
    <Button variant="ghost" justifyContent="flex-start" padding="0" {...props}>
      <AvatarWithStatus src={client.displayAvatarUrl} status={client.status} />
      <Text fontSize="md" fontWeight="600">
        {client.displayName}
      </Text>
    </Button>
  );
}
