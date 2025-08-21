import { Box } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Outlet } from 'react-router';
import GuildList from './GuildList';
import RouteSpinner from './RouteSpinner';

export default function AppLayout() {
  return (
    <Box height="100%" display="flex">
      <GuildList />
      <Box height="100%" width="100%" overflow="auto">
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
