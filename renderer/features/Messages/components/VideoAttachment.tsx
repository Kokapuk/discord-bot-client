import { Attachment } from '@main/ipc/messages/types';
import useClientStore from '@renderer/features/Client/store';
import useClampedSize from '@renderer/utils/useClampedSize';
import { useEffect, useRef } from 'react';

const MAX_VIDEO_SIZE = 512;

export type VideoAttachmentProps = { attachment: Pick<Attachment, 'width' | 'height' | 'url'>; gif?: boolean };

export default function VideoAttachment({ attachment, gif }: VideoAttachmentProps) {
  const [clampedWidth, clampedHeight] = useClampedSize({
    width: attachment.width ?? 1,
    height: attachment.height ?? 1,
    maxSize: MAX_VIDEO_SIZE,
  });
  const setMediaVolume = useClientStore((s) => s.setMediaVolume);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!video.current || !gif) {
      return;
    }

    const videoElement = video.current;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        videoElement.play();
      } else {
        videoElement.pause();
      }
    });

    observer.observe(videoElement);

    return () => {
      observer.disconnect();
    };
  }, [gif]);

  return (
    <video
      ref={video}
      src={attachment.url}
      preload="none"
      controls={!gif}
      style={{ width: clampedWidth, height: clampedHeight }}
      muted={gif}
      loop={gif}
      onPlay={(e) => (!gif ? (e.currentTarget.volume = useClientStore.getState().mediaVolume) : undefined)}
      onVolumeChange={(e) => (!gif ? setMediaVolume(e.currentTarget.volume) : undefined)}
    />
  );
}
