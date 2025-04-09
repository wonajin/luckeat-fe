/* 신규 파일 생성: 회원정보 수정 페이지 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import { useAuth } from '../context/AuthContext'
import * as userApi from '../api/userApi'

function EditProfilePage() {
  const navigate = useNavigate()
  const { user, updateNickname, updatePassword, deleteAccount, logout } = useAuth()

  // 상태 관리
  const [nickname, setNickname] = useState('')
  const [originalNickname, setOriginalNickname] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [deletionSuccessful, setDeletionSuccessful] = useState(false)

  // 토스트 메시지 상태
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 유효성 검사 메시지
  const [nicknameError, setNicknameError] = useState('')
  const [nicknameSuccess, setNicknameSuccess] = useState('')
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

  // 성공 모달 상태 확인
  useEffect(() => {
    console.log('성공 모달 상태 변경:', showSuccessModal)
  }, [showSuccessModal])

  // 닉네임 변경 핸들러
  const handleNicknameChange = (e) => {
    // 앞뒤 공백 제거
    const value = e.target.value.trim()
    setNickname(value)
    
    // 닉네임 유효성 검사
    if (value.length < 2 || value.length > 10) {
      setNicknameError('닉네임은 2자 이상 10자 이하여야 합니다.')
    } else if (value === originalNickname) {
      setNicknameError('')
      setIsNicknameSame(true)
    } else {
      setNicknameError('')
      setIsNicknameSame(false)
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
    
    // 한글이 아닌 경우 상태 업데이트 (공백 제거)
    const value = e.target.value.replace(/\s+/g, '')
    setCurrentPassword(value)
    
    if (!value) {
      setCurrentPasswordError('현재 비밀번호를 입력해주세요.')
    } else {
      setCurrentPasswordError('')
      // 새 비밀번호가 입력되어 있고 현재 비밀번호와 동일한 경우 체크
      if (newPassword && value === newPassword) {
        setPasswordError('새 비밀번호는 현재 비밀번호와 달라야 합니다.')
      } else if (newPassword && passwordError === '새 비밀번호는 현재 비밀번호와 달라야 합니다.') {
        setPasswordError('')
      }
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
    
    // 한글이 아닌 경우 상태 업데이트 (공백 제거)
    const value = e.target.value.replace(/\s+/g, '')
    setNewPassword(value)

    // 새 비밀번호 유효성 검사
    if (!value) {
      setPasswordError('새로운 비밀번호를 입력해주세요.')
    } else if (value.length < 8 || value.length > 20) {
      setPasswordError('비밀번호는 8자 이상, 20자 이하여야 합니다.')
    } else if (value === currentPassword && currentPassword) {
      setPasswordError('새 비밀번호는 현재 비밀번호와 달라야 합니다.')
    } else {
      setPasswordError('')
    }

    // 비밀번호 확인 일치 여부 검사
    if (confirmPassword) {
      if (value !== confirmPassword) {
        setPasswordsNotMatch(true)
        setConfirmPasswordError('비밀번호가 일치하지 않습니다.')
      } else {
        setPasswordsNotMatch(false)
        setConfirmPasswordError('')
      }
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
    
    // 한글이 아닌 경우 상태 업데이트 (공백 제거)
    const value = e.target.value.replace(/\s+/g, '')
    setConfirmPassword(value)

    if (!value) {
      setPasswordsNotMatch(false)
      setConfirmPasswordError('비밀번호 확인을 입력해주세요.')
    } else if (value !== newPassword) {
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

  // 닉네임 수정 제출
  const handleNicknameSubmit = async () => {
    if (isNicknameSame) {
      setNicknameError('변경할 닉네임을 입력해주세요.')
      return
    }

    if (nickname.length < 2 || nickname.length > 10) {
      setNicknameError('닉네임은 2자 이상 10자 이하여야 합니다.')
      return
    }

    try {
      setIsLoading(true)
      setNicknameError('')
      
      const result = await updateNickname(nickname)
      if (result.success) {
        showToastMessage('닉네임이 성공적으로 변경되었습니다.')
        setNicknameError('')
        setOriginalNickname(nickname)
        setIsNicknameSame(true)
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

    if (newPassword === currentPassword) {
      setPasswordError('새 비밀번호는 현재 비밀번호와 달라야 합니다.')
      return
    }

    if (!confirmPassword) {
      setConfirmPasswordError('비밀번호 확인을 입력해주세요.')
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
        setCurrentPasswordError('')
        setPasswordError('')
        setConfirmPasswordError('')
        setPasswordsNotMatch(false)
       
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

      // 회원 탈퇴 API 호출만 수행하고, 로컬 스토리지는 건드리지 않음
      const result = await userApi.deleteAccount()
      
      if (result.success) {
        // 탈퇴 성공 시, 로컬 스토리지는 건드리지 않고 모달만 표시
        setShowDeleteModal(false)
        setDeletionSuccessful(true)
        setShowSuccessModal(true)
      } else {
        alert(result.message || '회원 탈퇴에 실패했습니다.')
        setShowDeleteModal(false)
      }
    } catch (error) {
      console.error('회원 탈퇴 중 오류:', error)
      alert('회원 탈퇴 중 오류가 발생했습니다.')
      setShowDeleteModal(false)
    } finally {
      setIsLoading(false)
    }
  }

  // 회원 탈퇴 완료 처리 (모달 확인 버튼 클릭 시)
  const handleConfirmDeletion = () => {
    console.log('확인 버튼 클릭, 탈퇴 완료 처리 시작')
    // 모달 닫기
    setShowSuccessModal(false)
    
    // 실제 로그아웃 처리 (로컬 스토리지 삭제)
    if (deletionSuccessful) {
      // 로컬 스토리지 직접 접근 대신 로그아웃 함수 사용
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      console.log('로컬 스토리지 정보 삭제 완료')
      
      // 로그인 페이지로 즉시 이동 (history API 사용)
      window.location.replace('/')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="회원정보 수정" onBack={() => navigate('/mypage')} />

      <div className="flex-1 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-center mb-6">회원정보 수정</h1>

        {/* 이메일 표시 (수정 불가) */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">이메일</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full p-2 bg-gray-300 rounded-lg border border-gray-300 text-gray-500 font-medium"
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
            className="w-full p-2 bg-gray-100 rounded-lg border border-gray-300"
          />
          {isNicknameSame && !nicknameSuccess && (
            <p className="text-gray-500 text-sm mt-1">
              * 변경할 닉네임을 입력해주세요.
            </p>
          )}
          {nicknameError && (
            <p className="text-red-500 text-sm mt-1">* {nicknameError}</p>
          )}
          {nicknameSuccess && (
            <p className="text-green-500 text-sm mt-1">* {nicknameSuccess}</p>
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
            className={`w-full p-2 bg-gray-100 rounded-lg border ${
              currentPasswordError ? 'border-red-500' : 'border-gray-300'
            } mb-2`}
          />
          {currentPasswordError ? (
            <p className="text-red-500 text-sm mb-2">
              * {currentPasswordError}
            </p>
          ) : (
            <p className="text-gray-500 text-xs mb-2">
              * 현재 사용중인 비밀번호를 입력해주세요.
            </p>
          )}

          <label className="block text-sm font-medium mb-1">새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={handlePasswordChange}
            placeholder="새로운 비밀번호를 입력해주세요."
            className={`w-full p-2 bg-gray-100 rounded-lg border ${
              passwordError ? 'border-red-500' : 'border-gray-300'
            } mb-2`}
          />
          {passwordError ? (
            <p className="text-red-500 text-sm mb-2">* {passwordError}</p>
          ) : (
            <p className="text-gray-500 text-xs mb-2">
              * 8~20자의 영문, 숫자를 조합하여 입력해주세요.
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
            className={`w-full p-2 bg-gray-100 rounded-lg border ${
              confirmPasswordError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {confirmPasswordError ? (
            <p className="text-red-500 text-sm mt-1">
              * {confirmPasswordError}
            </p>
          ) : confirmPassword ? (
            <p className="text-green-500 text-xs mt-1">
              * 비밀번호가 일치합니다.
            </p>
          ) : (
            <p className="text-gray-500 text-xs mt-1">
              * 새 비밀번호를 한번 더 입력해주세요.
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
                !!passwordError ||
                !!currentPasswordError
              }
              className={`px-4 py-3 rounded-lg w-full ${
                isLoading ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                passwordsNotMatch ||
                !!passwordError ||
                !!currentPasswordError
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

      {/* 회원 탈퇴 완료 모달 */}
      {showSuccessModal === true && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <h3 className="font-bold text-lg text-center mb-4">
              회원 탈퇴가 완료되었습니다.
            </h3>
            <p className="text-center text-gray-600 mb-4">
              그동안 이용해 주셔서 감사합니다.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleConfirmDeletion}
                className="px-4 py-2 bg-[#F7B32B] text-white font-bold rounded-lg hover:bg-[#E09D18] active:bg-[#D08D08] transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditProfilePage
