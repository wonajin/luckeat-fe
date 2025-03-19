import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'

function SignupPage() {
  const navigate = useNavigate()
  const [userType, setUserType] = useState('customer') // customer or owner
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')

  const handleSignup = (e) => {
    e.preventDefault()
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }
    alert('회원가입이 완료되었습니다.')
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate(-1)} className="text-2xl mr-4">
          ←
        </button>
        <h1 className="text-xl font-semibold text-orange-500">회원가입</h1>
      </div>

      <div className="flex-1 p-4">
        <form onSubmit={handleSignup} className="space-y-4">
          {/* 사용자 유형 선택 */}
          <div className="flex gap-4 justify-center">
            <label className="flex items-center">
              <input
                type="radio"
                name="userType"
                value="customer"
                checked={userType === 'customer'}
                onChange={(e) => setUserType(e.target.value)}
                className="mr-2"
              />
              일반 사용자
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="userType"
                value="owner"
                checked={userType === 'owner'}
                onChange={(e) => setUserType(e.target.value)}
                className="mr-2"
              />
              사업자
            </label>
          </div>

          {/* 이메일 입력 */}
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

          {/* 비밀번호 입력 */}
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
            <p className="mt-1 text-sm text-gray-500">
              * 비밀번호는 8자 이상, 20자 이하이며, 영어 소문자, 숫자를 각각
              최소 1개 포함해야 합니다.
            </p>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              type="password"
              placeholder="비밀번호를 다시 한번 입력해주세요"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>

          {/* 닉네임 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              닉네임
            </label>
            <input
              type="text"
              placeholder="닉네임을 입력해주세요"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              * 닉네임은 최대 10자까지 작성 가능합니다.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
          >
            회원가입
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-orange-500 hover:text-orange-600"
          >
            이미 계정이 있으신가요? 로그인하기
          </button>
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default SignupPage
