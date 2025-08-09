import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  server: {
    preset: 'bun', // Use Bun runtime for optimal performance
  },
  react: {
    babel: false, // Use SWC for faster builds
  },
  vite: {
    server: {
      port: 3000,
      host: '0.0.0.0', // Allow external connections (Docker)
    },
    build: {
      target: 'esnext', // Modern build target
      minify: 'esbuild', // Fast minification
      sourcemap: process.env.NODE_ENV === 'development',
    },
  },
})