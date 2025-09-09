import { Stack, StackProps } from '@chakra-ui/react';
import ToggleReceiveVoiceButton from '@renderer/features/Voices/components/ToggleReceiveVoiceButton';
import ToggleSendVoiceButton from '@renderer/features/Voices/components/ToggleSendVoiceButton';
import { RefAttributes } from 'react';
import { FaGear } from 'react-icons/fa6';
import ClientActivityActionButton from './ClientActivityActionButton';
import SettingsModal from './SettingsModal';

export default function ClientActivityActions(props: StackProps & RefAttributes<HTMLDivElement>) {
  return (
    <Stack direction="row" {...props}>
      <ToggleSendVoiceButton />
      <ToggleReceiveVoiceButton />
      <SettingsModal triggerTooltip="Settings">
        <ClientActivityActionButton variant="ghost">
          <FaGear />
        </ClientActivityActionButton>
      </SettingsModal>
    </Stack>
  );
}
