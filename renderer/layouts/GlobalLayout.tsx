import { Box } from '@chakra-ui/react';
import Titlebar from '@renderer/ui/Titlebar';
import RouteSpinner from '@renderer/ui/RouteSpinner';
import { Suspense } from 'react';
import { Outlet } from 'react-router';

export default function GlobalLayout() {
  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Titlebar />
      <Box height="100%" width="100%" overflow="auto">
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
