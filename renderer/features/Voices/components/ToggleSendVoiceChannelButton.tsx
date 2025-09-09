import { VoiceConnectionStatus } from '@main/ipc/voice/types';
import useClientStore from '@renderer/features/Client/store';
import { useMemo, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';
import ClientActivityPanelActionButton from '../../Client/components/ClientActivityPanelActionButton';
import useVoicesStore from '../store';
import PickAudioSourceModal from './PickAudioSourceModal';

export default function ToggleSendVoiceChannelButton() {
  const { connectionStatus, activeChannelData, members, sending } = useVoicesStore(
    useShallow((s) => ({
      connectionStatus: s.connectionStatus,
      activeChannelData: s.activeChannel,
      members: s.members,
      sending: s.sending,
    }))
  );
  const client = useClientStore((s) => s.clientUser);
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
      <ClientActivityPanelActionButton
        toggled={sending}
        tooltip={sending ? 'Mute' : 'Unmute'}
        onClick={sending ? () => window.ipcRenderer.invoke('stopHandlingOutputAudioSource') : () => setModalOpen(true)}
        colorPalette={clientVoiceMember.serverMute ? 'red' : undefined}
      >
        {sending ? <FaMicrophone /> : <FaMicrophoneSlash />}
      </ClientActivityPanelActionButton>
      <PickAudioSourceModal open={isModalOpen} onOpenChange={(e) => setModalOpen(e.open)} />
    </>
  );
}
