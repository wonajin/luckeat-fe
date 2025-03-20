import apiClient from './apiClient'
import {
  handleSuccessResponse,
  handleErrorResponse,
} from '../utils/apiMessages'
import { API_BASE_URL, API_ENDPOINTS, getApiUrl } from '../config/apiConfig'

// 회원 가입
export const register = async (userData) => {
  try {
    console.log('회원가입 요청 데이터:', userData)

    // 사용자 유형(role) 확인 및 추가
    if (!userData.role && userData.userType) {
      userData.role = userData.userType === '사업자' ? 'seller' : 'buyer'
    }

    // 프록시를 통한 요청
    console.log('회원가입 요청 시작...')
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData)
    console.log('회원가입 요청 성공:', response.data)
    return handleSuccessResponse(response)
  } catch (error) {
    console.error('회원가입 오류:', error)
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
        localStorage.setItem('accessToken', response.data.accessToken)
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
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
    const response = await apiClient.post(API_ENDPOINTS.LOGOUT)
    // 로그아웃 성공 시 토큰 제거
    localStorage.removeItem('token')
    return handleSuccessResponse(response)
  } catch (error) {
    // 에러가 발생해도 토큰은 제거
    localStorage.removeItem('token')
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
