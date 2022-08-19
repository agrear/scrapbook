import { builtinModules } from 'module';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
      fileName: '[name].cjs'
    },
    minify: process.env.MODE === 'development' ? false : 'esbuild',
    outDir: '../../build/main',
    rollupOptions: {
      external: [
        'better-sqlite3',
        'electron',
        'nanoid',
        'sharp',
        ...builtinModules
      ],
      output: {
        entryFileNames: '[name].cjs'
      }
    },
    sourcemap: true,
    target: 'node16'
  },
  envDir: process.cwd(),
  mode: process.env.MODE,
  root: __dirname
});
