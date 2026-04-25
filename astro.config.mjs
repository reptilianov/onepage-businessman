import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
    server: {
      hmr: {
        overlay: true,
      },
    },
    optimizeDeps: {
      include: ['three'],
    },
  },
});