import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: 'blue',
      background: 'transparent',
    },
    '*': {
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--chakra-colors-gray-700) transparent',
      boxSizing: 'border-box',
    },
  },
});

export const system = createSystem(defaultConfig, config);
