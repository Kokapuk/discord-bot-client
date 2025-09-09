import { Card, Separator, Stack } from '@chakra-ui/react';
import { VoiceConnectionStatus } from '@main/ipc/voice/types';
import VoiceStatus from '@renderer/features/Voices/components/VoiceStatus';
import useVoicesStore from '@renderer/features/Voices/store';
import { RefAttributes } from 'react';
import { useShallow } from 'zustand/shallow';
import useClientStore from '../store';
import ClientActivityActions from './ClientActivityActions';
import ClientUserButton from './ClientUserButton';
import PickStatusMenu from './PickStatusMenu';

export default function ClientActivityPanel(props: Card.RootProps & RefAttributes<HTMLDivElement>) {
  const client = useClientStore((s) => s.clientUser);
  const { connectionStatus, activeChannelData } = useVoicesStore(
    useShallow((s) => ({ connectionStatus: s.connectionStatus, activeChannelData: s.activeChannel }))
  );

  if (!client) {
    return null;
  }

  return (
    <Card.Root variant="subtle" backgroundColor="bg.transparentPanel" {...props}>
      <Card.Body padding="2">
        {connectionStatus !== VoiceConnectionStatus.Destroyed && activeChannelData && (
          <>
            <VoiceStatus />
            <Separator marginBlock="2" />
          </>
        )}
        <Stack direction="row" alignItems="center">
          <PickStatusMenu>
            <ClientUserButton width="100%" flexShrink="1" />
          </PickStatusMenu>
          <ClientActivityActions marginLeft="auto" flexShrink="0" _empty={{ display: 'none' }} />
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
