import { Stack, StackProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';
import ToggleReceiveVoiceChannelButton from './ToggleReceiveVoiceChannelButton';
import ToggleSendVoiceChannelButton from './ToggleSendVoiceChannelButton';

export default function VoiceChannelActionButtons(props: StackProps & RefAttributes<HTMLDivElement>) {
  return (
    <Stack direction="row" {...props}>
      <ToggleSendVoiceChannelButton />
      <ToggleReceiveVoiceChannelButton />
    </Stack>
  );
}
