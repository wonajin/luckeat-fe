import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import { Replay } from '@sentry/replay'

// Sentry 초기화
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
    new Replay({
      // 세션 리플레이 설정
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // 성능 추적 샘플링 비율 (0.0 ~ 1.0)
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  // 세션 리플레이 샘플링 비율
  replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  // 오류 발생 시 세션 리플레이 샘플링 비율
  replaysOnErrorSampleRate: 1.0,

  // 환경 설정
  environment: import.meta.env.MODE || 'development',
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
