import { Card, FormatByte, Icon, Stack, Text } from '@chakra-ui/react';
import Link from '@renderer/ui/Link';
import { RefAttributes } from 'react';
import { FaFile } from 'react-icons/fa6';
import { AttachmentProps } from './Attachment';

export type FileAttachmentProps = AttachmentProps & Card.RootProps & RefAttributes<HTMLDivElement>;

export default function FileAttachment({ attachment, ...props }: FileAttachmentProps) {
  return (
    <Card.Root variant="subtle" width="fit-content" maxWidth="32rem" {...props}>
      <Card.Body gap="2" padding="4" flexDirection="row" alignItems="center">
        <Icon size="2xl" color="colorPalette.fg">
          <FaFile />
        </Icon>
        <Stack gap="0" width="100%" minWidth="0">
          <Link
            to={attachment.url}
            target="_blank"
            width="100%"
            overflow="hidden"
            textOverflow="ellipsis"
            display="block"
            whiteSpace="nowrap"
          >
            {attachment.name}
          </Link>
          <Text fontSize={12} color="fg.muted">
            <FormatByte value={attachment.size} />
          </Text>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
