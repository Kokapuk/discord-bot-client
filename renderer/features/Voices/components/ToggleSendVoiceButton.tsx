import { VoiceConnectionStatus } from '@main/features/voice/types';
import ClientActivityActionButton, {
  ClientActivityActionButtonProps,
} from '@renderer/features/Client/components/ClientActivityActionButton';
import useClientStore from '@renderer/features/Client/store';
import { useEffect, useMemo, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';
import useVoicesStore from '../store';
import PickAudioSourceModal from './PickAudioSourceModal';

export default function ToggleSendVoiceButton(props: ClientActivityActionButtonProps) {
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

    return members[activeChannelData.guildId]?.[activeChannelData.channelId]?.find(
      (member) => member.id === client?.id
    );
  }, [connectionStatus, activeChannelData, !!client, members]);

  useEffect(() => {
    if (clientVoiceMember?.serverMute && sending) {
      window.ipcRenderer.invoke('stopHandlingOutputAudioSource');
    }
    
    setModalOpen(false);
  }, [clientVoiceMember?.serverMute]);

  if (!clientVoiceMember) {
    return null;
  }

  return (
    <>
      <ClientActivityActionButton
        toggled={sending}
        tooltip={sending ? 'Mute' : 'Unmute'}
        onClick={() => (sending ? window.ipcRenderer.invoke('stopHandlingOutputAudioSource') : setModalOpen(true))}
        colorPalette={clientVoiceMember.serverMute ? 'red' : undefined}
        disabled={clientVoiceMember.serverMute ?? false}
        {...props}
      >
        {sending ? <FaMicrophone /> : <FaMicrophoneSlash />}
      </ClientActivityActionButton>
      <PickAudioSourceModal open={isModalOpen} onOpenChange={(e) => setModalOpen(e.open)} />
    </>
  );
}
