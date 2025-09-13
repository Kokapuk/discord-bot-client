import { Box, Separator, Stack, Text } from '@chakra-ui/react';
import { VoiceConnectionStatus } from '@main/features/voice/types';
import ClientActivityPanel from '@renderer/features/Client/components/ClientActivityPanel';
import useClientStore from '@renderer/features/Client/store';
import AddDmChannelButton from '@renderer/features/Dms/components/AddDmChannelButton';
import useDmsStore from '@renderer/features/Dms/store';
import useGuildsStore from '@renderer/features/Guilds/store';
import useMessagesStore from '@renderer/features/Messages/store';
import useVoicesStore from '@renderer/features/Voices/store';
import GuildDmList from '@renderer/ui/GuildDmList';
import RouteSpinner from '@renderer/ui/RouteSpinner';
import { toaster } from '@renderer/ui/Toaster';
import handleIpcRendererAutoInvokeEvents from '@renderer/utils/handleIpcRendererAutoInvokeEvents';
import playAudio from '@renderer/utils/playAudio';
import resolvePublicUrl from '@renderer/utils/resolvePublicUrl';
import { Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

export default function AppLayout() {
  const { channelId } = useParams();
  const pullClientUser = useClientStore((s) => s.pullClientUser);
  const navigate = useNavigate();

  const { guilds, pullGuilds, pullChannels, pullMembers, pullRoles } = useGuildsStore(
    useShallow((s) => ({
      guilds: s.guilds,
      pullGuilds: s.pullGuilds,
      pullChannels: s.pullChannels,
      pullMembers: s.pullMembers,
      pullRoles: s.pullRoles,
    }))
  );

  const { updateMessage, addMessage, removeMessage, addUnreadChannel } = useMessagesStore(
    useShallow((s) => ({
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
        playAudio(resolvePublicUrl('./audios/user-join.mp3'));
      } else if (shouldPlayDisconnectEffect) {
        playAudio(resolvePublicUrl('./audios/user-leave.mp3'));
      }
    });

    const unsubscribeVoiceConnectionStatusUpdate = window.ipcRenderer.on(
      'voiceConnectionStatusUpdate',
      async (_, status, activeChannel) => {
        if (status === VoiceConnectionStatus.Ready) {
          playAudio(resolvePublicUrl('./audios/user-join.mp3'));
        } else if (status === VoiceConnectionStatus.Disconnected || status === VoiceConnectionStatus.Destroyed) {
          playAudio(resolvePublicUrl('./audios/self-disconnect.mp3'));
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

        const dmStore = useDmsStore.getState();

        if (!message.guildId && !Object.values(dmStore.channels).some((channel) => channel.id === message.channelId)) {
          dmStore.pullChannel(message.authorId);
        }

        if (useClientStore.getState().clientUser?.status !== 'dnd') {
          playAudio(resolvePublicUrl('./audios/notification.mp3'));

          toaster.create({
            title: message.fallbackAuthor.displayName,
            description: (
              <Text width="100%" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {message.content}
              </Text>
            ),
            action: {
              label: 'View',
              onClick: () =>
                navigate(
                  message.guildId ? `/guilds/${message.guildId}/${message.channelId}` : `/dm/${message.channelId}`
                ),
            },
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
          <Stack height="100%" gap="0" width="19rem" flexShrink="0">
            <Stack height="100%" minHeight="0" direction="row" gap="0">
              <Stack height="100%">
                <GuildDmList paddingInline="2.5" />
                <Separator marginInline="2.5" />
                <AddDmChannelButton marginInline="2.5" />
              </Stack>

              <Box as="aside" id="leftSidebar" height="100%" width="100%" minWidth="0" />
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
