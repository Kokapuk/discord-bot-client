import { Box, Wrap, WrapProps } from '@chakra-ui/react';
import { Status as StatusType } from '@main/api/discord/types';
import { RefAttributes } from 'react';
import Avatar, { AvatarProps } from './Avatar';
import Status from './Status';

export type AvatarWithStatusProps = { src: string; size?: AvatarProps['size']; status: StatusType | undefined } & Omit<
  WrapProps,
  'children'
>;

const STATUS_INDICATOR_SIZE = 30;
const STATUS_INDICATOR_MASK_SIZE = 50;

export default function AvatarWithStatus({
  src,
  size = '8',
  status,
  ...props
}: AvatarWithStatusProps & RefAttributes<HTMLDivElement>) {
  return (
    <Wrap width={size} height={size} position="relative" {...props}>
      <Box
        maskImage={`radial-gradient(ellipse
          ${STATUS_INDICATOR_MASK_SIZE / 2}% ${STATUS_INDICATOR_MASK_SIZE / 2}% at 
          ${100 - STATUS_INDICATOR_SIZE / 2}% ${100 - STATUS_INDICATOR_SIZE / 2}%, 
          transparent 99%, black 99%, black 100%)`}
        maskRepeat="no-repeat"
        position="absolute"
        inset="0"
      >
        <Avatar src={src} position="absolute" inset="0" borderRadius="full" />
      </Box>
      <Status status={status} size={`${STATUS_INDICATOR_SIZE}%`} position="absolute" right="0" bottom="0" />
    </Wrap>
  );
}
