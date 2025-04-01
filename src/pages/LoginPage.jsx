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
      setError('유효한 이메일 형식이 아닙니다. 올바른 이메일 주소를 입력해주세요.')
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
          response.message.includes('일치하지 않') ||
          response.message.includes('아이디') ||
          response.message.includes('비밀번호')
        ) {
          setError('이메일 또는 비밀번호가 맞지 않습니다. 다시 확인해주세요.')
        } else if (response.message.includes('만료')) {
          setError('로그인 정보가 만료되었습니다.\n다시 로그인해주세요.')
        } else if (response.message.includes('정보를 저장')) {
          setError('로그인 정보를 저장하는 중 문제가 발생했습니다.\n다시 시도해주세요.')
        } else if (response.message.includes('불완전')) {
          setError('로그인 정보가 불완전합니다.\n다시 로그인해주세요.')
        } else {
          setError(
            response.message || '로그인에 실패했습니다.\n다시 시도해주세요.'
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 mb-4">
            <p className="font-medium">로그인 오류</p>
            {error.split('\n').map((line, index) => (
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
                onChange={handlePasswordInput}
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
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인하기'}
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
