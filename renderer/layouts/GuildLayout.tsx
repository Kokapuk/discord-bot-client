import { Box, Heading, Stack } from '@chakra-ui/react';
import { isChannelVoiceBased } from '@main/ipc/voice/rendererSafeUtils';
import { ChannelContext, ChannelProvider } from '@renderer/components/ChannelContext';
import ChannelList from '@renderer/components/ChannelList';
import MemberList from '@renderer/components/MemberList';
import useGuildsStore from '@renderer/stores/guilds';
import useMessagesStore from '@renderer/stores/messages';
import useVoicesStore from '@renderer/stores/voice';
import RouteSpinner from '@renderer/ui/RouteSpinner';
import { Suspense, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, Outlet, useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

export default function GuildLayout() {
  const { guildId, channelId } = useParams();
  const { guilds, channels, members } = useGuildsStore(
    useShallow((s) => ({
      guilds: s.guilds,
      channels: s.channels,
      members: s.members,
    }))
  );
  const unreadChannels = useMessagesStore((s) => s.unreadChannels);
  const voiceMembers = useVoicesStore((s) => s.members);
  const activeGuild = useMemo(() => guilds?.find((guild) => guild.id === guildId), [guilds, guildId]);
  const activeGuildChannels = useMemo(() => (activeGuild ? channels[activeGuild.id] : null), [activeGuild, channels]);
  const activeGuildMembers = useMemo(() => (activeGuild ? members[activeGuild.id] : null), [activeGuild, members]);
  const activeChannel = useMemo(
    () => activeGuildChannels?.find((channel) => channel.id === channelId),
    [activeGuildChannels, channelId]
  );

  const channelContext = useMemo<ChannelContext>(
    () => ({
      channels: activeGuildChannels ?? [],
      activeChannel,
      unreadChannels,
      voiceMembers,
    }),
    [activeGuildChannels, activeChannel, unreadChannels, voiceMembers]
  );

  if (!activeGuild || !activeGuildChannels || !activeGuildMembers) {
    return <RouteSpinner />;
  }

  if (guildId && !activeGuild) {
    return <Navigate to="/" />;
  }

  if (
    channelId &&
    (!activeChannel ||
      !activeChannel.viewChannelPermission ||
      (isChannelVoiceBased(activeChannel) && !activeChannel.connectPermission))
  ) {
    return <Navigate to={`/guilds/${activeGuild.id}`} />;
  }

  return (
    <Stack height="100%" direction="row" gap="0">
      {createPortal(
        <Stack height="100%" width="100%" flexShrink="0" gap="0">
          <Heading
            as="h1"
            paddingInline="1.5"
            marginBottom="2.5"
            fontWeight="700"
            width="100%"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {activeGuild.name}
          </Heading>
          <ChannelProvider value={channelContext}>
            <ChannelList height="100%" width="100%" minHeight="0" />
          </ChannelProvider>
        </Stack>,
        document.getElementById('leftSidebar')!
      )}
      <Box height="100%" width="100%" overflow="auto">
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </Box>
      <MemberList members={activeGuildMembers} height="100%" width="64" flexShrink="0" />
    </Stack>
  );
}
