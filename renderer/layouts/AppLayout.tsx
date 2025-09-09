import { Box, Stack, Text } from '@chakra-ui/react';
import { VoiceConnectionStatus } from '@main/ipc/voice/types';
import ClientActivityPanel from '@renderer/features/Client/components/ClientActivityPanel';
import useClientStore from '@renderer/features/Client/store';
import GuildList from '@renderer/features/Guilds/components/GuildList';
import useGuildsStore from '@renderer/features/Guilds/store';
import useMessagesStore from '@renderer/features/Messages/store';
import useVoicesStore from '@renderer/features/Voices/store';
import RouteSpinner from '@renderer/ui/RouteSpinner';
import { toaster } from '@renderer/ui/Toaster';
import handleIpcRendererAutoInvokeEvents from '@renderer/utils/handleIpcRendererAutoInvokeEvents';
import playAudio from '@renderer/utils/playAudio';
import { Suspense, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

export default function AppLayout() {
  const { channelId } = useParams();
  const pullClientUser = useClientStore((s) => s.pullClientUser);
  const navigate = useNavigate();

  const { guilds, pullGuilds, channels, pullChannels, pullMembers, pullRoles } = useGuildsStore(
    useShallow((s) => ({
      guilds: s.guilds,
      pullGuilds: s.pullGuilds,
      channels: s.channels,
      pullChannels: s.pullChannels,
      pullMembers: s.pullMembers,
      pullRoles: s.pullRoles,
    }))
  );

  const { unreadChannels, updateMessage, addMessage, removeMessage, addUnreadChannel } = useMessagesStore(
    useShallow((s) => ({
      unreadChannels: s.unreadChannels,
      updateMessage: s.updateMessage,
      addMessage: s.addMessage,
      removeMessage: s.removeMessage,
      addUnreadChannel: s.addUnreadChannel,
    }))
  );

  const {
    pullVoiceMembers,
    setConnectionStatus,
    receiving,
    setActiveChannel,
    addSpeakingMember,
    removeSpeakingMember,
    resetSpeakingMembers,
  } = useVoicesStore(
    useShallow((s) => ({
      pullVoiceMembers: s.pullMembers,
      setConnectionStatus: s.setConnectionStatus,
      receiving: s.receiving,
      setActiveChannel: s.setActiveChannel,
      addSpeakingMember: s.addSpeakingMember,
      removeSpeakingMember: s.removeSpeakingMember,
      resetSpeakingMembers: s.resetSpeakingMembers,
    }))
  );

  const unreadGuilds = useMemo(
    () =>
      guilds
        ?.filter((guild) => channels[guild.id]?.some((channel) => unreadChannels.includes(channel.id)))
        .map((guild) => guild.id),
    [guilds, channels, unreadChannels]
  );

  useEffect(() => {
    pullClientUser();
  }, []);

  useEffect(() => {
    pullGuilds();
    pullChannels();
    pullMembers();
    pullRoles();
    pullVoiceMembers();

    const unsubscribeGuildUpdates = handleIpcRendererAutoInvokeEvents(
      ['guildUpdate', 'guildCreate', 'guildDelete'],
      pullGuilds
    );

    const unsubscribeChannelUpdates = handleIpcRendererAutoInvokeEvents(
      [
        'channelUpdate',
        'channelCreate',
        'channelDelete',
        'threadUpdate',
        'threadCreate',
        'threadDelete',
        'roleUpdate',
        'guildMemberUpdate',
      ],
      pullChannels
    );

    const unsubscribeMemberUpdates = handleIpcRendererAutoInvokeEvents(
      ['guildMemberUpdate', 'guildMemberAdd', 'guildMemberRemove', 'presenceUpdate'],
      pullMembers
    );

    const unsubscribeRoleUpdates = handleIpcRendererAutoInvokeEvents(
      ['roleUpdate', 'roleCreate', 'roleDelete'],
      pullRoles
    );

    const unsubscribeVoiceStateUpdate = window.ipcRenderer.on('voiceStateUpdate', async (_, oldState, newState) => {
      pullVoiceMembers();

      const clientUser = useClientStore.getState().clientUser;
      const connectionStatus = useVoicesStore.getState().connectionStatus;
      const activeChannel = useVoicesStore.getState().activeChannel;

      if (
        connectionStatus !== VoiceConnectionStatus.Ready ||
        !activeChannel ||
        oldState.member?.id === clientUser?.id ||
        newState.member?.id === clientUser?.id
      ) {
        return;
      }

      const shouldPlayConnectEffect =
        oldState.channelId !== newState.channelId && newState.channelId === activeChannel.channelId;
      const shouldPlayDisconnectEffect =
        oldState.channelId !== newState.channelId && oldState.channelId === activeChannel.channelId;

      if (shouldPlayConnectEffect) {
        playAudio('/user-join.mp3');
      } else if (shouldPlayDisconnectEffect) {
        playAudio('/user-leave.mp3');
      }
    });

    const unsubscribeVoiceConnectionStatusUpdate = window.ipcRenderer.on(
      'voiceConnectionStatusUpdate',
      async (_, status, activeChannel) => {
        if (status === VoiceConnectionStatus.Ready) {
          playAudio('/user-join.mp3');
        } else if (status === VoiceConnectionStatus.Disconnected || status === VoiceConnectionStatus.Destroyed) {
          playAudio('/user-leave.mp3');
        }

        setConnectionStatus(status);

        if (status === VoiceConnectionStatus.Destroyed) {
          setActiveChannel(null);
        } else {
          setActiveChannel(activeChannel);
        }
      }
    );

    const unsubscribeMemberSpeakingStart = window.ipcRenderer.on('userSpeakingStart', (_, memberId) =>
      addSpeakingMember(memberId)
    );
    const unsubscribeMemberSpeakingEnd = window.ipcRenderer.on('userSpeakingEnd', (_, memberId) =>
      removeSpeakingMember(memberId)
    );

    return () => {
      unsubscribeGuildUpdates();
      unsubscribeChannelUpdates();
      unsubscribeMemberUpdates();
      unsubscribeRoleUpdates();
      unsubscribeVoiceStateUpdate();
      unsubscribeVoiceConnectionStatusUpdate();
      unsubscribeMemberSpeakingStart();
      unsubscribeMemberSpeakingEnd();
    };
  }, []);

  useEffect(() => {
    const unsubscribeMessageUpdate = window.ipcRenderer.on('messageUpdate', async (_, message) => {
      updateMessage(message);
    });

    const unsubscribeMessageCreate = window.ipcRenderer.on('messageCreate', async (_, message) => {
      addMessage(message);

      if (channelId !== message.channelId) {
        addUnreadChannel(message.channelId);

        if (useClientStore.getState().clientUser?.status !== 'dnd') {
          playAudio('/notification.mp3');

          toaster.create({
            title: message.fallbackAuthor.displayName,
            description: (
              <Text width="100%" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {message.content}
              </Text>
            ),
            action: message.guildId
              ? { label: 'View', onClick: () => navigate(`/guilds/${message.guildId}/${message.channelId}`) }
              : undefined,
            closable: true,
          });
        }
      }
    });

    const unsubscribeMessageDelete = window.ipcRenderer.on('messageDelete', async (_, message) => {
      removeMessage(message);
    });

    return () => {
      unsubscribeMessageUpdate();
      unsubscribeMessageCreate();
      unsubscribeMessageDelete();
    };
  }, [channelId]);

  useEffect(() => {
    if (!receiving) {
      resetSpeakingMembers();
    }
  }, [receiving]);

  return (
    <Stack direction="row" gap="0" height="100%">
      {!!guilds ? (
        <>
          <Stack height="100%" gap="0">
            <Stack height="100%" minHeight="0" direction="row" gap="0">
              <GuildList guilds={guilds} unreadGuilds={unreadGuilds} />
              <Box as="aside" id="leftSidebar" height="100%" width="60" flexShrink="0"></Box>
            </Stack>
            <ClientActivityPanel margin="2" />
          </Stack>
          <Box height="100%" width="100%" overflow="auto">
            <Suspense fallback={<RouteSpinner />}>
              <Outlet />
            </Suspense>
          </Box>
        </>
      ) : (
        <RouteSpinner />
      )}
    </Stack>
  );
}
