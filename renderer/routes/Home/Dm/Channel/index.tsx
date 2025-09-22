import ViewChannel from '@renderer/features/Channels/components/ViewChannel';
import useDmsStore from '@renderer/features/Dms/store';
import { useParams } from 'react-router';

export default function Channel() {
  const { channelId } = useParams();
  const channels = useDmsStore((s) => s.channels);

  if (!channelId) {
    return null;
  }

  const activeChannel = Object.values(channels).find((channel) => channel.id === channelId);

  if (!activeChannel) {
    throw Error('Channel do not exist');
  }

  return <ViewChannel channel={activeChannel} />;
}
