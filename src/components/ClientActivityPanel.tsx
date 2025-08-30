import { Button, Card, CardRootProps, Text } from '@chakra-ui/react';
import useAppStore from '@renderer/stores/app';
import { RefAttributes } from 'react';
import AvatarWithStatus from './AvatarWithStatus';
import PickStatusMenu from './PickStatusMenu';

export default function ClientActivityPanel(props: CardRootProps & RefAttributes<HTMLDivElement>) {
  const client = useAppStore((s) => s.client);

  if (!client) {
    return null;
  }

  return (
    <Card.Root variant="subtle" backgroundColor="bg.transparentPanel" {...props}>
      <Card.Body padding="2">
        <PickStatusMenu>
          <Button variant="ghost" justifyContent="flex-start" padding="0">
            <AvatarWithStatus src={client.displayAvatarUrl} status={client.status} />
            <Text fontSize="md" fontWeight="600">
              {client.displayName}
            </Text>
          </Button>
        </PickStatusMenu>
      </Card.Body>
    </Card.Root>
  );
}
