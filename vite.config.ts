/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8102, // Match your current port
    proxy: {
      // Proxy all API calls to your ERPNext server
      '/api': {
        target: 'https://demo3.dr.net.sa',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          console.log('Proxying request:', path)
          return path
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxy request to:', proxyReq.getHeader('host'), proxyReq.path)
            // Add necessary headers
            proxyReq.setHeader('Accept', 'application/json')
            if (req.method === 'POST') {
              proxyReq.setHeader('Content-Type', 'application/json')
            }
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url)
          })
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err.message)
          })
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})