import routify from '@roxi/routify/vite-plugin';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { defineConfig } from 'vite';

import pkg from '../../package.json';

export default defineConfig({
  base: './',
  build: {
    assetsDir: '.',
    emptyOutDir: true,
    outDir: '../../build/renderer',
    sourcemap: false,
    target: 'esnext'
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules']
      }
    }
  },
  mode: process.env.MODE,
  optimizeDeps: {
    exclude: ['@roxi/routify']
  },
  plugins: [
    routify({
      routesDir: './packages/renderer/src/routes'
    }),
    svelte()
  ],
  resolve: {
    alias: {
      '/@/': path.join(__dirname, 'src') + '/'
    }
  },
  root: __dirname,
  server: {
    host: pkg.env.VITE_DEV_SERVER_HOST,
    port: pkg.env.VITE_DEV_SERVER_PORT
  }
});
