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
    throw Error(`Channels for guild with id ${guildId} does not exist`);
  }

  return (
    <Stack overflow="auto" paddingInline="2.5" paddingBottom="2.5" {...props}>
      {channels[guildId].map((channel) => (
        <Channel key={channel.id} channel={channel} />
      ))}
    </Stack>
  );
}
