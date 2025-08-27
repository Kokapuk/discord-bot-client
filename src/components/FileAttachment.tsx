import { Card, Icon, Link, Stack, Text } from '@chakra-ui/react';
import formatBytes from '@renderer/utils/formatBytes';
import { FaFile } from 'react-icons/fa6';
import { AttachmentProps } from './Attachment';

export default function FileAttachment({ attachment }: AttachmentProps) {
  return (
    <Card.Root variant="subtle" width="fit-content" maxWidth="32rem">
      <Card.Body gap="2" padding="4" flexDirection="row" alignItems="center">
        <Icon size="2xl" color="colorPalette.fg">
          <FaFile />
        </Icon>
        <Stack gap="0" width="100%" minWidth="0">
          <Link
            href={attachment.url}
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
            {formatBytes(attachment.size)}
          </Text>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
