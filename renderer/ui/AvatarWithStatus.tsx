import { Box, Wrap, WrapProps } from '@chakra-ui/react';
import { Status as StatusType } from '@main/ipc/client/types';
import { RefAttributes } from 'react';
import Avatar, { AvatarBaseProps, AvatarProps } from './Avatar';
import Status, { StatusProps } from './Status';

export type AvatarWithStatusBaseProps = AvatarBaseProps & { status: StatusType | undefined };
export type AvatarWithStatusProps = AvatarWithStatusBaseProps & {
  avatarProps?: AvatarProps & RefAttributes<HTMLImageElement>;
  statusProps?: StatusProps & RefAttributes<HTMLDivElement>;
} & WrapProps &
  RefAttributes<HTMLDivElement>;

const STATUS_INDICATOR_SIZE = 30;
const STATUS_INDICATOR_MASK_SIZE = 50;

export default function AvatarWithStatus({
  src,
  size = '8',
  status,
  avatarProps,
  statusProps,
  ...props
}: AvatarWithStatusProps) {
  return (
    <Wrap width={size} height={size} position="relative" {...props}>
      <Box
        maskImage={`radial-gradient(ellipse
          ${STATUS_INDICATOR_MASK_SIZE / 2}% ${STATUS_INDICATOR_MASK_SIZE / 2}%
          at ${100 - STATUS_INDICATOR_SIZE / 2}% ${100 - STATUS_INDICATOR_SIZE / 2}%, 
          transparent 100%, black 100%)`}
        maskRepeat="no-repeat"
        position="absolute"
        inset="0"
      >
        <Avatar src={src} position="absolute" inset="0" borderRadius="full" {...avatarProps} />
      </Box>
      <Status
        status={status}
        size={`${STATUS_INDICATOR_SIZE}%`}
        position="absolute"
        right="0"
        bottom="0"
        {...statusProps}
      />
    </Wrap>
  );
}
