import useAppStore from '@renderer/stores/app';
import useClampedSize from '@renderer/utils/useClampedSize';
import { AttachmentProps } from './Attachment';

const MAX_VIDEO_SIZE = 512;

export default function VideoAttachment({ attachment }: AttachmentProps) {
  const [clampedWidth, clampedHeight] = useClampedSize({
    width: attachment.width ?? 1,
    height: attachment.height ?? 1,
    maxSize: MAX_VIDEO_SIZE,
  });
  const { setMediaVolume } = useAppStore();

  return (
    <video
      src={attachment.url}
      preload="none"
      controls
      style={{ width: clampedWidth, height: clampedHeight }}
      onPlay={(e) => (e.currentTarget.volume = useAppStore.getState().mediaVolume)}
      onVolumeChange={(e) => setMediaVolume(e.currentTarget.volume)}
    />
  );
}
