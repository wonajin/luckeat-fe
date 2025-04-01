import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import kakaoLoginImage from '../assets/images/kakao_login_medium_wide.png'
import { API_DIRECT_URL } from '../config/apiConfig'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sessionMessage, setSessionMessage] = useState('')

  useEffect(() => {
    // 세션 만료 또는 로그인 필요 메시지가 있는 경우 표시
    const message = location.state?.message
    if (message) {
      setSessionMessage(message)
      // state를 초기화하여 새로고침 시 메시지가 다시 나타나지 않도록 함
      window.history.replaceState({}, document.title)
    }

    // 이미 로그인되어 있으면 홈으로 리다이렉트
    if (isLoggedIn) {
      navigate('/')
    }
  }, [isLoggedIn, navigate, location.state])

  const validateEmail = (email) => {
    return email.includes('@')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    
    // 유효성 검사
    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }

    if (!validateEmail(email)) {
      setErrorMessage('유효한 이메일 형식을 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      const result = await login(email, password)
      
      if (result.success) {
        // 로그인 성공 - 홈페이지로 리다이렉트
        navigate('/')
      } else {
        // 로그인 실패 메시지
        setErrorMessage(result.message || '아이디 또는 비밀번호가 일치하지 않습니다.')
      }
    } catch (error) {
      setErrorMessage('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <Header title="로그인" />

      <div className="flex-1 p-4 overflow-y-auto">
        {/* 세션 만료 메시지 */}
        {sessionMessage && (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded"
            role="alert"
          >
            <p className="font-medium">{sessionMessage}</p>
            <p className="text-sm mt-1">로그인 후 이용해주세요.</p>
          </div>
        )}

        {/* 오류 메시지 */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 mb-4">
            <p className="font-medium">로그인 오류</p>
            {errorMessage.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        )}

        {/* 로그인 안내 */}
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            럭키트 서비스를 이용하시려면 로그인해주세요.
          </p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* 로그인 필드들 */}
          <div className="border rounded-lg p-4 space-y-4">
            {/* 이메일 입력 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                이메일 주소
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                placeholder="이메일 주소를 입력해주세요"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                가입 시 사용한 이메일을 입력하세요.
              </p>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                placeholder="비밀번호를 입력해주세요"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                비밀번호는 8자 이상이며, 영문과 숫자를 포함해야 합니다.
              </p>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-5/6 py-3 bg-yellow-500 text-white font-bold rounded-lg mx-auto block hover:bg-yellow-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인하기'}
          </button>

          {/* 카카오 로그인 버튼 */}
          <div className="mt-4">
            <p className="text-center text-gray-500 text-sm mb-2">또는</p>
            <button
              type="button"
              onClick={() => {
                window.location.href = `${API_DIRECT_URL}/oauth2/authorization/kakao`
              }}
              className="w-full"
            >
              <div className="flex justify-center items-center">
                <img
                  src={kakaoLoginImage}
                  alt="카카오 로그인"
                  className="w-5/6 h-auto rounded-lg"
                />
              </div>
            </button>
          </div>
        </form>

        {/* 회원가입 링크 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">아직 럭키트 회원이 아니신가요?</p>
          <button
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={() => navigate('/signup')}
          >
            회원가입하기
          </button>
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default LoginPage
