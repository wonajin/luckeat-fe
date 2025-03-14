import { createContext, useContext, useState, useEffect } from 'react'

// 인증 컨텍스트 생성
const AuthContext = createContext()

// 인증 컨텍스트 제공자 컴포넌트
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setIsLoggedIn(true)
    }
    setLoading(false)
  }, [])

  // 로그인 함수
  const login = (email, password) => {
    // 실제 구현에서는 API 호출로 인증 처리
    // 여기서는 임시 데이터 사용
    const userData = {
      email,
      nickname: email.split('@')[0], // 이메일의 @ 앞부분을 닉네임으로 사용
    }
    
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem('user', JSON.stringify(userData))
    return { success: true }
  }

  // 회원가입 함수
  const signup = (userData) => {
    // 실제 구현에서는 API 호출로 회원가입 처리
    // 여기서는 성공 응답만 반환
    return { success: true }
  }

  // 로그아웃 함수
  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('user')
  }

  // 컨텍스트 값
  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 인증 컨텍스트 사용을 위한 훅
export function useAuth() {
  return useContext(AuthContext)
} 