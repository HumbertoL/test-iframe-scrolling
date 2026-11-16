import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// TEA's staging host sends `Content-Security-Policy: frame-ancestors https:`, so
// this harness must be served over https to frame it. `yarn start:http` is for
// framing a local cea-desktop on http://localhost:3000 (which is why we are not on 3000).
export default defineConfig(({ mode }) => ({
  plugins: [react(), mode !== 'http' && mode !== 'test' && basicSsl()],
  server: {
    port: 5180,
    open: true,
  },
  build: {
    // Keep CRA's output folder so the Netlify deploy settings still work.
    outDir: 'build',
    // One internal page with MUI + icons; splitting buys nothing here.
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'jsdom',
  },
}));
