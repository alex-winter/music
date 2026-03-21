const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

module.exports = defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'client'),
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': apiProxyTarget,
      '/auth': apiProxyTarget,
      '/media': apiProxyTarget
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/client'),
    emptyOutDir: true
  }
});
