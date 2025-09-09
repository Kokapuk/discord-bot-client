'use client';

import { ChakraProvider as ExtendableChakraProvider } from '@chakra-ui/react';
import { ColorModeProvider, type ColorModeProviderProps } from './ColorMode';
import { system } from './theme';

export function ChakraProvider(props: ColorModeProviderProps) {
  return (
    <ExtendableChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ExtendableChakraProvider>
  );
}
