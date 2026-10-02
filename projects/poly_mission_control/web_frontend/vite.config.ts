import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8999',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8999',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: [
      { find: /^react$/, replacement: 'preact/compat' },
      { find: /^react-dom\/test-utils$/, replacement: 'preact/test-utils' },
      { find: /^react-dom$/, replacement: 'preact/compat' },
      { find: /^react\/jsx-runtime$/, replacement: 'preact/jsx-runtime' },
    ],
  },
});
