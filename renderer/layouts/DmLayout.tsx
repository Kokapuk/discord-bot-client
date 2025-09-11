import { Box, Stack } from '@chakra-ui/react';
import useDmsStore from '@renderer/features/Dms/store';
import RouteSpinner from '@renderer/ui/RouteSpinner';
import { Suspense } from 'react';
import { Navigate, Outlet, useParams } from 'react-router';

export default function DmLayout() {
  const { channelId } = useParams();
  const channels = useDmsStore((s) => s.channels);

  if (!Object.values(channels).some((channel) => channel.id === channelId)) {
    return <Navigate to="/" />;
  }

  return (
    <Stack height="100%" direction="row" gap="0">
      <Box height="100%" width="100%" overflow="auto">
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </Box>
    </Stack>
  );
}
