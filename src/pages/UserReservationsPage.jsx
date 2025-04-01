
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
        const response = await getUserReservations(user.userId)
        if (response.success && response.data) {
          const sortedReservations = response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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

  const handleShowCancelModal = (reservation) => {
    setSelectedReservation(reservation)
    setShowCancelModal(true)
  }

  const handleCancelReservation = async () => {
    if (!selectedReservation) return

    try {
      const response = await cancelReservation(selectedReservation.id)
      if (response.success) {
        const updated = reservations.map((r) =>
          r.id === selectedReservation.id ? { ...r, status: 'CANCELED' } : r
        )
        setReservations(updated)
        setShowCancelModal(false)
      }
    } catch (error) {
      console.error('예약 취소 오류:', error)
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return '대기중'
      case 'ACCEPTED': return '승인됨'
      case 'REJECTED': return '거절됨'
      case 'COMPLETED': return '완료'
      case 'CANCELED': return '취소됨'
      default: return '알 수 없음'
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'CANCELED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
      }).replace(/\./g, '-').replace(/\s/g, '').slice(0, -1)
    } catch {
      return '날짜 정보 없음'
    }
  }

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit', minute: '2-digit', hour12: false
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="예약 확인" />
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="text-2xl font-bold text-center">예약 확인 페이지</h1>
        <p className="text-sm text-center text-gray-500">내 예약 내역을 확인하세요</p>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : reservations.length > 0 ? (
          <div className="space-y-4 mt-4">
            {reservations.map((res) => (
              <div key={res.id} className="bg-white border-2 border-yellow-400 rounded-lg p-4 relative">
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusStyle(res.status)}`}>
                    {getStatusText(res.status)}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 pr-16">{res.storeName}</h3>
                <div className="space-y-1 mt-3 text-sm">
                  <p><span className="font-medium">럭키트:</span> {res.quantity || 1}개</p>
                  <p><span className="font-medium">예약 시간:</span> {formatDate(res.pickupTime)} {formatTime(res.pickupTime)}</p>
                  {res.bringContainer && <p className="text-green-600">포장용기 지참</p>}
                </div>
                {(res.status === 'PENDING' || res.status === 'ACCEPTED') && (
                  <div className="flex justify-end mt-3">
                    <button
                      className="px-3 py-1 bg-gray-200 text-sm font-medium rounded hover:bg-gray-300"
                      onClick={() => handleShowCancelModal(res)}>
                      예약 취소
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center mt-6">
            <p className="text-gray-500">예약 내역이 없습니다.</p>
            <button
              className="mt-3 py-2 px-4 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
              onClick={() => navigate('/map')}
            >가게 둘러보기</button>
          </div>
        )}
      </div>

      {/* 취소 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <h3 className="font-bold text-lg text-center mb-4">예약 취소</h3>
            <p className="text-center mb-4 text-sm text-gray-700">
              정말 예약을 취소하시겠습니까?
              <br />취소 후에는 되돌릴 수 없습니다.
            </p>
            <div className="flex space-x-2">
              <button
                className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg"
                onClick={() => setShowCancelModal(false)}
              >돌아가기</button>
              <button
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
                onClick={handleCancelReservation}
              >취소하기</button>
            </div>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  )
}

export default UserReservationsPage