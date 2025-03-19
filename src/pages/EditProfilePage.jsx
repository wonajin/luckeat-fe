/* 신규 파일 생성: 회원정보 수정 페이지 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import { useAuth } from '../context/AuthContext'
import Navigation from '../components/layout/Navigation'

function EditProfilePage() {
  const navigate = useNavigate()
  const { user, updateNickname, updatePassword, deleteAccount } = useAuth()

  // 상태 관리
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [originalNickname, setOriginalNickname] = useState(user?.nickname || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // 토스트 메시지 상태
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 유효성 검사 메시지
  const [nicknameError, setNicknameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [passwordMatch, setPasswordMatch] = useState(false)

  // 에러 메시지 상태
  const [isNicknameSame, setIsNicknameSame] = useState(true)
  const [passwordLengthError, setPasswordLengthError] = useState(false)
  const [passwordsNotMatch, setPasswordsNotMatch] = useState(false)

  // 컴포넌트 마운트 시 닉네임 설정
  useEffect(() => {
    if (user?.nickname) {
      setNickname(user.nickname)
      setOriginalNickname(user.nickname)
      setIsNicknameSame(true)
    }
  }, [user])

  // 닉네임 변경 핸들러
  const handleNicknameChange = (e) => {
    const value = e.target.value
    setNickname(value)

    // 닉네임 유효성 검사
    if (value === originalNickname) {
      setIsNicknameSame(true)
    } else {
      setIsNicknameSame(false)

      if (value.length > 10) {
        setNicknameError('닉네임은 최대 10자까지 작성가능합니다.')
      } else {
        setNicknameError('')
      }
    }
  }

  // 비밀번호 변경 핸들러
  const handlePasswordChange = (e) => {
    const value = e.target.value
    setNewPassword(value)

    if (!value) {
      setPasswordError('새로운 비밀번호를 입력해주세요.')
      setPasswordLengthError(false)
      setPasswordMatch(false)
    } else {
      const hasLowerCase = /[a-z]/.test(value)
      const hasNumber = /\d/.test(value)

      if (
        value.length < 8 ||
        value.length > 20 ||
        !hasLowerCase ||
        !hasNumber
      ) {
        setPasswordLengthError(true)
        setPasswordMatch(false)
      } else if (value === 'oldPassword') {
        // 실제로는 이전 비밀번호와 비교해야 함
        setPasswordError('이전 비밀번호와 일치합니다.')
        setPasswordLengthError(false)
        setPasswordMatch(true)
      } else {
        setPasswordError('')
        setPasswordLengthError(false)
        setPasswordMatch(false)
      }
    }

    // 비밀번호 확인 일치 여부 검사
    if (confirmPassword && value !== confirmPassword) {
      setPasswordsNotMatch(true)
    } else if (confirmPassword) {
      setPasswordsNotMatch(false)
    }
  }

  // 비밀번호 포커스 아웃 핸들러
  const handlePasswordBlur = () => {
    if (!newPassword) {
      setPasswordError('새로운 비밀번호를 입력해주세요.')
    }
  }

  // 비밀번호 확인 변경 핸들러
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)

    if (value !== newPassword) {
      setPasswordsNotMatch(true)
      setConfirmPasswordError('비밀번호가 다릅니다.')
    } else {
      setPasswordsNotMatch(false)
      setConfirmPasswordError('')
    }
  }

  // 토스트 메시지 표시
  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  // 닉네임 수정 처리
  const handleNicknameSubmit = async () => {
    // 닉네임 유효성 검사
    if (!nickname) {
      setNicknameError('닉네임을 입력해주세요.')
      return
    }

    if (nickname === originalNickname) {
      setIsNicknameSame(true)
      return
    }

    if (nickname.length > 10) {
      setNicknameError('닉네임은 최대 10자까지 작성가능합니다.')
      return
    }

    try {
      const result = await updateNickname(nickname)
      if (result.success) {
        setOriginalNickname(nickname)
        setIsNicknameSame(true)
        showToastMessage('닉네임이 수정되었습니다.')
      } else {
        if (result.message.includes('중복')) {
          setNicknameError('중복된 닉네임입니다.')
        } else {
          setNicknameError(result.message || '닉네임 수정에 실패했습니다.')
        }
      }
    } catch (error) {
      setNicknameError('닉네임 수정 중 오류가 발생했습니다.')
    }
  }

  // 비밀번호 수정 처리
  const handlePasswordSubmit = async () => {
    // 비밀번호 유효성 검사
    if (!newPassword) {
      setPasswordError('새로운 비밀번호를 입력해주세요.')
      return
    }

    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumber = /\d/.test(newPassword)

    if (
      newPassword.length < 8 ||
      newPassword.length > 20 ||
      !hasLowerCase ||
      !hasNumber
    ) {
      setPasswordLengthError(true)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordsNotMatch(true)
      return
    }

    try {
      const result = await updatePassword({
        newPassword,
        confirmPassword,
      })

      if (result.success) {
        showToastMessage('비밀번호가 수정되었습니다.')
        // 비밀번호 필드 초기화
        setNewPassword('')
        setConfirmPassword('')
        setPasswordError('')
        setPasswordLengthError(false)
        setPasswordsNotMatch(false)
      } else {
        setPasswordError(result.message || '비밀번호 수정에 실패했습니다.')
      }
    } catch (error) {
      setPasswordError('비밀번호 수정 중 오류가 발생했습니다.')
    }
  }

  // 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    try {
      const result = await deleteAccount()
      if (result.success) {
        navigate('/')
      } else {
        alert(result.message || '회원 탈퇴에 실패했습니다.')
      }
    } catch (error) {
      alert('회원 탈퇴 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="회원정보 수정" onBack={() => navigate('/mypage')} />

      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-6">회원정보 수정</h1>

        {/* 이메일 표시 (수정 불가) */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">이메일</label>
          <input
            type="email"
            value={user?.email || 'example@gmail.com'}
            disabled
            className="w-full p-3 bg-gray-200 rounded border border-gray-300 text-gray-500"
          />
        </div>

        {/* 닉네임 수정 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            className="w-full p-3 bg-gray-200 rounded border border-gray-300"
          />
          {isNicknameSame && (
            <p className="text-red-500 text-sm mt-1">
              * 이전 닉네임과 동일합니다.
            </p>
          )}
          {nicknameError && (
            <p className="text-red-500 text-sm mt-1">* {nicknameError}</p>
          )}

          <div className="mt-2">
            <button
              onClick={handleNicknameSubmit}
              className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600"
            >
              닉네임 수정
            </button>
          </div>
        </div>

        {/* 비밀번호 수정 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            placeholder="새로운 비밀번호를 입력해주세요."
            className="w-full p-3 bg-gray-200 rounded border border-gray-300 mb-2"
          />
          {passwordMatch ? (
            <p className="text-green-500 text-sm mb-2">* {passwordError}</p>
          ) : passwordError ? (
            <p className="text-red-500 text-sm mb-2">* {passwordError}</p>
          ) : null}

          {passwordLengthError && (
            <p className="text-red-500 text-sm mb-2">
              * 비밀번호는 8자 이상, 20자 이하이며, 영어 소문자, 숫자를 각각
              최소 1개 포함해야 합니다.
            </p>
          )}

          <label className="block text-sm font-medium mb-1">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="비밀번호를 다시 한번 입력해주세요."
            className="w-full p-3 bg-gray-200 rounded border border-gray-300"
          />
          {passwordsNotMatch && (
            <p className="text-red-500 text-sm mt-1">* 비밀번호가 다릅니다.</p>
          )}

          <div className="mt-2">
            <button
              onClick={handlePasswordSubmit}
              className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600"
            >
              비밀번호 수정
            </button>
          </div>
        </div>

        {/* 탈퇴하기 버튼 */}
        <div className="text-right mt-8 border-t pt-4">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-red-500 hover:underline"
          >
            탈퇴하기
          </button>
        </div>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-md">
            <p className="text-xl font-bold text-center mb-6">
              회원을 탈퇴하시겠습니까?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-2 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600"
              >
                확인
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  )
}

export default EditProfilePage
