import useAppStore from '@renderer/stores/app';
import { AttachmentProps } from './Attachment';

export default function AudioAttachment({ attachment }: AttachmentProps) {
  const setMediaVolume = useAppStore((s) => s.setMediaVolume);

  return (
    <audio
      src={attachment.url}
      preload="none"
      controls
      onPlay={(e) => (e.currentTarget.volume = useAppStore.getState().mediaVolume)}
      onVolumeChange={(e) => setMediaVolume(e.currentTarget.volume)}
    />
  );
}
