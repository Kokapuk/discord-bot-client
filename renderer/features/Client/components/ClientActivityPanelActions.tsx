import { Stack, StackProps } from '@chakra-ui/react';
import ToggleReceiveVoiceChannelButton from '@renderer/features/Voices/components/ToggleReceiveVoiceChannelButton';
import ToggleSendVoiceChannelButton from '@renderer/features/Voices/components/ToggleSendVoiceChannelButton';
import { RefAttributes } from 'react';
import { FaGear } from 'react-icons/fa6';
import ClientActivityPanelActionButton from './ClientActivityPanelActionButton';
import SettingsModal from './SettingsModal';

export default function ClientActivityPanelActions(props: StackProps & RefAttributes<HTMLDivElement>) {
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
