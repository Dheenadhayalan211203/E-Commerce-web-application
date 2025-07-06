import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: '.',
    emptyOutDir: true,
  },
  base: './', // Critical for Hostinger
  server: {
    historyApiFallback: true,
  }
});