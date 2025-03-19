import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'

function ProfileEditPage() {
  const navigate = useNavigate()
  const [email] = useState('example@example.com')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('사용자 닉네임')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newPassword && newPassword !== newPasswordConfirm) {
      alert('새 비밀번호가 일치하지 않습니다.')
      return
    }
    alert('회원정보가 수정되었습니다.')
    navigate('/mypage')
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate(-1)} className="text-2xl mr-4">
          ←
        </button>
        <h1 className="text-xl font-semibold text-orange-500">회원정보 수정</h1>
      </div>

      <div className="flex-1 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              type="email"
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
              value={email}
              disabled
            />
          </div>

          {/* 현재 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              현재 비밀번호
            </label>
            <input
              type="password"
              placeholder="현재 비밀번호를 입력해주세요"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              새 비밀번호
            </label>
            <input
              type="password"
              placeholder="새 비밀번호를 입력해주세요"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">
              * 비밀번호는 8자 이상, 20자 이하이며, 영어 소문자, 숫자를 각각
              최소 1개 포함해야 합니다.
            </p>
          </div>

          {/* 새 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              placeholder="새 비밀번호를 다시 한번 입력해주세요"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
            />
          </div>

          {/* 닉네임 */}
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

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
            >
              회원정보 수정
            </button>
          </div>
        </form>
      </div>

      <Navigation />
    </div>
  )
}

export default ProfileEditPage
