import { Box, Heading } from '@chakra-ui/react';
import { handleIpcRendererDiscordApiEvents } from '@renderer/api/discord';
import ChannelList from '@renderer/components/ChannelList';
import MemberList from '@renderer/components/MemberList';
import useGuildsStore from '@renderer/stores/guilds';
import useMessagesStore from '@renderer/stores/messages';
import RouteSpinner from '@renderer/ui/RouteSpinner';
import { Suspense, useEffect, useMemo } from 'react';
import { Navigate, Outlet, useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

export default function GuildLayout() {
  const { guildId, channelId } = useParams();
  const { guilds, channels, members, pullChannels, pullMembers, pullRoles } = useGuildsStore(
    useShallow((s) => ({
      guilds: s.guilds,
      channels: s.channels,
      members: s.members,
      pullChannels: s.pullChannels,
      pullMembers: s.pullMembers,
      pullRoles: s.pullRoles,
    }))
  );
  const unreadChannels = useMessagesStore((s) => s.unreadChannels);
  const activeGuild = useMemo(() => guilds?.find((guild) => guild.id === guildId), [guilds, guildId]);
  const activeGuildChannels = useMemo(() => (activeGuild ? channels[activeGuild.id] : null), [activeGuild, channels]);
  const activeGuildMembers = useMemo(() => (activeGuild ? members[activeGuild.id] : null), [activeGuild, members]);
  const activeChannel = useMemo(
    () => activeGuildChannels?.find((channel) => channel.id === channelId),
    [activeGuildChannels, channelId]
  );

  useEffect(() => {
    if (!guildId) {
      return;
    }

    pullChannels(guildId);
    pullMembers(guildId);
    pullRoles(guildId);

    const unsubscribeChannelUpdates = handleIpcRendererDiscordApiEvents(
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
      () => pullChannels(guildId)
    );

    const unsubscribeMemberUpdates = handleIpcRendererDiscordApiEvents(
      ['guildMemberUpdate', 'guildMemberAdd', 'guildMemberRemove', 'presenceUpdate'],
      () => pullMembers(guildId)
    );

    const unsubscribeRoleUpdates = handleIpcRendererDiscordApiEvents(['roleUpdate', 'roleCreate', 'roleDelete'], () =>
      pullRoles(guildId)
    );

    return () => {
      unsubscribeChannelUpdates();
      unsubscribeMemberUpdates();
      unsubscribeRoleUpdates();
    };
  }, [guildId]);

  if (!activeGuild || !activeGuildChannels || !activeGuildMembers) {
    return <RouteSpinner />;
  }

  if (guildId && !activeGuild) {
    return <Navigate to="/" />;
  }

  if (channelId && (!activeChannel || !activeChannel.viewChannelPermission)) {
    return <Navigate to={`/guilds/${activeGuild.id}`} />;
  }

  return (
    <Box height="100%" display="flex">
      <Box height="100%" width="60" flexShrink="0" display="flex" flexDirection="column">
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
        <ChannelList
          channels={activeGuildChannels}
          activeChannel={activeChannel}
          unreadChannels={unreadChannels}
          height="100%"
          width="100%"
          minHeight="0"
        />
      </Box>
      <Box height="100%" width="100%" overflow="auto">
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </Box>
      <MemberList members={activeGuildMembers} height="100%" width="64" flexShrink="0" />
    </Box>
  );
}
