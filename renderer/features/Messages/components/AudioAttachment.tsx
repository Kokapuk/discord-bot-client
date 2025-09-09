import useClientStore from '@renderer/features/Client/store';
import { AttachmentProps } from './Attachment';

export default function AudioAttachment({ attachment }: AttachmentProps) {
  const setMediaVolume = useClientStore((s) => s.setMediaVolume);

  return (
    <audio
      src={attachment.url}
      preload="none"
      controls
      onPlay={(e) => (e.currentTarget.volume = useClientStore.getState().mediaVolume)}
      onVolumeChange={(e) => setMediaVolume(e.currentTarget.volume)}
    />
  );
}
