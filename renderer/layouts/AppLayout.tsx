import { Box, Stack, Text } from '@chakra-ui/react';
import ClientActivityPanel from '@renderer/components/ClientActivityPanel';
import GuildList from '@renderer/components/GuildList';
import useAppStore from '@renderer/stores/app';
import useGuildsStore from '@renderer/stores/guilds';
import useMessagesStore from '@renderer/stores/messages';
import useVoicesStore from '@renderer/stores/voice';
import RouteSpinner from '@renderer/ui/RouteSpinner';
import { toaster } from '@renderer/ui/toaster';
import handleIpcRendererAutoInvokeEvents from '@renderer/utils/handleIpcRendererAutoInvokeEvents';
import playAudio from '@renderer/utils/playAudio';
import { Suspense, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

export default function AppLayout() {
  const { channelId } = useParams();
  const pullClient = useAppStore((s) => s.pullClientUser);
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

  const { pullVoiceMembers, setConnectionStatus, setActiveChannel } = useVoicesStore(
    useShallow((s) => ({
      pullVoiceMembers: s.pullMembers,
      setConnectionStatus: s.setConnectionStatus,
      setActiveChannel: s.setActiveChannel,
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
    pullClient();
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

    const unsubscribeVoiceStateUpdate = window.ipcRenderer.on('voiceStateUpdate', async () => {
      pullVoiceMembers();
    });

    const unsubscribeVoiceConnectionStatusUpdate = window.ipcRenderer.on(
      'voiceConnectionStatusUpdate',
      async (_, status, activeChannel) => {
        setConnectionStatus(status);
        setActiveChannel(activeChannel);
      }
    );

    return () => {
      unsubscribeGuildUpdates();
      unsubscribeChannelUpdates();
      unsubscribeMemberUpdates();
      unsubscribeRoleUpdates();
      unsubscribeVoiceStateUpdate();
      unsubscribeVoiceConnectionStatusUpdate();
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

        if (useAppStore.getState().clientUser?.status !== 'dnd') {
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
