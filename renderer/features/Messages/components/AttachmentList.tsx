import { Stack, StackProps } from '@chakra-ui/react';
import { Attachment as AttachmentType } from '@main/features/messages/types';
import { RefAttributes } from 'react';
import Attachment from './Attachment';

export type AttachmentListBaseProps = { attachments: AttachmentType[] };
export type AttachmentListProps = AttachmentListBaseProps & StackProps & RefAttributes<HTMLDivElement>;

export default function AttachmentList({ attachments, ...props }: AttachmentListProps) {
  return (
    <Stack {...props}>
      {attachments.map((attachment) => (
        <Attachment key={attachment.id} attachment={attachment} />
      ))}
    </Stack>
  );
}
