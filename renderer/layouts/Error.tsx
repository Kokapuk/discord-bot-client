import { Box, Stack, Text } from '@chakra-ui/react';
import Link from '@renderer/ui/Link';

export default function Error() {
  return (
    <Stack position="fixed" top="50%" left="50%" transform="translate(-50%, -50%)" alignItems="center">
      <Text textStyle="5xl" fontWeight="700" color="red.fg">
        Something went wrong :(
      </Text>
      <Box textStyle="xl" fontWeight="600">
        <Link to="https://github.com/Kokapuk/Kokapuk?tab=readme-ov-file#socials" target="_blank">
          Contact developer
        </Link>{' '}
        or{' '}
        <Link to="https://github.com/Kokapuk/discord-bot-client/issues" target="_blank" textStyle="xl" fontWeight="600">
          report a bug
        </Link>
      </Box>
    </Stack>
  );
}
