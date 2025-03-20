import apiClient from './apiClient'
import {
  handleSuccessResponse,
  handleErrorResponse,
} from '../utils/apiMessages'
import { API_BASE_URL, API_ENDPOINTS, getApiUrl } from '../config/apiConfig'
import { TOKEN_KEYS } from './apiClient'
import axios from 'axios'

// 회원 가입
export const register = async (userData) => {
  try {
    console.log('userApi - 회원가입 요청 데이터:', userData)

    // 복사본 생성 (원본 데이터 변경 방지)
    const requestData = { ...userData }

    // 사용자 유형(role) 확인 및 대문자로 변환
    if (requestData.role) {
      requestData.role = requestData.role.toUpperCase()
    } else if (requestData.userType) {
      requestData.role = requestData.userType === '사업자' ? 'SELLER' : 'BUYER'
    }

    // userType 필드 제거
    if (requestData.userType) {
      delete requestData.userType
    }

    // 프록시를 통한 요청
    console.log('userApi - 회원가입 수정된 요청 데이터:', requestData)
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, requestData)
    console.log('userApi - 회원가입 응답 데이터:', response.data, '상태 코드:', response.status)
    
    // 성공 응답 처리 및 메시지 로그
    const result = handleSuccessResponse(response);
    console.log('userApi - 회원가입 최종 결과 객체:', result);
    
    // 명시적으로 success: true 설정
    if (response.status === 201) {
      result.success = true;
      console.log('userApi - 상태 코드가 201이므로 success를 true로 설정');
    }
    
    return result;
  } catch (error) {
    console.error('userApi - 회원가입 오류:', error)

    // 서버 오류(500)인 경우 더 자세한 메시지 제공
    if (error.response && error.response.status === 500) {
      return {
        success: false,
        message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        error: error.response.data || error.message,
      }
    }

    return handleErrorResponse(error)
  }
}

// 로그인
export const login = async (credentials) => {
  try {
    console.log('로그인 요청 데이터:', credentials)

    // 프록시를 통한 요청
    console.log('로그인 요청 시작...')
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials)
    console.log('로그인 성공:', response.data)

    // 로그인 성공 시 사용자 정보 및 토큰 저장
    if (response.data) {
      // 토큰 저장
      if (response.data.accessToken) {
        localStorage.setItem(TOKEN_KEYS.ACCESS, response.data.accessToken)
      }
      if (response.data.refreshToken) {
        localStorage.setItem(TOKEN_KEYS.REFRESH, response.data.refreshToken)
      }
      // 이전 버전 호환을 위한 token 저장
      if (response.data.accessToken && !response.data.token) {
        localStorage.setItem(TOKEN_KEYS.LEGACY, response.data.accessToken)
      } else if (response.data.token) {
        localStorage.setItem(TOKEN_KEYS.LEGACY, response.data.token)
      }

      // 사용자 정보 저장
      const userData = {
        userId: response.data.userId,
        email: response.data.email,
        nickname: response.data.nickname,
        role: response.data.role,
      }
      localStorage.setItem('user', JSON.stringify(userData))
    }

    return handleSuccessResponse(response)
  } catch (error) {
    console.error('로그인 오류:', error)
    return handleErrorResponse(error)
  }
}

// 로그아웃
export const logout = async () => {
  try {
    // 현재 액세스 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken')
    console.log(
      '로그아웃 시도: 액세스 토큰 확인',
      accessToken ? '토큰 있음' : '토큰 없음',
    )

    // 헤더에 Authorization 토큰 추가
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }

    console.log('로그아웃 API 요청 시작: /users/logout')
    // /api/v1/users/logout 엔드포인트로 요청
    const response = await apiClient.post('/users/logout', {}, config)
    console.log('로그아웃 API 응답 수신:', response)

    // 로그아웃 성공 시 로컬 스토리지의 모든 토큰 제거
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('token') // 이전 토큰도 제거
    console.log('로컬 스토리지 토큰 제거 완료')

    return handleSuccessResponse(response)
  } catch (error) {
    // 에러가 발생해도 토큰은 제거
    console.error('로그아웃 중 오류 발생:', error)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('token') // 이전 토큰도 제거
    console.log('오류 발생 시에도 로컬 스토리지 토큰 제거 완료')

    return handleErrorResponse(error)
  }
}

// 이메일 중복 확인
export const checkEmailDuplicate = async (email) => {
  try {
    const response = await apiClient.get(`/users/emailValid?email=${email}`)
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

// 닉네임 중복 확인
export const checkNicknameDuplicate = async (nickname) => {
  try {
    const response = await apiClient.get(
      `/users/nicknameVaild?nickname=${nickname}`,
    )
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

// 회원 정보 조회
export const getUserInfo = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.USER_INFO)
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

// 닉네임 수정
export const updateNickname = async (nickname) => {
  try {
    const response = await apiClient.patch(API_ENDPOINTS.UPDATE_NICKNAME, {
      nickname,
    })
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

// 비밀번호 수정
export const updatePassword = async (passwordData) => {
  try {
    const response = await apiClient.patch('/users/password', passwordData)
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

// 회원 탈퇴
export const deleteAccount = async () => {
  try {
    const response = await apiClient.delete('/users')
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}
