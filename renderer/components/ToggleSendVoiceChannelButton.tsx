import { VoiceConnectionStatus } from '@main/ipc/voice/types';
import useAppStore from '@renderer/stores/app';
import useVoicesStore from '@renderer/stores/voice';
import { useEffect, useMemo, useState } from 'react';
import { FaMicrophoneSlash } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';
import PickAudioSourceModal from './PickAudioSourceModal';
import VoiceChannelActionButton from './VoiceChannelActionButton';

export default function ToggleSendVoiceChannelButton() {
  const { connectionStatus, activeChannelData, members, setReceiving } = useVoicesStore(
    useShallow((s) => ({
      connectionStatus: s.connectionStatus,
      activeChannelData: s.activeChannel,
      members: s.members,
      setReceiving: s.setReceiving,
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

  useEffect(() => {
    if (connectionStatus === VoiceConnectionStatus.Destroyed) {
      setReceiving(false);
    }
  }, [connectionStatus === VoiceConnectionStatus.Destroyed]);

  if (!clientVoiceMember) {
    return null;
  }

  return (
    <>
      <VoiceChannelActionButton
        tooltip="Unmute"
        onClick={() => setModalOpen(true)}
        colorPalette={clientVoiceMember.serverMute ? 'red' : undefined}
      >
        <FaMicrophoneSlash />
      </VoiceChannelActionButton>
      <PickAudioSourceModal open={isModalOpen} onOpenChange={(e) => setModalOpen(e.open)} />
    </>
  );
}
