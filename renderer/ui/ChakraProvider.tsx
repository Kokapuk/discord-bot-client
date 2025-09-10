'use client';

import { createSystem, defaultConfig, ChakraProvider as ExtendableChakraProvider } from '@chakra-ui/react';
import { Settings } from '@main/utils/settingsStore';
import { useEffect, useMemo, useState } from 'react';
import { ColorModeProvider, type ColorModeProviderProps } from './ColorMode';
import { createTheme } from './theme';

export function ChakraProvider(props: ColorModeProviderProps) {
  const [accentColor, setAccentColor] = useState<Settings['accentColor']>('blue');

  useEffect(() => {
    (async () => {
      setAccentColor(await window.ipcRenderer.invoke('getAccentColor'));
    })();

    const unsubscribe = window.ipcRenderer.on('accentColorUpdate', (_, color) => {
      setAccentColor(color);
    });

    return unsubscribe;
  }, []);

  const system = useMemo(() => {
    const theme = createTheme({ accentColor });
    return createSystem(defaultConfig, theme);
  }, [accentColor]);

  return (
    <ExtendableChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ExtendableChakraProvider>
  );
}
