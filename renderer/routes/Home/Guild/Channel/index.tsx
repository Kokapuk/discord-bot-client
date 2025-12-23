import ViewChannel from '@renderer/features/Channels/components/ViewChannel';
import useGuildsStore from '@renderer/features/Guilds/store';
import { useParams } from 'react-router';

export default function Channel() {
  const { guildId, channelId } = useParams();
  const channels = useGuildsStore((s) => s.channels);

  if (!guildId || !channelId) {
    return null;
  }

  const activeChannel = channels[guildId]?.find((channel) => channel.id === channelId);

  if (!activeChannel) {
    throw Error(`Channel with id ${channelId} in guild with id ${guildId} does not exist`);
  }

  return <ViewChannel channel={activeChannel} />;
}
