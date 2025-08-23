import { Image, Link } from '@chakra-ui/react';
import useClampedSize from '@renderer/utils/useClampedSize';
import { AttachmentProps } from './Attachment';

const MAX_IMAGE_SIZE = 512;

export default function ImageAttachment({ attachment }: AttachmentProps) {
  const [clampedWidth, clampedHeight] = useClampedSize({
    width: attachment.width ?? 1,
    height: attachment.height ?? 1,
    maxSize: MAX_IMAGE_SIZE,
  });

  return (
    <Link href={attachment.url} target="_blank" display="block" width={clampedWidth} height={clampedHeight}>
      <Image src={attachment.url} loading="lazy" alt={attachment.name} borderRadius="5px" width="100%" height="100%" />
    </Link>
  );
}
