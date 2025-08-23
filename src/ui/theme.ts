import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: 'blue',
      background: 'transparent',
    },
    '*': {
      scrollbarWidth: 'thin',
      scrollbarColor: 'transparent transparent',
      boxSizing: 'border-box',
    },
    '*:hover': {
      scrollbarColor: 'var(--chakra-colors-gray-700) transparent',
    },
  },
});

export const system = createSystem(defaultConfig, config);
