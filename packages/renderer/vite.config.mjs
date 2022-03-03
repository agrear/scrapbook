/* eslint-env node */

import routify from '@roxi/routify/vite-plugin';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { builtinModules } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

import electronVendors from '../../electron-vendors.config.mjs';
import { loadAndSetEnv } from '../../scripts/loadAndSetEnv.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = __dirname;

/**
 * Vite looks for `.env.[mode]` files only in `PACKAGE_ROOT` directory.
 * Therefore, you must manually load and set the environment variables from the root directory above
 */
loadAndSetEnv(process.env.MODE, process.cwd());

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '/@/': path.join(PACKAGE_ROOT, 'src') + '/'
    }
  },
  plugins: [
    routify({
      routesDir: './packages/renderer/src/routes'
    }),
    svelte()
  ],
  base: '',
  server: {
    fsServe: {
      root: path.join(PACKAGE_ROOT, '../../')
    }
  },
  build: {
    polyfillDynamicImport: false,
    sourcemap: false,
    target: `chrome${electronVendors.chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    terserOptions: {
      ecma: 2020,
      compress: {
        passes: 2
      },
      safari10: false
    },
    rollupOptions: {
      external: [
        ...builtinModules
      ]
    },
    emptyOutDir: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules']
      }
    }
  },
  optimizeDeps: {
    exclude: ['@roxi/routify']
  }
});
