import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    // Keep CRA's output folder so the Netlify deploy settings still work.
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
  },
});
