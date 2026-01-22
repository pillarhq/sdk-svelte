import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        // Generate runes-compatible output
        runes: true,
      },
    }),
    dts({ include: ['src'] }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PillarSvelte',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['svelte', 'svelte/store', '@pillar-ai/sdk'],
      output: {
        globals: {
          svelte: 'Svelte',
          'svelte/store': 'SvelteStore',
          '@pillar-ai/sdk': 'PillarSDK',
        },
      },
    },
  },
});
