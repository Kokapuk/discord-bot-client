import { VoiceConnectionStatus } from '@main/ipc/voice/types';
import ClientActivityActionButton, {
  ClientActivityActionButtonProps,
} from '@renderer/features/Client/components/ClientActivityActionButton';
import useClientStore from '@renderer/features/Client/store';
import { useEffect, useMemo } from 'react';
import { FaVolumeLow, FaVolumeXmark } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';
import useVoicesStore from '../store';

export default function ToggleReceiveVoiceButton(props: ClientActivityActionButtonProps) {
  const { connectionStatus, activeChannelData, members, receiving, setReceiving } = useVoicesStore(
    useShallow((s) => ({
      connectionStatus: s.connectionStatus,
      activeChannelData: s.activeChannel,
      members: s.members,
      receiving: s.receiving,
      setReceiving: s.setReceiving,
    }))
  );
  const client = useClientStore((s) => s.clientUser);

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
    <ClientActivityActionButton
      toggled={receiving}
      tooltip={receiving ? 'Deafen' : 'Undeafen'}
      onClick={receiving ? disableReceiver : enableReceiver}
      colorPalette={clientVoiceMember.serverDeaf ? 'red' : undefined}
      {...props}
    >
      {receiving ? <FaVolumeLow /> : <FaVolumeXmark />}
    </ClientActivityActionButton>
  );
}
