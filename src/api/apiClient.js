import axios from 'axios'
import { handleErrorResponse, ERROR_MESSAGES } from '../utils/apiMessages'
import { API_BASE_URL, API_DIRECT_URL } from '../config/apiConfig'

// API 접두사 설정
const API_PREFIX = '/api'

// 토큰 관련 상수
export const TOKEN_KEYS = {
  ACCESS: 'accessToken', // 액세스 토큰 키
  REFRESH: 'refreshToken', // 리프레시 토큰 키
}

// 한국 시간대 설정
const koreaTimeZone = 'Asia/Seoul'
const now = new Date()
const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: koreaTimeZone }))
Date.prototype.getTimezoneOffset = function() {
  return -540 // 한국 시간대 UTC+9
}

// axios 인스턴스 생성
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
  withCredentials: false, // CORS 인증 정보 전송 설정
})

// 요청 인터셉터 설정
apiClient.interceptors.request.use(
  (config) => {
    // URL이 상대경로인 경우 기본 도메인 추가
    if (
      config.url &&
      !config.url.startsWith('http') &&
      !config.url.startsWith('https')
    ) {
      // URL 통합 처리
      if (config.url.startsWith('/v1/')) {
        // /v1/로 시작하는 경우 - /api를 추가하고 도메인 추가
        config.url = `${API_DIRECT_URL}/api${config.url}`
      } else if (config.url.startsWith('/api/')) {
        // /api/로 시작하는 경우 - 그대로 도메인만 추가
        config.url = `${API_DIRECT_URL}${config.url}`
      } else {
        // 그 외 - 모든 API 엔드포인트는 /api/v1/로 시작하도록 설정
        config.url = `${API_DIRECT_URL}/api/v1${config.url.startsWith('/') ? '' : '/'}${config.url}`
      }
    }

    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 시간대 설정
    config.headers['X-Timezone'] = koreaTimeZone

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

// HTML 응답인지 확인하는 함수
const isHtmlResponse = (response) => {
  // Content-Type 헤더 확인
  const contentType = response.headers && response.headers['content-type'];
  if (contentType && contentType.includes('text/html')) {
    return true;
  }
  
  // 데이터가 HTML인지 문자열 기반으로 확인
  if (typeof response.data === 'string' && 
     (response.data.includes('<!DOCTYPE html>') || 
      response.data.includes('<html') || 
      response.data.includes('<body'))) {
    return true;
  }
  
  return false;
};

// HTML 응답을 사용자 친화적인 오류 메시지로 변환
const transformHtmlResponse = (response) => {
  console.warn('HTML 응답이 감지되었습니다:', response.config.url);
  
  // 로그인 관련 엔드포인트인 경우
  if (response.config.url.includes('/login') || response.config.url.includes('/auth')) {
    return {
      ...response,
      data: {
        success: false,
        message: '로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.'
      }
    };
  }
  
  // 기본 변환
  return {
    ...response,
    data: {
      success: false,
      message: '서버에서 예상치 못한 응답을 받았습니다. 잠시 후 다시 시도해주세요.'
    }
  };
};

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
  (response) => {
    // HTML 응답 감지 및 변환
    if (isHtmlResponse(response)) {
      return transformHtmlResponse(response);
    }
  
    // UTC 시간을 한국 시간으로 변환하는 함수
    const convertUTCToKoreaTime = (data) => {
      if (!data) return data
      
      if (Array.isArray(data)) {
        return data.map((item) => convertUTCToKoreaTime(item))
      }
      
      if (typeof data === 'object') {
        const converted = {}
        for (const key in data) {
          if (
            key.toLowerCase().includes('time') || 
            key.toLowerCase().includes('date') ||
            key.toLowerCase().includes('createdat') ||
            key.toLowerCase().includes('updatedat') ||
            key.toLowerCase().includes('reservationtime')
          ) {
            // ISO 8601 형식의 날짜/시간 문자열인 경우 변환
            if (typeof data[key] === 'string' && data[key].includes('T')) {
              try {
                const date = new Date(data[key])
                if (!isNaN(date.getTime())) {
                  // 한국 시간으로 변환 (UTC+9)
                  const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000)
                  converted[key] = koreaTime.toISOString()
                } else {
                  converted[key] = data[key]
                }
              } catch (error) {
                console.error('날짜 변환 오류:', error)
                converted[key] = data[key]
              }
            } else {
              converted[key] = data[key]
            }
          } else if (typeof data[key] === 'object') {
            converted[key] = convertUTCToKoreaTime(data[key])
          } else {
            converted[key] = data[key]
          }
        }
        return converted
      }
      
      return data
    }

    // 응답 데이터의 시간 필드 변환
    if (response.data) {
      response.data = convertUTCToKoreaTime(response.data)
    }

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
    // HTML 응답 감지 (오류 객체 내부)
    if (error.response && isHtmlResponse(error.response)) {
      console.warn('오류 응답에서 HTML이 감지되었습니다.');
      const transformedResponse = transformHtmlResponse(error.response);
      return Promise.reject({
        ...error,
        response: transformedResponse,
        message: transformedResponse.data.message
      });
    }
  
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
