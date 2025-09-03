import { Card, CardRootProps, Stack } from '@chakra-ui/react';
import useAppStore from '@renderer/stores/app';
import { RefAttributes } from 'react';
import PickStatusMenu from './PickStatusMenu';
import VoiceChannelActionButtons from './VoiceChannelActionButtons';
import VoiceChannelState from './VoiceChannelState';

export default function ClientActivityPanel(props: CardRootProps & RefAttributes<HTMLDivElement>) {
  const client = useAppStore((s) => s.clientUser);

  if (!client) {
    return null;
  }

  return (
    <Card.Root variant="subtle" backgroundColor="bg.transparentPanel" {...props}>
      <Card.Body padding="2">
        <VoiceChannelState />
        <Stack direction="row" alignItems="center">
          <PickStatusMenu triggerProps={{ width: '100%', flexShrink: '1' }} />
          <VoiceChannelActionButtons marginLeft="auto" flexShrink="0" _empty={{ display: 'none' }} />
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
