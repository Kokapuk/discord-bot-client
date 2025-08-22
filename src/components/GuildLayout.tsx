import { Box, Heading } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Outlet, useParams } from 'react-router';
import useAppStore from '../stores/app';
import ChannelList from './ChannelList';
import MemberList from './MemberList';
import RouteSpinner from './RouteSpinner';

export default function GuildLayout() {
  const { guildId } = useParams();
  const { guilds } = useAppStore();

  return (
    <Box height="100%" display="flex">
      <Box height="100%" width="250px" flexShrink="0" display="flex" flexDirection="column">
        <Heading
          as="h1"
          paddingInline="5px"
          marginBottom="10px"
          fontWeight="700"
          width="100%"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {guilds.find((guild) => guild.id === guildId)?.name}
        </Heading>
        <ChannelList height="100%" width="100%" minHeight="0" flexGrow="0" />
      </Box>
      <Box height="100%" width="100%" overflow="auto">
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </Box>
      <MemberList height="100%" width="275px" flexShrink="0" />
    </Box>
  );
}
