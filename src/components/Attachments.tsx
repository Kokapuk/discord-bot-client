import { Stack, StackProps } from '@chakra-ui/react';
import { Attachment as AttachmentType } from '@main/api/discord/types';
import { RefAttributes } from 'react';
import Attachment from './Attachment';

export type AttachmentsProps = { attachments: AttachmentType[] } & StackProps & RefAttributes<HTMLDivElement>;

export default function Attachments({ attachments, ...props }: AttachmentsProps) {
  return (
    <Stack {...props}>
      {attachments.map((attachment) => (
        <Attachment key={attachment.id} attachment={attachment} />
      ))}
    </Stack>
  );
}
