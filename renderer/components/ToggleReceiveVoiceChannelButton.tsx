import { VoiceConnectionStatus } from '@main/ipc/voice/types';
import useAppStore from '@renderer/stores/app';
import useVoicesStore from '@renderer/stores/voice';
import { useEffect, useMemo } from 'react';
import { FaVolumeLow, FaVolumeXmark } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';
import VoiceChannelActionButton from './VoiceChannelActionButton';

export default function ToggleReceiveVoiceChannelButton() {
  const { connectionStatus, activeChannelData, members, receiving, setReceiving } = useVoicesStore(
    useShallow((s) => ({
      connectionStatus: s.connectionStatus,
      activeChannelData: s.activeChannel,
      members: s.members,
      receiving: s.receiving,
      setReceiving: s.setReceiving,
    }))
  );
  const client = useAppStore((s) => s.clientUser);

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

  const enableReceiver = () => {
    if (!clientVoiceMember || clientVoiceMember.serverDeaf) {
      return;
    }

    window.ipcRenderer.invoke('enableReceiver');
    setReceiving(true);
  };

  const disableReceiver = () => {
    if (!receiving) {
      return;
    }

    window.ipcRenderer.invoke('disableReceiver');
    setReceiving(false);
  };

  useEffect(() => {
    if (clientVoiceMember?.serverDeaf && receiving) {
      disableReceiver();
    }
  }, [clientVoiceMember]);

  if (!clientVoiceMember) {
    return null;
  }

  return (
    <VoiceChannelActionButton
      toggled={receiving}
      tooltip={receiving ? 'Deafen' : 'Undeafen'}
      onClick={receiving ? disableReceiver : enableReceiver}
      aria-checked={receiving}
      colorPalette={clientVoiceMember.serverDeaf ? 'red' : undefined}
    >
      {receiving ? <FaVolumeLow /> : <FaVolumeXmark />}
    </VoiceChannelActionButton>
  );
}
