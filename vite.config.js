import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 환경 변수에 따라 개발/프로덕션 모드 구분
const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://dxa66rf338pjr.cloudfront.net',
        changeOrigin: true,
        secure: true,
        ws: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('프록시 에러:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('프록시 요청:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('프록시 응답:', proxyRes.statusCode, req.url)
          })
        },
      },
    },
  },
  build: {
    outDir: `dist/${mode}`,
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
})
