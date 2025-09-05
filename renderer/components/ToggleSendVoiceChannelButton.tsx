import { VoiceConnectionStatus } from '@main/ipc/voice/types';
import useAppStore from '@renderer/stores/app';
import useVoicesStore from '@renderer/stores/voice';
import { useMemo, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';
import PickAudioSourceModal from './PickAudioSourceModal';
import VoiceChannelActionButton from './VoiceChannelActionButton';

export default function ToggleSendVoiceChannelButton() {
  const { connectionStatus, activeChannelData, members, sending } = useVoicesStore(
    useShallow((s) => ({
      connectionStatus: s.connectionStatus,
      activeChannelData: s.activeChannel,
      members: s.members,
      sending: s.sending,
    }))
  );
  const client = useAppStore((s) => s.clientUser);
  const [isModalOpen, setModalOpen] = useState(false);

  const clientVoiceMember = useMemo(() => {
    if (connectionStatus !== VoiceConnectionStatus.Ready || !activeChannelData || !client) {
      return null;
    }

    return members[activeChannelData.guildId][activeChannelData.channelId].find((member) => member.id === client?.id);
  }, [connectionStatus, activeChannelData, !!client, members]);

  if (!clientVoiceMember) {
    return null;
  }

  return (
    <>
      <VoiceChannelActionButton
        toggled={sending}
        tooltip={sending ? 'Mute' : 'Unmute'}
        onClick={sending ? () => window.ipcRenderer.invoke('stopHandlingOutputAudioSource') : () => setModalOpen(true)}
        colorPalette={clientVoiceMember.serverMute ? 'red' : undefined}
      >
        {sending ? <FaMicrophone /> : <FaMicrophoneSlash />}
      </VoiceChannelActionButton>
      <PickAudioSourceModal open={isModalOpen} onOpenChange={(e) => setModalOpen(e.open)} />
    </>
  );
}
