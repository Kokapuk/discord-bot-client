import { Box, Heading } from '@chakra-ui/react';
import { handleIpcRendererDiscordApiEvents } from '@renderer/api/discord';
import useAppStore from '@renderer/stores/app';
import { Suspense, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';
import ChannelList from './ChannelList';
import MemberList from './MemberList';
import RouteSpinner from './RouteSpinner';

export default function GuildLayout() {
  const { guildId } = useParams();
  const { guilds } = useAppStore();
  const activeGuild = useMemo(() => guilds?.find((guild) => guild.id === guildId), [guilds, guildId]);
  const { pullChannels, pullMembers, pullRoles } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!guilds?.some((guild) => guild.id === guildId)) {
      navigate('/');
    }
  }, [guilds, guildId]);

  useEffect(() => {
    if (!guildId) {
      return;
    }

    pullChannels(guildId);
    pullMembers(guildId);
    pullRoles(guildId);

    const unsubscribeChannelUpdates = handleIpcRendererDiscordApiEvents(
      ['channelUpdate', 'channelCreate', 'channelDelete', 'threadUpdate', 'threadCreate', 'threadDelete'],
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

  if (!activeGuild) {
    return <RouteSpinner />;
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
        <ChannelList height="100%" width="100%" minHeight="0" />
      </Box>
      <Box height="100%" width="100%" overflow="auto">
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </Box>
      <MemberList height="100%" width="64" flexShrink="0" />
    </Box>
  );
}
