import { Image, ImageProps } from '@chakra-ui/react';
import { Attachment } from '@main/ipc/messages/types';
import Link from '@renderer/ui/Link';
import useClampedSize from '@renderer/utils/useClampedSize';
import { RefAttributes } from 'react';

const MAX_IMAGE_SIZE = 512;

export type ImageAttachmentBaseProps = { attachment: Pick<Attachment, 'width' | 'height' | 'name' | 'url'> };
export type ImageAttachmentProps = ImageAttachmentBaseProps & ImageProps & RefAttributes<HTMLImageElement>;

export default function ImageAttachment({ attachment, ...props }: ImageAttachmentProps) {
  const [clampedWidth, clampedHeight] = useClampedSize({
    width: attachment.width ?? 1,
    height: attachment.height ?? 1,
    maxSize: MAX_IMAGE_SIZE,
  });

  return (
    <Link to={attachment.url} target="_blank" width="fit-content">
      <Image
        src={attachment.url}
        loading="lazy"
        alt={attachment.name}
        borderRadius="md"
        width={`${clampedWidth}px`}
        height={`${clampedHeight}px`}
        {...props}
      />
    </Link>
  );
}
