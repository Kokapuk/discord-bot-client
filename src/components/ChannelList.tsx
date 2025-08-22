import { Stack, StackProps } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import useAppStore from '../stores/app';
import Channel from './Channel';
import { handleIpcRendererDiscordApiEvents } from '../api/discord';

export type ChannelListProps = StackProps & React.RefAttributes<HTMLDivElement>;

export default function ChannelList(props: ChannelListProps) {
  const { guildId } = useParams();
  const { channels, pullChannels } = useAppStore();

  useEffect(() => {
    if (!guildId) {
      return;
    }

    pullChannels(guildId);

    const unsubscribe = handleIpcRendererDiscordApiEvents(
      ['channelUpdate', 'channelCreate', 'channelDelete', 'threadUpdate', 'threadCreate', 'threadDelete'],
      () => pullChannels(guildId)
    );

    return () => {
      unsubscribe();
    };
  }, [guildId]);

  if (!guildId || !channels[guildId]) {
    return null;
  }

  return (
    <Stack overflow="auto" paddingInline="5px" paddingBottom="10px" {...props}>
      {channels[guildId].map((channel) => (
        <Channel key={channel.id} channel={channel} />
      ))}
    </Stack>
  );
}
