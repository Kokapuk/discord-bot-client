import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'main/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['zlib-sync', 'bufferutil', 'utf-8-validate', '@snazzah/davey', 'ffmpeg-static'],
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'main/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),

    tsconfigPaths(),
  ],
});
