import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    alert('로그인이 완료되었습니다.')
    navigate('/mypage')
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate(-1)} className="text-2xl mr-4">
          ←
        </button>
        <h1 className="text-xl font-semibold text-orange-500">로그인</h1>
      </div>

      <div className="flex-1 p-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이메일 주소
            </label>
            <input
              type="email"
              placeholder="이메일을 입력해주세요"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
          >
            로그인
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/signup')}
            className="text-orange-500 hover:text-orange-600"
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
