import path from 'path'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow external connections (Docker)
    proxy: {
      // Proxy API calls to backend during development
      '/api': {
        target: process.env.API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'esnext', // Modern build target for better performance
    minify: 'esbuild', // Fast minification
    sourcemap: process.env.NODE_ENV === 'development',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({ 
      customViteReactPlugin: true,
      target: 'bun', // Use Bun runtime
    }),
    viteReact({
      babel: {
        plugins: [
          // Add any Babel plugins if needed
        ],
      },
    }),
    tailwindcss(),
  ],
})
