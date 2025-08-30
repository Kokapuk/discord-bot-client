import { Link as ChakraLink, LinkProps as ChakraLinkProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';
import { Link as RouterLink } from 'react-router';

export type LinkProps = { to: string } & Omit<ChakraLinkProps, 'as' | 'href'>;

export default function Link(props: LinkProps & RefAttributes<HTMLAnchorElement>) {
  return <ChakraLink as={RouterLink} {...props} />;
}
