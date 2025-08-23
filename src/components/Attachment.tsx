import { type Attachment } from '@main/api/types';
import AudioAttachment from './AudioAttachment';
import FileAttachment from './FileAttachment';
import ImageAttachment from './ImageAttachment';
import VideoAttachment from './VideoAttachment';

export type AttachmentProps = { attachment: Attachment };

export default function Attachment({ attachment }: AttachmentProps) {
  if (attachment.contentType?.startsWith('image/')) {
    return <ImageAttachment attachment={attachment} />;
  }

  if (attachment.contentType?.startsWith('video/')) {
    return <VideoAttachment attachment={attachment} />;
  }

  if (attachment.contentType?.startsWith('audio/')) {
    return <AudioAttachment attachment={attachment} />;
  }

  return <FileAttachment attachment={attachment} />;
}
