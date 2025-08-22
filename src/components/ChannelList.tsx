import { Stack, StackProps } from '@chakra-ui/react';
import useAppStore from '@renderer/stores/app';
import { RefAttributes } from 'react';
import { useParams } from 'react-router';
import Channel from './Channel';

export type ChannelListProps = StackProps & RefAttributes<HTMLDivElement>;

export default function ChannelList(props: ChannelListProps) {
  const { guildId } = useParams();
  const { channels } = useAppStore();

  if (!guildId || !channels[guildId]) {
    return null;
  }

  return (
    <Stack overflow="auto" paddingInline="10px" paddingBottom="10px" {...props}>
      {channels[guildId].map((channel) => (
        <Channel key={channel.id} channel={channel} />
      ))}
    </Stack>
  );
}
