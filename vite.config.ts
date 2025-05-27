import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { UserConfig, ConfigEnv } from 'vite'

// 환경 변수에 따라 개발/프로덕션 모드 구분
const defaultMode: string =
  process.env.NODE_ENV === 'production' ? 'production' : 'development'

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd())
  
  // 기본 API URL 설정 (환경변수가 없으면 클라우드프론트 URL 사용)
  const apiUrl: string = env.VITE_API_URL || 'https://dxa66rf338pjr.cloudfront.net'
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: apiUrl,
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
  }
}) 