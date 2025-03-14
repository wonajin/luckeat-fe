import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()

    // 간단한 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }

    // 실제 로그인 처리 (지금은 가상 데이터로 처리)
    login({
      email,
      nickname: email.split('@')[0], // 이메일의 @ 앞부분을 닉네임으로 사용
    })

    // 홈페이지로 이동
    navigate('/home')
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate(-1)} className="text-2xl mr-4">
          ←
        </button>
        <h1 className="text-xl font-semibold text-yellow-500">Luckeat</h1>
      </div>

      <div className="flex-1 p-4">
        <h2 className="text-2xl font-bold text-center my-8">로그인</h2>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="border rounded-lg p-4">
            <div className="mb-6">
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
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 text-white font-bold rounded-lg"
          >
            로그인
          </button>
        </form>

        <div className="flex justify-between mt-4">
          <button
            className="text-sm text-gray-500"
            onClick={() => navigate('/find-password')}
          >
            비밀번호 찾기
          </button>
          <button
            className="text-sm text-gray-500"
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">아직 가입 전이신가요?</p>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
            onClick={() => navigate('/signup')}
          >
            가입하기
          </button>
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default LoginPage 