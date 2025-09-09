import { Image, ImageProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';

export type AvatarProps = { src: string; size?: ImageProps['width'] } & Omit<ImageProps, 'src' | 'width' | 'height'>;

export default function Avatar({ size = '8', ...props }: AvatarProps & RefAttributes<HTMLImageElement>) {
  return <Image loading="lazy" borderRadius="full" width={size} height={size} {...props} />;
}
