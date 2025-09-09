import { Image } from '@chakra-ui/react';
import { Attachment } from '@main/ipc/messages/types';
import Link from '@renderer/ui/Link';
import useClampedSize from '@renderer/utils/useClampedSize';

const MAX_IMAGE_SIZE = 512;

export type ImageAttachmentProps = { attachment: Pick<Attachment, 'width' | 'height' | 'name' | 'url'> };

export default function ImageAttachment({ attachment }: ImageAttachmentProps) {
  const [clampedWidth, clampedHeight] = useClampedSize({
    width: attachment.width ?? 1,
    height: attachment.height ?? 1,
    maxSize: MAX_IMAGE_SIZE,
  });

  return (
    <Link to={attachment.url} target="_blank" display="block" width={`${clampedWidth}px`} height={`${clampedHeight}px`}>
      <Image src={attachment.url} loading="lazy" alt={attachment.name} borderRadius="md" width="100%" height="100%" />
    </Link>
  );
}
