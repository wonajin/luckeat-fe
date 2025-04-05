import { createContext, useContext, useState, useEffect } from 'react'
import * as userApi from '../api/userApi'
import { SUCCESS_MESSAGES } from '../utils/apiMessages'
import { hasValidAccessToken, isTokenExpired } from '../utils/jwtUtils'

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
          // 토큰 유효성 검사 추가
          if (isTokenExpired(accessToken)) {
            // 토큰이 만료된 경우 - 사용자 친화적 메시지
            console.log('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.')
            setUser(null)
            setIsLoggedIn(false)
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            setLoading(false)
            return
          }

          // 저장된 사용자 정보가 있으면 바로 설정
          try {
            const userData = JSON.parse(storedUser)
            // 기본값 설정으로 데이터 보완
            const completeUserData = {
              userId: userData.userId || '',
              email: userData.email || '',
              nickname: userData.nickname || '사용자',
              role: userData.role || 'BUYER',
              ...userData, // 기존 데이터 유지
            }
            setUser(completeUserData)
            setIsLoggedIn(true)

            // 선택적으로 백엔드에서 최신 사용자 정보 요청
            try {
              const response = await userApi.getUserInfo()
              if (response.success) {
                console.log('사용자 정보 업데이트 성공:', response.data);
                setUser(response.data)
                localStorage.setItem('user', JSON.stringify(response.data))
              }
            } catch (error) {
              console.log('사용자 정보를 가져오지 못했습니다:', error)
              // API 요청 실패 시 토큰 유효성 다시 확인
              if (isTokenExpired(accessToken)) {
                // 토큰이 만료된 경우 - 사용자 친화적 메시지
                console.log('로그인 시간이 만료되었습니다. 보안을 위해 다시 로그인해 주세요.')
                setUser(null)
                setIsLoggedIn(false)
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
              }
            }
          } catch (parseError) {
            console.error('사용자 정보 파싱 오류:', parseError);
            // 잘못된 형식이지만 로그인은 유지
            setUser({
              userId: '',
              email: '',
              nickname: '사용자',
              role: 'BUYER'
            })
            setIsLoggedIn(true)
          }
        } else {
          // 토큰이나 사용자 정보가 없는 경우 로그아웃 상태로 설정
          console.log('로그인 정보가 없습니다.');
          setUser(null)
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error('로그인 상태 확인 중 문제가 발생했습니다:', error)
        // 오류 발생 시 로그아웃 상태로 설정
        setUser(null)
        setIsLoggedIn(false)
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
        const accessToken = localStorage.getItem('accessToken')
        
        // 토큰과 사용자 정보가 모두 있는지 확인
        if (storedUser && accessToken) {
          try {
            const userData = JSON.parse(storedUser)
            // 필수 정보가 없을 경우 기본값 보완
            const completeUserData = {
              userId: userData.userId || '',
              email: userData.email || credentials.email || '',
              nickname: userData.nickname || '사용자',
              role: userData.role || 'BUYER',
              ...userData // 기존 데이터 유지
            };
            
            setUser(completeUserData)
            setIsLoggedIn(true)
            
            // 최신 사용자 정보 가져오기 시도
            try {
              console.log('최신 사용자 정보 요청 중...');
              const userInfoResponse = await userApi.getUserInfo()
              if (userInfoResponse.success) {
                const updatedUserData = userInfoResponse.data
                console.log('최신 사용자 정보 수신:', updatedUserData);
                setUser(updatedUserData)
                localStorage.setItem('user', JSON.stringify(updatedUserData))
                return { success: true, user: updatedUserData }
              } else {
                console.log('사용자 정보 업데이트 불필요.');
                // 로컬에 저장된 정보로 계속 진행
                return { success: true, user: completeUserData }
              }
            } catch (err) {
              console.error('사용자 정보 업데이트에 실패했습니다:', err)
              // 오류가 발생해도 로그인은 성공한 것으로 처리
              return { success: true, user: completeUserData }
            }
          } catch (parseError) {
            console.error('사용자 정보 파싱 오류:', parseError);
            // 잘못된 사용자 정보 형식이더라도 기본 정보로 로그인 시도
            const basicUserData = {
              userId: '',
              email: credentials.email || '',
              nickname: '사용자',
              role: 'BUYER'
            };
            
            setUser(basicUserData)
            setIsLoggedIn(true)
            localStorage.setItem('user', JSON.stringify(basicUserData))
            
            return { success: true, user: basicUserData }
          }
        } else {
          // 토큰이나 사용자 정보가 없는 경우
          console.error('로그인 정보가 없습니다. 자동 복구 시도 중...')
          
          // API에서 성공으로 응답했지만 토큰이 저장되지 않은 경우
          if (response.data && response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken)
            
            if (response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refreshToken)
            }
            
            // 최소한의 사용자 정보 구성
            const minimalUserData = {
              userId: response.data.userId || '',
              email: credentials.email || '',
              nickname: response.data.nickname || '사용자',
              role: response.data.role || 'BUYER'
            };
            
            localStorage.setItem('user', JSON.stringify(minimalUserData))
            setUser(minimalUserData)
            setIsLoggedIn(true)
            
            return { success: true, user: minimalUserData }
          }
          
          return {
            success: false,
            message: '로그인 정보를 저장하지 못했습니다. 다시 로그인해주세요.',
          }
        }
      }
      
      return {
        success: false,
        message: response.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
      }
    } catch (error) {
      console.error('로그인 처리 중 오류:', error)
      
      // 더 친절한 오류 메시지 제공
      let errorMessage = '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      
      // HTML 응답 감지 및 처리 
      if (error.response && typeof error.response.data === 'string' && 
         (error.response.data.includes('<!DOCTYPE html>') || 
          error.response.data.includes('<html') || 
          error.response.data.includes('<body'))) {
        console.warn('HTML 응답이 감지되었습니다 - 인증 실패로 처리합니다');
        errorMessage = '아이디 또는 비밀번호가 맞지 않습니다. 다시 확인해주세요.';
        
        // 개발자 콘솔에 자세한 정보 기록
        console.error('HTML 응답을 받았습니다 (로그인 실패):', {
          url: error.response.config?.url || '알 수 없는 URL',
          status: error.response.status || '알 수 없는 상태 코드',
          headers: error.response.headers || {},
          data: error.response.data?.substring(0, 200) + '...' || '데이터 없음'
        });
      } else if (error.response) {
        if (error.response.status === 401) {
          errorMessage = '아이디 또는 비밀번호가 맞지 않습니다. 다시 확인해주세요.'
        } else if (error.response.status === 403) {
          errorMessage = '해당 계정은 현재 사용할 수 없습니다. 고객센터에 문의해주세요.'
        } else if (error.response.status >= 500) {
          errorMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }
      } else if (error.message && error.message.includes('Network')) {
        errorMessage = '인터넷 연결이 불안정합니다. 네트워크 연결 상태를 확인해주세요.'
      }
      
      return {
        success: false,
        message: errorMessage,
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
          message: response.message || '회원가입이 완료되었습니다! 로그인 후 이용해 주세요.',
          statusCode: response.statusCode || 201,
        }
      }
      
      // 실패 시 더 친절한 오류 메시지 제공
      let errorMessage = response.message || '회원가입에 실패했습니다.'
      if (response.message && response.message.includes('이미 존재')) {
        if (response.message.includes('이메일')) {
          errorMessage = '이미 가입된 이메일입니다. 다른 이메일로 시도하거나 로그인해 주세요.'
        } else if (response.message.includes('닉네임')) {
          errorMessage = '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.'
        }
      }
      
      return {
        success: false,
        message: errorMessage,
      }
    } catch (error) {
      console.error('회원가입 처리 중 오류:', error)
      
      let errorMessage = '회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = '입력하신 정보에 문제가 있습니다. 모든 항목을 올바르게 입력했는지 확인해주세요.'
        } else if (error.response.status >= 500) {
          errorMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }
      } else if (error.message && error.message.includes('Network')) {
        errorMessage = '인터넷 연결이 불안정합니다. 네트워크 연결 상태를 확인해주세요.'
      }
      
      return {
        success: false,
        message: errorMessage,
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

  // 현재 인증 상태를 확인하는 함수
  const checkCurrentAuthStatus = () => {
    try {
      // 액세스 토큰 유효성 검사
      const accessToken = localStorage.getItem('accessToken')
      const storedUser = localStorage.getItem('user')
      
      // 토큰이 없거나 사용자 정보가 없으면 무효한 것으로 간주
      if (!accessToken || !storedUser) {
        console.log('인증 상태 확인: 토큰 또는 사용자 정보 없음');
        return false;
      }
      
      // 토큰 만료 확인
      const isExpired = isTokenExpired(accessToken);
      if (isExpired) {
        console.log('인증 상태 확인: 토큰 만료됨');
        // 세션이 만료된 경우 로그아웃 처리
        if (isLoggedIn) {
          console.log('만료된 세션 정리 중...');
          setUser(null)
          setIsLoggedIn(false)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
        return false;
      }
      
      // 토큰 형식 확인
      const isValid = hasValidAccessToken();
      if (!isValid) {
        console.log('인증 상태 확인: 유효하지 않은 토큰 형식');
        // 유효하지 않은 경우 로그아웃 처리
        if (isLoggedIn) {
          setUser(null)
          setIsLoggedIn(false)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
        return false;
      }
      
      // 사용자 정보 확인
      try {
        JSON.parse(storedUser);
        // 여기까지 왔다면 모든 검증 통과
        return true;
      } catch (e) {
        console.error('인증 상태 확인: 사용자 정보 형식 오류', e);
        return false;
      }
    } catch (error) {
      console.error('인증 상태 확인 중 오류 발생:', error);
      return false;
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
        checkCurrentAuthStatus,
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
