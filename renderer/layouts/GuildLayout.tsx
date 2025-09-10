import { Box, Heading, Stack } from '@chakra-ui/react';
import { isChannelGuildVoiceBased } from '@main/features/channels/rendererSafeUtils';
import ChannelList from '@renderer/features/Channels/components/ChannelList';
import { ChannelContext, ChannelProvider } from '@renderer/features/Channels/context';
import MemberList from '@renderer/features/Guilds/components/MemberList';
import useGuildsStore from '@renderer/features/Guilds/store';
import useMessagesStore from '@renderer/features/Messages/store';
import { VoiceContext, VoiceProvider } from '@renderer/features/Voices/context';
import useVoicesStore from '@renderer/features/Voices/store';
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

  const { voiceMembers, speakingMemberIds } = useVoicesStore(
    useShallow((s) => ({ voiceMembers: s.members, speakingMemberIds: s.speakingMemberIds }))
  );

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
    }),
    [activeGuildChannels, activeChannel, unreadChannels]
  );

  const voiceContext = useMemo<VoiceContext>(
    () => ({
      voiceMembers,
      speakingMemberIds,
    }),
    [voiceMembers, speakingMemberIds]
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
      (isChannelGuildVoiceBased(activeChannel) && !activeChannel.connectPermission))
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
            <VoiceProvider value={voiceContext}>
              <ChannelList height="100%" width="100%" minHeight="0" />
            </VoiceProvider>
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
