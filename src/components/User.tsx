import { Avatar, Box, Image, Stack, Status, Text } from '@chakra-ui/react';
import { type User } from '@main/api/types';
import { useMemo } from 'react';

export interface UserProps {
  user: User;
}

export default function User({ user }: UserProps) {
  const statusColorPalette = useMemo(() => {
    switch (user.status) {
      case 'online':
        return 'var(--chakra-colors-green-600)';
      case 'idle':
        return 'var(--chakra-colors-yellow-600)';
      case 'dnd':
        return 'var(--chakra-colors-red-600)';
      case 'invisible':
      case 'offline':
      case undefined:
        return 'var(--chakra-colors-gray-500)';
    }
  }, [user.status]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap="4"
      opacity={['online', 'idle', 'dnd'].includes(user.status as any) ? 1 : 0.25}
    >
      <Avatar.Root size="md" backgroundColor="transparent">
        <Box
          maskImage="radial-gradient(circle 0.5625rem at calc(100% - 0.3125rem) calc(100% - 0.3125rem), transparent 99%, black 100%)"
          maskRepeat="no-repeat"
          position="absolute"
          inset="0"
        >
          <Image loading="lazy" src={user.displayAvatarUrl} position="absolute" inset="0" borderRadius="full" />
        </Box>
        <Status.Root position="absolute" right="0" bottom="0" size="lg">
          <Status.Indicator style={{ backgroundColor: statusColorPalette }} />
        </Status.Root>
      </Avatar.Root>
      <Text
        color={user.displayHexColor}
        fontWeight="600"
        fontSize="md"
        width="100%"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {user.displayName}
      </Text>
    </Stack>
  );
}
