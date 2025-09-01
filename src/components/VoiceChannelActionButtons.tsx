import { IconButton, Stack, StackProps } from '@chakra-ui/react';
import { VoiceConnectionStatus } from '@main/api/voice/types';
import { ipcRendererApiFunctions } from '@renderer/api';
import useAppStore from '@renderer/stores/app';
import useVoicesStore from '@renderer/stores/voice';
import { Tooltip } from '@renderer/ui/tooltip';
import { RefAttributes, useEffect, useMemo } from 'react';
import { FaVolumeLow, FaVolumeXmark } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';

export default function VoiceChannelActionButtons(props: StackProps & RefAttributes<HTMLDivElement>) {
  const { connectionStatus, activeChannelData, members, receiving, setReceiving } = useVoicesStore(
    useShallow((s) => ({
      connectionStatus: s.connectionStatus,
      activeChannelData: s.activeChannel,
      members: s.members,
      receiving: s.receiving,
      setReceiving: s.setReceiving,
    }))
  );
  const client = useAppStore((s) => s.client);

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

    ipcRendererApiFunctions.enableReceiver();
    setReceiving(true);
  };

  const disableReceiver = () => {
    if (!receiving) {
      return;
    }

    ipcRendererApiFunctions.disableReceiver();
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
    <Stack direction="row" {...props}>
      <Tooltip content={receiving ? 'Deafen' : 'Undeafen'}>
        <IconButton
          size="xs"
          variant={receiving ? 'ghost' : 'subtle'}
          colorPalette={clientVoiceMember.serverDeaf ? 'red' : undefined}
          onClick={receiving ? disableReceiver : enableReceiver}
        >
          {receiving ? <FaVolumeLow /> : <FaVolumeXmark />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
