import axios from 'axios'
import { handleErrorResponse, ERROR_MESSAGES } from '../utils/apiMessages'

// API 접두사 설정
const API_PREFIX = '/api'

// 토큰 관련 상수
export const TOKEN_KEYS = {
  ACCESS: 'accessToken', // 액세스 토큰 키
  REFRESH: 'refreshToken', // 리프레시 토큰 키
}

// axios 인스턴스 생성
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
})

// 요청 인터셉터 설정
apiClient.interceptors.request.use(
  (config) => {
    // API 접두사 추가
    if (
      config.url &&
      !config.url.startsWith('http') &&
      !config.url.startsWith('https')
    ) {
      // URL이 절대 경로가 아닌 경우 처리
      
      // v1이 중복으로 포함되지 않도록 확인
      let processedUrl = config.url;
      
      // '/v1/'으로 시작하는 URL 처리
      if (processedUrl.startsWith('/v1/')) {
        // /v1/이 이미 포함된 URL - 도메인만 추가
        config.url = `https://luckeat.net/api${processedUrl}`;
      } 
      // '/api/'로 시작하는 URL 처리
      else if (processedUrl.startsWith('/api/')) {
        // 그대로 사용
        config.url = `https://luckeat.net${processedUrl}`;
      }
      // 그 외 URL 처리 (v1이 없는 경우)
      else {
        // 경로 앞에 /api를 추가
        config.url = `https://luckeat.net/api${processedUrl.startsWith('/') ? '' : '/'}${processedUrl}`;
      }
    }

    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    console.log('요청 전송:', config.method.toUpperCase(), config.url)
    console.log('요청 헤더:', JSON.stringify(config.headers, null, 2))
    if (config.data) {
      console.log('요청 데이터:', JSON.stringify(config.data, null, 2))
    }
    return config
  },
  (error) => {
    console.error('요청 오류:', error)
    return Promise.reject(error)
  },
)

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      '응답 수신:',
      response.status,
      response.config.method.toUpperCase(),
      response.config.url,
      response.data,
    )
    return response
  },
  (error) => {
    // 에러 처리
    if (error.response) {
      const { status, data, config } = error.response
      console.error(
        `응답 오류 [${status}]:`,
        config.method.toUpperCase(),
        config.url,
        data,
      )

      // 인증 에러 (401)
      if (status === 401) {
        const errorMessage = data.message || ERROR_MESSAGES.UNAUTHORIZED

        // 토큰 만료인 경우
        if (errorMessage === ERROR_MESSAGES.TOKEN_EXPIRED) {
          // 토큰 제거 및 로그인 페이지로 리다이렉션
          localStorage.removeItem(TOKEN_KEYS.ACCESS)
          localStorage.removeItem(TOKEN_KEYS.REFRESH)
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      }

      // 권한 에러 (403)
      else if (status === 403) {
        console.error(
          '권한이 없습니다:',
          data.message || ERROR_MESSAGES.FORBIDDEN,
        )
      }

      // 리소스 없음 (404)
      else if (status === 404) {
        const notFoundMessage =
          data.message || '요청한 리소스를 찾을 수 없습니다.'
        console.error(notFoundMessage)
      }

      // 유효성 검사 실패 (400)
      else if (status === 400) {
        console.error(
          '잘못된 요청입니다:',
          data.message || ERROR_MESSAGES.BAD_REQUEST,
        )
      }

      // 중복 에러 (409)
      else if (status === 409) {
        console.error('리소스 중복 오류:', data.message)
      }

      // 서버 에러 (500)
      else if (status === 500) {
        console.error(
          '서버 오류가 발생했습니다:',
          data.message || ERROR_MESSAGES.SERVER_ERROR,
        )
      }
    } else if (error.request) {
      console.error('응답을 받지 못했습니다. 네트워크 연결을 확인하세요.')
    } else {
      console.error('요청 설정 중 오류가 발생했습니다:', error.message)
    }

    return Promise.reject(error)
  },
)

export default apiClient
