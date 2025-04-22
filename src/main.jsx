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
  // 기본 설정
  dsn: import.meta.env.VITE_SENTRY_DSN,
  debug: true,
  environment: import.meta.env.MODE || 'development',
  
  // Error Monitoring 설정
  enabled: true,
  autoSessionTracking: true,
  sendClientReports: true,
  beforeSend(event) {
    console.log('Sending event to Sentry:', event)
    return event
  },

  // 도메인 설정
  allowUrls: [
    'http://localhost:5173',
    'https://dxa66rf338pjr.cloudfront.net',
    'https://luckeat.com'
  ],
  denyUrls: [],

  // Performance Monitoring 설정
  tracesSampleRate: 1.0,
  tracePropagationTargets: [
    'http://localhost:5173',
    'https://dxa66rf338pjr.cloudfront.net',
    'https://luckeat.com'
  ],

  // Session Replay 설정
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,

  // 통합 기능 설정
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        'http://localhost:5173',
        'https://dxa66rf338pjr.cloudfront.net',
        'https://luckeat.com'
      ],
    }),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // 릴리즈 정보
  release: '1.0.0',
})

// Sentry 초기화 확인
console.log('Sentry Initialized:', {
  client: Sentry.getCurrentHub().getClient(),
  options: Sentry.getCurrentHub().getClient()?.getOptions(),
})

// 테스트 에러 발생
setTimeout(() => {
  try {
    throw new Error('Sentry 테스트 에러')
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        environment: import.meta.env.MODE,
        test: 'true',
      },
      extra: {
        type: 'manual_test',
      },
    })
  }
}, 2000)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
