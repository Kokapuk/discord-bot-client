import { Stack, StackProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';
import { FaGear } from 'react-icons/fa6';
import ClientActivityPanelActionButton from './ClientActivityPanelActionButton';
import SettingsModal from './SettingsModal';
import ToggleReceiveVoiceChannelButton from './ToggleReceiveVoiceChannelButton';
import ToggleSendVoiceChannelButton from './ToggleSendVoiceChannelButton';

export default function ClientActivityPanelActionButtons(props: StackProps & RefAttributes<HTMLDivElement>) {
  return (
    <Stack direction="row" {...props}>
      <ToggleSendVoiceChannelButton />
      <ToggleReceiveVoiceChannelButton />
      <SettingsModal>
        <ClientActivityPanelActionButton variant="ghost" tooltip="Settings">
          <FaGear />
        </ClientActivityPanelActionButton>
      </SettingsModal>
    </Stack>
  );
}
