import { defineConfig } from '@chakra-ui/react';
import { Settings } from '@main/utils/settingsStore';

export const createTheme = ({ accentColor }: { accentColor: Settings['accentColor'] }) =>
  defineConfig({
    theme: {
      semanticTokens: {
        colors: {
          bg: {
            transparentPanel: { value: { _light: '{colors.bg.inverted/10}', _dark: '{colors.bg/40}' } },
          },
        },
      },
    },
    globalCss: {
      html: {
        colorPalette: accentColor,
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
