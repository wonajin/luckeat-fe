import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import kakaoLoginImage from '../assets/images/kakao_login_medium_wide.png'
import { API_DIRECT_URL } from '../config/apiConfig'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sessionMessage, setSessionMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // 리다이렉션된 경우 메시지 표시
  useEffect(() => {
    if (location.state?.message) {
      setSessionMessage(location.state.message)
    }
  }, [location.state])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSessionMessage('')

    // 간단한 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      const result = await login({ email, password })

      if (result.success) {
        // 로그인 성공 시 사용자 역할에 따라 리다이렉션
        if (result.user && result.user.role === 'SELLER') {
          navigate('/business')
        } else {
          navigate('/')
        }
      } else {
        setError(result.message || '로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
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
            <p>{sessionMessage}</p>
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 mb-4">
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-6 mt-4">
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
                className="w-full p-3 bg-gray-100 rounded-lg"
                placeholder="이메일 주소를 입력해주세요"
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-100 rounded-lg"
                placeholder="비밀번호를 입력해주세요"
                required
              />
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-5/6 py-2 bg-yellow-500 text-white font-bold rounded-lg mx-auto block"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          {/* 카카오 로그인 버튼 */}
          <div className="mt-4">
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
          <p className="text-sm text-gray-600 mb-2">계정이 없으신가요?</p>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
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
