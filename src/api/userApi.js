import apiClient from './apiClient'
import {
  handleSuccessResponse,
  handleErrorResponse,
} from '../utils/apiMessages'
import { API_BASE_URL, API_ENDPOINTS, getApiUrl } from '../config/apiConfig'
import { TOKEN_KEYS } from './apiClient'

// 회원 가입
export const register = async (userData) => {
  try {
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
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, requestData)

    const result = handleSuccessResponse(response)
    return result
  } catch (error) {
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
    // 프록시를 통한 요청
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials)

    // 로그인 성공 여부 확인 (더 유연하게 처리)
    // 1. 명시적인 success 플래그가 있는 경우 이를 확인
    // 2. 없는 경우, HTTP 상태 코드가 200/201이고 accessToken이 있으면 성공으로 판단
    const hasSuccessFlag = response.data && response.data.hasOwnProperty('success');
    const isImplicitSuccess = !hasSuccessFlag && 
                             (response.status === 200 || response.status === 201) && 
                             response.data && 
                             response.data.accessToken;
    
    if ((hasSuccessFlag && response.data.success === true) || isImplicitSuccess) {
      // 토큰 저장
      if (response.data.accessToken) {
        localStorage.setItem(TOKEN_KEYS.ACCESS, response.data.accessToken)
      }
      
      if (response.data.refreshToken) {
        localStorage.setItem(TOKEN_KEYS.REFRESH, response.data.refreshToken)
      }

      // 사용자 정보 저장 (더 유연하게 처리)
      const userData = {
        userId: response.data.userId || response.data.id || '',
        email: response.data.email || credentials.email || '',
        nickname: response.data.nickname || '',
        role: response.data.role || 'BUYER', // 기본값 설정
      }
      
      localStorage.setItem('user', JSON.stringify(userData))
      
      // success 플래그가 없는 경우, 응답에 명시적으로 추가
      if (!hasSuccessFlag) {
        response.data.success = true;
      }
    } else {
      // 로그인 실패 시 기존 토큰 제거
      localStorage.removeItem(TOKEN_KEYS.ACCESS)
      localStorage.removeItem(TOKEN_KEYS.REFRESH)
      localStorage.removeItem('user')
      
      // success 플래그가 없는 경우, 응답에 명시적으로 추가
      if (!hasSuccessFlag) {
        response.data = response.data || {};
        response.data.success = false;
      }
    }

    return handleSuccessResponse(response)
  } catch (error) {
    // 오류 발생 시 토큰 제거
    localStorage.removeItem(TOKEN_KEYS.ACCESS)
    localStorage.removeItem(TOKEN_KEYS.REFRESH)
    localStorage.removeItem('user')

    return handleErrorResponse(error)
  }
}

// 로그아웃
export const logout = async () => {
  try {
    // 현재 액세스 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken')

    // 헤더에 Authorization 토큰 추가
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }

    // API_ENDPOINTS 사용
    const response = await apiClient.post(API_ENDPOINTS.LOGOUT, {}, config)

    // 로그아웃 성공 시 로컬 스토리지의 모든 토큰 제거
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    return handleSuccessResponse(response)
  } catch (error) {
    // 에러가 발생해도 토큰은 제거
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

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