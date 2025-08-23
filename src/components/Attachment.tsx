import { type Attachment } from '@main/api/types';
import FileAttachment from './FileAttachment';
import ImageAttachment from './ImageAttachment';

export type AttachmentProps = { attachment: Attachment };

export default function Attachment({ attachment }: AttachmentProps) {
  if (attachment.contentType?.startsWith('image/')) {
    return <ImageAttachment attachment={attachment} />;
  }

  return <FileAttachment attachment={attachment} />;
}
