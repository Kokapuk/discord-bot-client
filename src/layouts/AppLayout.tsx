import { Box } from '@chakra-ui/react';
import { handleIpcRendererDiscordApiEvents } from '@renderer/api/discord';
import GuildList from '@renderer/components/GuildList';
import useAppStore from '@renderer/stores/app';
import useGuildsStore from '@renderer/stores/guilds';
import RouteSpinner from '@renderer/ui/RouteSpinner';
import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router';

export default function AppLayout() {
  const { pullClient } = useAppStore();
  const { guilds, pullGuilds } = useGuildsStore();

  useEffect(() => {
    pullClient();
  }, []);

  useEffect(() => {
    pullGuilds();

    const unsubscribe = handleIpcRendererDiscordApiEvents(['guildUpdate', 'guildCreate', 'guildDelete'], pullGuilds);

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Box height="100%" display="flex">
      {!!guilds ? (
        <>
          <GuildList guilds={guilds} />
          <Box height="100%" width="100%" overflow="auto">
            <Suspense fallback={<RouteSpinner />}>
              <Outlet />
            </Suspense>
          </Box>
        </>
      ) : (
        <RouteSpinner />
      )}
    </Box>
  );
}
