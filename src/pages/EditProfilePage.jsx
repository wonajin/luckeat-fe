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
  const [nickname, setNickname] = useState('')
  const [originalNickname, setOriginalNickname] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // 토스트 메시지 상태
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 유효성 검사 메시지
  const [nicknameError, setNicknameError] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  // 상태 플래그
  const [isNicknameSame, setIsNicknameSame] = useState(true)
  const [passwordsNotMatch, setPasswordsNotMatch] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
      setNicknameError('')
    } else {
      setIsNicknameSame(false)

      if (value.length < 2) {
        setNicknameError('닉네임은 최소 2자 이상이어야 합니다.')
      } else if (value.length > 10) {
        setNicknameError('닉네임은 최대 10자까지 작성가능합니다.')
      } else {
        setNicknameError('')
      }
    }
  }

  // 한글 입력을 막는 함수 (현재 비밀번호)
  const handleCurrentPasswordChange = (e) => {
    // 정규식을 사용하여 한글 입력 감지
    const isHangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(e.target.value)
    
    if (isHangul) {
      // 한글이 입력되면 이전 상태를 유지 (한글 입력 차단)
      return
    }
    
    // 한글이 아닌 경우 상태 업데이트
    setCurrentPassword(e.target.value)
    
    if (!e.target.value) {
      setCurrentPasswordError('현재 비밀번호를 입력해주세요.')
    } else {
      setCurrentPasswordError('')
    }
  }

  // 한글 입력을 막는 함수 (새 비밀번호)
  const handlePasswordChange = (e) => {
    // 정규식을 사용하여 한글 입력 감지
    const isHangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(e.target.value)
    
    if (isHangul) {
      // 한글이 입력되면 이전 상태를 유지 (한글 입력 차단)
      return
    }
    
    // 한글이 아닌 경우 상태 업데이트
    const value = e.target.value
    setNewPassword(value)

    if (!value) {
      setPasswordError('새로운 비밀번호를 입력해주세요.')
    } else if (value.length < 8 || value.length > 20) {
      setPasswordError('비밀번호는 8자 이상, 20자 이하여야 합니다.')
    } else {
      setPasswordError('')
    }

    // 비밀번호 확인 일치 여부 검사
    if (confirmPassword && value !== confirmPassword) {
      setPasswordsNotMatch(true)
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.')
    } else if (confirmPassword) {
      setPasswordsNotMatch(false)
      setConfirmPasswordError('')
    }
  }

  // 한글 입력을 막는 함수 (비밀번호 확인)
  const handleConfirmPasswordChange = (e) => {
    // 정규식을 사용하여 한글 입력 감지
    const isHangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(e.target.value)
    
    if (isHangul) {
      // 한글이 입력되면 이전 상태를 유지 (한글 입력 차단)
      return
    }
    
    // 한글이 아닌 경우 상태 업데이트
    const value = e.target.value
    setConfirmPassword(value)

    if (value !== newPassword) {
      setPasswordsNotMatch(true)
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.')
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
      showToastMessage('변경된 내용이 없습니다.')
      return
    }

    if (nickname.length < 2) {
      setNicknameError('닉네임은 최소 2자 이상이어야 합니다.')
      return
    }

    if (nickname.length > 10) {
      setNicknameError('닉네임은 최대 10자까지 작성가능합니다.')
      return
    }

    setIsLoading(true)

    try {
      const result = await updateNickname(nickname)
      if (result.success) {
        setOriginalNickname(nickname)
        setIsNicknameSame(true)
        showToastMessage('닉네임이 수정되었습니다.')
        // 수정 완료 시 홈화면으로 이동
        setTimeout(() => {
          navigate('/')
        }, 1500)
      } else {
        if (result.message && result.message.includes('중복')) {
          setNicknameError('중복된 닉네임입니다.')
        } else {
          setNicknameError(result.message || '닉네임 수정에 실패했습니다.')
        }
      }
    } catch (error) {
      setNicknameError('닉네임 수정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 비밀번호 수정 처리
  const handlePasswordSubmit = async () => {
    // 비밀번호 유효성 검사
    if (!currentPassword) {
      setCurrentPasswordError('현재 비밀번호를 입력해주세요.')
      return
    }

    if (!newPassword) {
      setPasswordError('새로운 비밀번호를 입력해주세요.')
      return
    }

    if (newPassword.length < 8 || newPassword.length > 20) {
      setPasswordError('비밀번호는 8자 이상, 20자 이하여야 합니다.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordsNotMatch(true)
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)

    try {
      const result = await updatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (result.success) {
        showToastMessage('비밀번호가 수정되었습니다.')
        // 비밀번호 필드 초기화
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setPasswordError('')
        setPasswordsNotMatch(false)
        // 수정 완료 시 홈화면으로 이동
        setTimeout(() => {
          navigate('/')
        }, 1500)
      } else {
        if (
          result.message &&
          (result.message.includes('현재 비밀번호') ||
            result.message.includes('일치하지 않'))
        ) {
          setCurrentPasswordError('현재 비밀번호가 일치하지 않습니다.')
        } else {
          setPasswordError(result.message || '비밀번호 수정에 실패했습니다.')
        }
      }
    } catch (error) {
      setPasswordError('비밀번호 수정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    setIsLoading(true)

    try {
      const result = await deleteAccount()
      if (result.success) {
        showToastMessage('회원 탈퇴가 완료되었습니다.')
        setTimeout(() => {
          navigate('/')
        }, 1500)
      } else {
        alert(result.message || '회원 탈퇴에 실패했습니다.')
        setShowDeleteModal(false)
      }
    } catch (error) {
      alert('회원 탈퇴 중 오류가 발생했습니다.')
      setShowDeleteModal(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <Header title="회원정보 수정" onBack={() => navigate('/mypage')} />

      <div className="flex-1 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-center mb-6">회원정보 수정</h1>

        {/* 이메일 표시 (수정 불가) */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">이메일</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full p-3 bg-gray-300 rounded-lg border border-gray-300 text-gray-500 font-medium"
          />
          <p className="text-gray-500 text-xs mt-1">
            * 이메일은 수정할 수 없습니다.
          </p>
        </div>

        {/* 닉네임 수정 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-300"
          />
          {isNicknameSame && (
            <p className="text-gray-500 text-sm mt-1">
              * 변경할 닉네임을 입력해주세요.
            </p>
          )}
          {nicknameError && (
            <p className="text-red-500 text-sm mt-1">* {nicknameError}</p>
          )}

          <div className="mt-3">
            <button
              onClick={handleNicknameSubmit}
              disabled={isLoading || isNicknameSame || !!nicknameError}
              className={`px-4 py-3 rounded-lg w-full ${
                isLoading || isNicknameSame || !!nicknameError
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#F7B32B] hover:bg-[#E09D18] active:bg-[#D08D08]'
              } text-white font-medium transition-colors`}
            >
              {isLoading ? '처리 중...' : '닉네임 수정'}
            </button>
          </div>
        </div>

        {/* 비밀번호 수정 */}
        <div className="mb-8 border-t pt-4">
          <h2 className="text-lg font-bold mb-3">비밀번호 수정</h2>
          <label className="block text-sm font-medium mb-1">
            현재 비밀번호
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            placeholder="현재 비밀번호를 입력해주세요."
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-300 mb-2"
          />
          {currentPasswordError && (
            <p className="text-red-500 text-sm mb-2">
              * {currentPasswordError}
            </p>
          )}

          <label className="block text-sm font-medium mb-1">새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={handlePasswordChange}
            placeholder="새로운 비밀번호를 입력해주세요."
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-300 mb-2"
          />
          {passwordError && (
            <p className="text-red-500 text-sm mb-2">* {passwordError}</p>
          )}

          <label className="block text-sm font-medium mb-1">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="비밀번호를 다시 한번 입력해주세요."
            className="w-full p-3 bg-gray-100 rounded-lg border border-gray-300"
          />
          {passwordsNotMatch && (
            <p className="text-red-500 text-sm mt-1">
              * {confirmPasswordError}
            </p>
          )}

          <div className="mt-3">
            <button
              onClick={handlePasswordSubmit}
              disabled={
                isLoading ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                passwordsNotMatch ||
                !!passwordError
              }
              className={`px-4 py-3 rounded-lg w-full ${
                isLoading ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                passwordsNotMatch ||
                !!passwordError
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#F7B32B] hover:bg-[#E09D18] active:bg-[#D08D08]'
              } text-white font-medium transition-colors`}
            >
              {isLoading ? '처리 중...' : '비밀번호 수정'}
            </button>
          </div>
        </div>

        {/* 탈퇴하기 버튼 */}
        <div className="mt-8 border-t pt-4 flex justify-center">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-red-500 hover:text-red-700 active:text-red-800 font-medium hover:underline"
            disabled={isLoading}
          >
            탈퇴하기
          </button>
        </div>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <h3 className="font-bold text-lg text-center mb-4">
              회원을 탈퇴하시겠습니까?
            </h3>
            <p className="text-center text-gray-600 mb-4">
              탈퇴 시 계정과 관련된 모든 정보가 삭제되며, 이 작업은 되돌릴 수
              없습니다.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
                className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg active:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className={`flex-1 py-2 ${
                  isLoading
                    ? 'bg-gray-400'
                    : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                } text-white font-bold rounded-lg transition-colors`}
              >
                {isLoading ? '처리 중...' : '탈퇴하기'}
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
