import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'

function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [userType, setUserType] = useState('일반')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  // 디버깅용 - 팝업 표시 상태 변경 감지
  useEffect(() => {
    console.log('팝업 표시 상태 변경:', showSuccessPopup)
  }, [showSuccessPopup])

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    console.log('회원가입 시작...')

    // 간단한 유효성 검사
    if (!email || !nickname || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    // 비밀번호 길이와 복잡성 검사
    if (password.length < 8 || password.length > 20) {
      setError('비밀번호는 8자 이상, 20자 이하여야 합니다.')
      setLoading(false)
      return
    }

    // 회원 유형에 따라 role 값 설정 (대문자로 변환)
    const role = userType === '사업자' ? 'SELLER' : 'BUYER'

    try {
      // 회원가입 데이터 준비
      const userData = {
        email,
        nickname,
        password,
        role,
      }

      console.log('회원가입 요청 데이터:', userData)

      // 회원가입 요청
      const result = await signup(userData)
      console.log('회원가입 응답 결과:', result)

      // 응답 상태 코드 확인 (API 명세에 따르면 201이 성공)
      if (result && result.statusCode === 201) {
        console.log('회원가입 성공 (상태 코드 201), 성공 팝업 표시')
        setShowSuccessPopup(true) // 성공 시 팝업 표시
      }
      // result.success 값으로도 확인 (양쪽에서 이중 체크)
      else if (result && result.success) {
        console.log('회원가입 성공 (success=true), 성공 팝업 표시')
        setShowSuccessPopup(true) // 성공 시 팝업 표시
      }
      // "회원가입 성공" 메시지 확인 (세 번째 체크)
      else if (result && result.message === '회원가입 성공') {
        console.log('회원가입 성공 (메시지 확인), 성공 팝업 표시')
        setShowSuccessPopup(true) // 성공 시 팝업 표시
      } else {
        // 실패 처리
        console.log('회원가입 실패:', result)
        setError(
          (result && result.message) ||
            '회원가입에 실패했습니다. 다시 시도해주세요.',
        )
      }
    } catch (err) {
      console.error('회원가입 처리 중 오류 발생:', err)
      setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 로그인 페이지로 이동
  const goToLogin = () => {
    console.log('로그인 페이지로 이동')
    navigate('/login')
  }

  // 홈 화면으로 이동
  const goToHome = () => {
    console.log('홈 화면으로 이동')
    navigate('/')
  }

  // 회원가입 성공 팝업 렌더링
  const renderSuccessPopup = () => {
    console.log('팝업 렌더링 함수 호출됨, 상태:', showSuccessPopup)

    if (!showSuccessPopup) return null

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">회원가입 완료!</h3>
            <p className="text-gray-600 mb-6">
              회원가입이 성공적으로 완료되었습니다.
              <br />
              로그인 후 서비스를 이용해보세요.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={goToLogin}
                className="w-full py-3 bg-yellow-500 text-white font-bold rounded-lg"
              >
                로그인하러 가기
              </button>
              <button
                onClick={goToHome}
                className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-lg"
              >
                홈 화면으로 가기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('SignupPage 렌더링, 팝업 상태:', showSuccessPopup)

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <Header title="회원가입" />

      <div className="flex-1 p-4 overflow-y-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}

        {/* 회원가입 폼 */}
        <form onSubmit={handleSignup} className="space-y-6 mt-4">
          {/* 회원 유형 선택 */}
          <div className="border border-red-500 rounded-lg p-3">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="일반"
                  checked={userType === '일반'}
                  onChange={() => setUserType('일반')}
                  className="mr-2"
                />
                <span className="flex items-center">
                  <span className="w-4 h-4 bg-yellow-500 rounded-full mr-1"></span>
                  일반 사용자
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="사업자"
                  checked={userType === '사업자'}
                  onChange={() => setUserType('사업자')}
                  className="mr-2"
                />
                <span>사업자</span>
              </label>
            </div>
          </div>

          {/* 나머지 폼 필드들 */}
          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                이메일 주소
              </label>
              <input
                type="email"
                placeholder="이메일 주소를 입력해주세요."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-100 rounded-lg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                (예: example@example.com)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">닉네임</label>
              <input
                type="text"
                placeholder="닉네임을 입력해주세요."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full p-3 bg-gray-100 rounded-lg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                2~10자 이내로 입력해주세요.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-100 rounded-lg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                비밀번호는 8자 이상, 20자 이하이며, 영어 소문자, 숫자를 각각
                최소 1개 포함해야 합니다.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                비밀번호 확인
              </label>
              <input
                type="password"
                placeholder="비밀번호를 다시 입력해주세요."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-gray-100 rounded-lg"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 text-white font-bold rounded-lg"
            disabled={loading}
          >
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">이미 회원이신가요?</p>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
            onClick={() => navigate('/login')}
          >
            로그인하기
          </button>
        </div>
      </div>

      {/* 회원가입 성공 팝업 - renderSuccessPopup 함수 사용 */}
      {renderSuccessPopup()}

      <Navigation />
    </div>
  )
}

export default SignupPage
