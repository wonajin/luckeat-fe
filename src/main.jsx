import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import * as Sentry from '@sentry/react'

// 환경 변수 확인
console.log('Current Environment:', {
  MODE: import.meta.env.MODE,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN ? 'exists' : 'missing',
  BASE_URL: import.meta.env.BASE_URL,
})

// Sentry 초기화
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0,
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/luckeat\.com/,
    /^https:\/\/dxa66rf338pjr\.cloudfront\.net/,
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // 환경 설정
  environment: import.meta.env.MODE || 'development',
  debug: true,
})

// Sentry 초기화 확인
console.log('Sentry Initialized:', {
  client: Sentry.getCurrentHub().getClient(),
  options: Sentry.getCurrentHub().getClient()?.getOptions(),
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
