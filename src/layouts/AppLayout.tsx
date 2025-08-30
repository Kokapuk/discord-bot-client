import { Box, Stack, Text } from '@chakra-ui/react';
import { handleIpcRendererDiscordApiEvents, handleIpcRendererDiscordApiEventWithPayload } from '@renderer/api/discord';
import ClientActivityPanel from '@renderer/components/ClientActivityPanel';
import GuildList from '@renderer/components/GuildList';
import useAppStore from '@renderer/stores/app';
import useGuildsStore from '@renderer/stores/guilds';
import useMessagesStore from '@renderer/stores/messages';
import RouteSpinner from '@renderer/ui/RouteSpinner';
import { toaster } from '@renderer/ui/toaster';
import { Suspense, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

export default function AppLayout() {
  const { channelId } = useParams();
  const pullClient = useAppStore((s) => s.pullClient);
  const { guilds, pullGuilds, channels } = useGuildsStore(
    useShallow((s) => ({ guilds: s.guilds, pullGuilds: s.pullGuilds, channels: s.channels }))
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
  const unreadGuilds = useMemo(
    () =>
      guilds
        ?.filter((guild) => channels[guild.id]?.some((channel) => unreadChannels.includes(channel.id)))
        .map((guild) => guild.id),
    [guilds, channels, unreadChannels]
  );
  const navigate = useNavigate();

  useEffect(() => {
    pullClient();
  }, []);

  useEffect(() => {
    pullGuilds();

    const unsubscribeGuildUpdates = handleIpcRendererDiscordApiEvents(
      ['guildUpdate', 'guildCreate', 'guildDelete'],
      pullGuilds
    );

    return () => {
      unsubscribeGuildUpdates();
    };
  }, []);

  useEffect(() => {
    const unsubscribeMessageUpdate = handleIpcRendererDiscordApiEventWithPayload('messageUpdate', updateMessage);
    const unsubscribeMessageCreate = handleIpcRendererDiscordApiEventWithPayload('messageCreate', (message) => {
      addMessage(message);

      if (channelId !== message.channelId) {
        addUnreadChannel(message.channelId);
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
    });
    const unsubscribeMessageDelete = handleIpcRendererDiscordApiEventWithPayload('messageDelete', removeMessage);

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
