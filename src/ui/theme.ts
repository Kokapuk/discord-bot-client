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
      scrollbarColor: 'color-mix(in srgb, var(--chakra-colors-bg-inverted), transparent 85%) transparent',
    },
  },
});

export const system = createSystem(defaultConfig, config);
