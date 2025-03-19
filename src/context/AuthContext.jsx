import { createContext, useContext, useState, useEffect } from 'react'
import * as userApi from '../api/userApi'
import { SUCCESS_MESSAGES } from '../utils/apiMessages'

// 인증 컨텍스트 생성
const AuthContext = createContext()

// 인증 컨텍스트 제공자 컴포넌트
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        if (token) {
          // 토큰이 있으면 사용자 정보 요청
          try {
            const response = await userApi.getUserInfo()
            if (response.success) {
              setUser(response.data)
              setIsLoggedIn(true)
            } else {
              // 토큰이 유효하지 않은 경우
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            }
          } catch (error) {
            // 토큰이 유효하지 않은 경우
            console.error('인증 오류:', error)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        }
      } catch (error) {
        console.error('인증 상태 확인 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  // 로그인 함수
  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await userApi.login(credentials)

      if (
        response.success &&
        response.message === SUCCESS_MESSAGES.LOGIN_SUCCESS
      ) {
        // 로그인 성공 후 사용자 정보 가져오기
        const userResponse = await userApi.getUserInfo()
        if (userResponse.success) {
          setUser(userResponse.data)
          setIsLoggedIn(true)
          localStorage.setItem('user', JSON.stringify(userResponse.data))
          return { success: true }
        }
      }
      return {
        success: false,
        message: response.message || '로그인에 실패했습니다.',
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '로그인에 실패했습니다.',
      }
    } finally {
      setLoading(false)
    }
  }

  // 회원가입 함수
  const signup = async (userData) => {
    try {
      setLoading(true)
      const response = await userApi.register(userData)

      if (
        response.success &&
        response.message === SUCCESS_MESSAGES.REGISTER_SUCCESS
      ) {
        return { success: true, message: '회원가입에 성공했습니다.' }
      }
      return {
        success: false,
        message: response.message || '회원가입에 실패했습니다.',
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '회원가입에 실패했습니다.',
      }
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃 함수
  const logout = async () => {
    try {
      setLoading(true)
      const response = await userApi.logout()

      if (response.success) {
        setUser(null)
        setIsLoggedIn(false)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return { success: true }
      }
      return {
        success: false,
        message: response.message || '로그아웃에 실패했습니다.',
      }
    } catch (error) {
      console.error('로그아웃 오류:', error)
      return {
        success: false,
        message: error.message || '로그아웃에 실패했습니다.',
      }
    } finally {
      setLoading(false)
    }
  }

  // 닉네임 수정 함수
  const updateNickname = async (nickname) => {
    try {
      setLoading(true)
      const response = await userApi.updateNickname(nickname)

      if (
        response.success &&
        response.message === SUCCESS_MESSAGES.USER_UPDATE_SUCCESS
      ) {
        // 사용자 정보 업데이트
        const userResponse = await userApi.getUserInfo()
        if (userResponse.success) {
          setUser(userResponse.data)
          localStorage.setItem('user', JSON.stringify(userResponse.data))
          return { success: true }
        }
      }
      return {
        success: false,
        message: response.message || '닉네임 수정에 실패했습니다.',
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '닉네임 수정에 실패했습니다.',
      }
    } finally {
      setLoading(false)
    }
  }

  // 비밀번호 수정 함수
  const updatePassword = async (passwordData) => {
    try {
      setLoading(true)
      const response = await userApi.updatePassword(passwordData)

      if (
        response.success &&
        response.message === SUCCESS_MESSAGES.USER_UPDATE_SUCCESS
      ) {
        return { success: true }
      }
      return {
        success: false,
        message: response.message || '비밀번호 수정에 실패했습니다.',
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '비밀번호 수정에 실패했습니다.',
      }
    } finally {
      setLoading(false)
    }
  }

  // 회원 탈퇴 함수
  const deleteAccount = async () => {
    try {
      setLoading(true)
      const response = await userApi.deleteAccount()

      if (
        response.success &&
        response.message === SUCCESS_MESSAGES.USER_DELETE_SUCCESS
      ) {
        setUser(null)
        setIsLoggedIn(false)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return { success: true }
      }
      return {
        success: false,
        message: response.message || '회원 탈퇴에 실패했습니다.',
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '회원 탈퇴에 실패했습니다.',
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        loading,
        login,
        signup,
        logout,
        updateNickname,
        updatePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// 인증 컨텍스트 사용을 위한 커스텀 훅
export function useAuth() {
  return useContext(AuthContext)
}
