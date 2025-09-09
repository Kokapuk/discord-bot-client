import { IconButton, Stack, StackProps, Text } from '@chakra-ui/react';
import { VoiceConnectionStatus } from '@main/ipc/voice/types';
import useGuildsStore from '@renderer/features/Guilds/store';
import Link from '@renderer/ui/Link';
import { Tooltip } from '@renderer/ui/Tooltip';
import { RefAttributes, useMemo } from 'react';
import { FaPhoneSlash } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';
import useVoicesStore from '../store';

export default function VoiceStatus(props: StackProps & RefAttributes<HTMLDivElement>) {
  const { connectionStatus, activeChannelData } = useVoicesStore(
    useShallow((s) => ({ connectionStatus: s.connectionStatus, activeChannelData: s.activeChannel }))
  );
  const { guilds, channels } = useGuildsStore(useShallow((s) => ({ guilds: s.guilds, channels: s.channels })));

  const statusColor = useMemo(() => {
    switch (connectionStatus) {
      case VoiceConnectionStatus.Connecting:
      case VoiceConnectionStatus.Signalling:
        return 'yellow.500';
      case VoiceConnectionStatus.Ready:
        return 'green.500';
      case VoiceConnectionStatus.Disconnected:
        return 'red.500';
      default:
        return 'gray.500';
    }
  }, [connectionStatus]);

  const statusLabel = useMemo(() => {
    switch (connectionStatus) {
      case VoiceConnectionStatus.Connecting:
      case VoiceConnectionStatus.Signalling:
        return 'Connecting...';
      case VoiceConnectionStatus.Ready:
        return 'Voice Connected';
      case VoiceConnectionStatus.Disconnected:
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  }, [connectionStatus]);

  const activeGuild = useMemo(
    () => guilds?.find((guild) => guild.id === activeChannelData?.guildId),
    [guilds, activeChannelData?.guildId]
  );

  const activeChannel = useMemo(
    () =>
      activeChannelData?.guildId
        ? channels[activeChannelData.guildId]?.find((channel) => channel.id === activeChannelData?.channelId)
        : null,
    [channels, activeChannelData?.guildId, activeChannelData?.channelId]
  );

  if (connectionStatus === VoiceConnectionStatus.Destroyed) {
    throw Error('Connection is destroyed');
  }

  if (!activeChannel) {
    throw Error('Failed to find active channel');
  }

  return (
    <Stack direction="row" alignItems="center" {...props}>
      <Stack gap="0">
        <Text color={statusColor} fontSize="sm" fontWeight="500">
          {statusLabel}
        </Text>

        {!!activeGuild && !!activeChannel && (
          <Link to={`/guilds/${activeGuild.id}/${activeChannel.id}`} fontSize="sm">
            {activeChannel.name} / {activeGuild.name}
          </Link>
        )}
      </Stack>

      <Tooltip content="Disconnect">
        <IconButton
          onClick={() => window.ipcRenderer.invoke('leaveVoice')}
          colorPalette="red"
          variant="surface"
          marginLeft="auto"
          size="xs"
        >
          <FaPhoneSlash />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
