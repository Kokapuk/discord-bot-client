import { Box, Heading } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Outlet, useParams } from 'react-router';
import useAppStore from '../stores/app';
import ChannelList from './ChannelList';
import RouteSpinner from './RouteSpinner';

export default function GuildLayout() {
  const { guildId } = useParams();
  const { guilds } = useAppStore();

  return (
    <Box height="100%" display="flex">
      <Box height="100%" width="300px" flexShrink="0" display="flex" flexDirection="column">
        <Heading as="h1" paddingInline="5px" marginBottom="10px" fontWeight="700">
          {guilds.find((guild) => guild.id === guildId)?.name}
        </Heading>
        <ChannelList height="100%" width="100%" minHeight="0" flexGrow={0} />
      </Box>
      <Box height="100%" width="100%" overflow="auto">
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </Box>
      <Box height="100%" width="250px" backgroundColor="gray.700" flexShrink="0" />
    </Box>
  );
}
