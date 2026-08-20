import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { testingFeedbackApiPlugin } from './scripts/vite-testing-feedback-api.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), testingFeedbackApiPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        homepage: resolve(__dirname, 'homepage.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        payViaLink: resolve(__dirname, 'pay-via-link.html'),
        systemdocs: resolve(__dirname, 'systemdocs.html'),
      },
    },
  },
  server: {
    host: true,
    port: 5177,
    strictPort: true,
  },
})
