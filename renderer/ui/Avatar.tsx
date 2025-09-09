import { Image, ImageProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';

export type AvatarBaseProps = { src: string; size?: ImageProps['width'] };
export type AvatarProps = AvatarBaseProps & ImageProps & RefAttributes<HTMLImageElement>;

export default function Avatar({ size = '8', ...props }: AvatarProps) {
  return <Image loading="lazy" borderRadius="full" width={size} height={size} {...props} />;
}
