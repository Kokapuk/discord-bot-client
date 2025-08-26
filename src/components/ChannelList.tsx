import { Stack, StackProps } from '@chakra-ui/react';
import { Channel as ChannelType } from '@main/api/types';
import { RefAttributes } from 'react';
import Channel from './Channel';

export type ChannelListProps = { channels: ChannelType[]; activeChannel?: ChannelType } & StackProps &
  RefAttributes<HTMLDivElement>;

export default function ChannelList({ channels, activeChannel, ...props }: ChannelListProps) {
  return (
    <Stack overflow="auto" paddingInline="2.5" paddingBottom="2.5" {...props}>
      {channels.map((channel) => (
        <Channel key={channel.id} channel={channel} active={activeChannel?.id === channel.id} />
      ))}
    </Stack>
  );
}
