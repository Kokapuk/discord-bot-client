import { Box } from '@chakra-ui/react';
import { handleIpcRendererDiscordApiEvents } from '@renderer/api/discord';
import useAppStore from '@renderer/stores/app';
import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router';
import GuildList from './GuildList';
import RouteSpinner from './RouteSpinner';

export default function AppLayout() {
  const { guilds, pullGuilds } = useAppStore();

  useEffect(() => {
    if (!guilds) {
      pullGuilds();
    }

    const unsubscribe = handleIpcRendererDiscordApiEvents(['guildUpdate', 'guildCreate', 'guildDelete'], pullGuilds);

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Box height="100%" display="flex">
      {!!guilds ? (
        <>
          <GuildList />
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
