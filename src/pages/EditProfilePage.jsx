/* 신규 파일 생성: 회원정보 수정 페이지 */
import React, { useState } from 'react'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'

function EditProfilePage() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // updateUser 함수 로직 구현 (예: API 호출 등)
    console.log('Updating user info', { name, email, password })
    alert('회원정보가 업데이트되었습니다.')
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="회원정보 수정" />
      <div className="flex-1 p-4">
        <h2 className="text-xl font-bold mb-4">회원정보 수정</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-yellow-500 text-white rounded"
          >
            정보 수정
          </button>
        </form>
      </div>
      <Navigation />
    </div>
  )
}

export default EditProfilePage
