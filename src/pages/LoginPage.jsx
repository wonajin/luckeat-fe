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

  // 한글 입력을 막는 함수
  const handlePasswordInput = (e) => {
    // 정규식을 사용하여 한글 입력 감지
    const isHangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(e.target.value)
    if (isHangul) {
      // 한글이 입력되면 이전 상태를 유지 (한글 입력 차단)
      return
    }
    // 한글이 아닌 경우 상태 업데이트
    setPassword(e.target.value)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    // 폼 검증
    if (!email) {
      setError('이메일을 입력해주세요.')
      return
    }

    if (!password) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('유효한 이메일 형식이 아닙니다.')
      return
    }

    try {
      setLoading(true)
      const response = await login({ email, password })

      if (response.success) {
        navigate(location.state?.from || '/')
      } else {
        // 오류 메시지 개선
        if (
          response.message.includes('인증') ||
          response.message.includes('일치하지 않')
        ) {
          setError('아이디 또는 비밀번호가 맞지 않습니다. 다시 확인해주세요.')
        } else if (response.message.includes('만료')) {
          setError('로그인 시간이 만료되었습니다. 다시 로그인해주세요.')
        } else {
          setError(
            response.message || '로그인에 실패했습니다. 다시 시도해주세요.',
          )
        }
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setError('로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <Header title="로그인" showBackButton={true} />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          {/* 세션 메시지 표시 - 개선된 스타일 */}
          {sessionMessage && (
            <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md border border-yellow-200">
              <p className="font-medium">{sessionMessage}</p>
            </div>
          )}

          {/* 오류 메시지 표시 - 개선된 스타일 */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md border border-red-200">
              <p className="font-medium">{error}</p>
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
                <label className="block text-sm font-medium mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordInput}
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
      </main>
    </div>
  )
}

export default LoginPage
