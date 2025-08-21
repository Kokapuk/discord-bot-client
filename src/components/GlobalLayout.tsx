import { Box } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Outlet } from 'react-router';
import RouteSpinner from './RouteSpinner';
import Titlebar from './Titlebar';

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
