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
        const accessToken = localStorage.getItem('accessToken')
        const storedUser = localStorage.getItem('user')

        if (accessToken && storedUser) {
          // 저장된 사용자 정보가 있으면 바로 설정
          setUser(JSON.parse(storedUser))
          setIsLoggedIn(true)

          // 선택적으로 백엔드에서 최신 사용자 정보 요청 (refreshUser 함수와 같은 걸 만들 수 있음)
          try {
            const response = await userApi.getUserInfo()
            if (response.success) {
              setUser(response.data)
              localStorage.setItem('user', JSON.stringify(response.data))
            }
          } catch (error) {
            console.log('사용자 정보 갱신 실패:', error)
            // 오류가 있더라도 로그인 상태는 유지
          }
        } else {
          // 토큰이나 사용자 정보가 없는 경우 로그아웃 상태로 설정
          setUser(null)
          setIsLoggedIn(false)
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

      if (response.success) {
        // 로그인 성공 시 이미 userApi.login에서 로컬 스토리지에 사용자 정보와 토큰을 저장함
        // 저장된 사용자 정보 가져오기
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsLoggedIn(true)
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
      console.log('AuthContext signup 응답:', response)

      // 성공 여부 확인 방법 개선
      if (response.success || response.statusCode === 201) {
        return {
          success: true,
          message: response.message || '회원가입에 성공했습니다.',
          statusCode: response.statusCode || 201,
        }
      }
      return {
        success: false,
        message: response.message || '회원가입에 실패했습니다.',
      }
    } catch (error) {
      console.error('회원가입 처리 중 오류:', error)
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
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
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
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
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
