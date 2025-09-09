import { Link as ChakraLink, LinkProps as ChakraLinkProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';
import { Link as RouterLink } from 'react-router';

export type LinkBaseProps = { to: string };
export type LinkProps = LinkBaseProps & ChakraLinkProps & RefAttributes<HTMLAnchorElement>;

export default function Link(props: LinkProps) {
  return <ChakraLink as={RouterLink} {...props} />;
}
