import { IconButton, Stack, StackProps } from '@chakra-ui/react';
import { VoiceConnectionStatus } from '@main/api/voice/types';
import { ipcRendererApiFunctions } from '@renderer/api';
import useAppStore from '@renderer/stores/app';
import useVoicesStore from '@renderer/stores/voice';
import { Tooltip } from '@renderer/ui/tooltip';
import { RefAttributes, useMemo } from 'react';
import { FaVolumeLow, FaVolumeXmark } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';

export default function VoiceChannelActionButtons(props: StackProps & RefAttributes<HTMLDivElement>) {
  const { connectionStatus, activeChannelData, members } = useVoicesStore(
    useShallow((s) => ({
      connectionStatus: s.connectionStatus,
      activeChannelData: s.activeChannel,
      members: s.members,
    }))
  );
  const client = useAppStore((s) => s.client);

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
    <Stack direction="row" {...props}>
      <Tooltip content={clientVoiceMember.selfDeaf || clientVoiceMember.serverDeaf ? 'Undeafen' : 'Deafen'}>
        <IconButton
          size="xs"
          variant={clientVoiceMember.selfDeaf || clientVoiceMember.serverDeaf ? 'subtle' : 'ghost'}
          colorPalette={clientVoiceMember.serverDeaf ? 'red' : undefined}
          onClick={() =>
            clientVoiceMember.selfDeaf
              ? ipcRendererApiFunctions.enableReceiver()
              : ipcRendererApiFunctions.disableReceiver()
          }
        >
          {clientVoiceMember.selfDeaf || clientVoiceMember.serverDeaf ? <FaVolumeXmark /> : <FaVolumeLow />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
