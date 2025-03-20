import { useState } from 'react'
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

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

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
        role, // 대문자로 변환된 role 필드 사용
      }

      console.log('회원가입 요청 데이터:', userData)

      // 회원가입 요청
      const result = await signup(userData)

      if (result.success) {
        // 회원가입 성공 시 로그인 페이지로 이동
        alert('회원가입이 완료되었습니다. 로그인해주세요.')
        navigate('/login')
      } else {
        setError(
          result.message || '회원가입에 실패했습니다. 다시 시도해주세요.',
        )
      }
    } catch (err) {
      console.error('회원가입 오류:', err)
      setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

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
          {/* 이메일 */}
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

      <Navigation />
    </div>
  )
}

export default SignupPage
