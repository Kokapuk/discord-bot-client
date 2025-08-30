import { Stack, StackProps } from '@chakra-ui/react';
import { memo, RefAttributes } from 'react';
import Channel from './Channel';
import { useChannelContext } from './ChannelContext';

const ChannelList = (props: StackProps & RefAttributes<HTMLDivElement>) => {
  const { channels } = useChannelContext();

  return (
    <Stack overflow="auto" paddingInline="2.5" paddingBottom="2.5" gap='2.5' {...props}>
      {channels.map((channel) => (
        <Channel key={channel.id} channel={channel} />
      ))}
    </Stack>
  );
};

export default memo(ChannelList);
