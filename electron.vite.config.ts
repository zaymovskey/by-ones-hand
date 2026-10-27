import { defineConfig } from 'electron-vite';
import { resolve } from 'node:path';

export default defineConfig({
  main: { build: { rollupOptions: { input: resolve('electron/main.ts'), output: { format: 'cjs', entryFileNames: 'main.cjs' } } } },
  preload: { build: { rollupOptions: { input: resolve('electron/preload.ts'), output: { format: 'cjs', entryFileNames: 'preload.cjs' } } } },
  renderer: {
    root: '.',
    base: './',
    server: { host: '127.0.0.1' },
    build: { minify: true, rollupOptions: { input: resolve('index.html') } },
  },
});