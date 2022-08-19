import { builtinModules } from 'module';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs']
    },
    minify: process.env.MODE === 'development' ? false : 'esbuild',
    outDir: '../../build/preload',
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules
      ],
      output: {
        entryFileNames: '[name].cjs'
      }
    },
    sourcemap: 'inline',
    target: 'node16'
  },
  envDir: process.cwd(),
  mode: process.env.MODE,
  root: __dirname
});
