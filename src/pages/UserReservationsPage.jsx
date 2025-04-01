import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserReservations, cancelReservation } from '../api/reservationApi'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'

function UserReservationsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    const fetchReservations = async () => {
      try {
        setLoading(true)
        
        // 사용자 예약 목록 가져오기
        const response = await getUserReservations(user.userId)
        if (response.success && response.data) {
          // 최신순으로 정렬 (createdAt 기준)
          const sortedReservations = response.data.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          )
          setReservations(sortedReservations)
        }
      } catch (error) {
        console.error('예약 목록 로딩 중 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [isLoggedIn, user, navigate])

  // 예약 취소 모달 표시
  const handleShowCancelModal = (reservation) => {
    setSelectedReservation(reservation)
    setShowCancelModal(true)
  }

  // 예약 취소 처리
  const handleCancelReservation = async () => {
    if (!selectedReservation) return

    try {
      const response = await cancelReservation(selectedReservation.id)
      if (response.success) {
        // 예약 목록에서 취소된 예약 제거 또는 상태 업데이트
        const updatedReservations = reservations.map(reservation => {
          if (reservation.id === selectedReservation.id) {
            return { ...reservation, status: 'CANCELED' }
          }
          return reservation
        })
        setReservations(updatedReservations)
        setShowCancelModal(false)
      } else {
        console.error('예약 취소 실패:', response.message)
      }
    } catch (error) {
      console.error('예약 취소 중 오류:', error)
    }
  }

  // 예약 상태 텍스트
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return '대기중'
      case 'ACCEPTED':
        return '승인됨'
      case 'REJECTED':
        return '거절됨'
      case 'COMPLETED':
        return '완료'
      case 'CANCELED':
        return '취소됨'
      default:
        return '알 수 없음'
    }
  }

  // 예약 상태에 따른 배지 스타일
  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\./g, '-').replace(/\s/g, '').slice(0, -1)
    } catch (error) {
      return '날짜 정보 없음'
    }
  }

  // 시간 포맷 함수
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } catch (error) {
      return ''
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="예약 확인" />

      <div className="flex-1 overflow-y-auto">
        {/* 상단 제목 */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-center">예약 확인 페이지</h1>
          <p className="text-sm text-gray-600 text-center mt-1">
            내 예약 내역을 확인하세요
          </p>
        </div>

        {/* 예약 목록 */}
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F7B32B]"></div>
            </div>
          ) : reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-lg p-4 border-2 border-[#F7B32B] relative"
                >
                  {/* 상태 배지 */}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusStyle(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </div>

                  {/* 가게 이름 */}
                  <h3 className="text-lg font-bold mb-2 pr-16">{reservation.storeName}</h3>
                  
                  {/* 예약 정보 */}
                  <div className="space-y-1 mt-3">
                    <p className="text-sm">
                      <span className="font-medium">럭키트:</span> {reservation.quantity || 1}개
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">예약 시간:</span> {formatDate(reservation.pickupTime)} {formatTime(reservation.pickupTime)}
                    </p>
                    {reservation.bringContainer && (
                      <p className="text-sm text-green-600">
                        포장용기 지참
                      </p>
                    )}
                  </div>
                  
                  {/* 취소 버튼 - 대기중이나 승인됨 상태일 때만 표시 */}
                  {(reservation.status === 'PENDING' || reservation.status === 'ACCEPTED') && (
                    <div className="flex justify-end mt-3">
                      <button
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300"
                        onClick={() => handleShowCancelModal(reservation)}
                      >
                        예약 취소
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-500">
                예약 내역이 없습니다.
              </p>
              <button
                className="mt-3 py-2 px-4 bg-[#F7B32B] text-white rounded-lg font-medium hover:bg-[#E09D18]"
                onClick={() => navigate('/map')}
              >
                가게 둘러보기
              </button>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 mt-auto">
          <p className="text-center text-sm text-gray-400">
            Copyright @MYRO Corp. All Rights Reserved
          </p>
        </div>
      </div>

      {/* 예약 취소 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <h3 className="font-bold text-lg text-center mb-4">예약 취소</h3>
            <p className="text-center mb-4">
              정말 예약을 취소하시겠습니까?
              <br />
              <span className="text-sm text-gray-500">취소 후에는 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex space-x-2">
              <button
                className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg"
                onClick={() => setShowCancelModal(false)}
              >
                돌아가기
              </button>
              <button
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
                onClick={handleCancelReservation}
              >
                취소하기
              </button>
            </div>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  )
}

export default UserReservationsPage 