import { Stack, StackProps } from '@chakra-ui/react';
import { Attachment as AttachmentType } from '@main/ipc/messages/types';
import { RefAttributes } from 'react';
import Attachment from './Attachment';

export type AttachmentListProps = { attachments: AttachmentType[] } & StackProps & RefAttributes<HTMLDivElement>;

export default function AttachmentList({ attachments, ...props }: AttachmentListProps) {
  return (
    <Stack {...props}>
      {attachments.map((attachment) => (
        <Attachment key={attachment.id} attachment={attachment} />
      ))}
    </Stack>
  );
}
