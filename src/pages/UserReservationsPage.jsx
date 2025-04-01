import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import { getUserReservations, cancelUserReservation } from '../api/reservationApi'
import { formatDate, formatTime } from '../utils/dateUtils'

const ReservationStatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-200'
  let textColor = 'text-gray-700'
  let statusText = '대기중'

  switch (status) {
    case 'CONFIRMED':
      bgColor = 'bg-green-100'
      textColor = 'text-green-700'
      statusText = '확정'
      break
    case 'CANCELED':
      bgColor = 'bg-red-100'
      textColor = 'text-red-700'
      statusText = '취소됨'
      break
    case 'COMPLETED':
      bgColor = 'bg-blue-100'
      textColor = 'text-blue-700'
      statusText = '완료'
      break
    case 'REJECTED':
      bgColor = 'bg-yellow-100'
      textColor = 'text-yellow-700'
      statusText = '거절됨'
      break
    default:
      break
  }

  return (
    <span className={`${bgColor} ${textColor} text-xs font-medium px-2.5 py-0.5 rounded`}>
      {statusText}
    </span>
  )
}

const UserReservationsPage = () => {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success') // 'success' or 'error'
  const [expandedReservationId, setExpandedReservationId] = useState(null)
  const [confirmCancelId, setConfirmCancelId] = useState(null)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await getUserReservations()
      if (response.success) {
        setReservations(response.data || [])
      } else {
        setError(response.message || '예약 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      setError('예약 목록을 불러오는데 실패했습니다.')
      console.error('예약 목록 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId) => {
    try {
      setLoading(true)
      const response = await cancelUserReservation(reservationId)
      if (response.success) {
        // 예약 목록에서 취소된 예약 상태 업데이트
        setReservations(
          reservations.map((res) =>
            res.id === reservationId ? { ...res, status: 'CANCELED' } : res
          )
        )
        showToastMessage('예약이 취소되었습니다.', 'success')
      } else {
        showToastMessage(response.message || '예약 취소에 실패했습니다.', 'error')
      }
    } catch (error) {
      showToastMessage('예약 취소 중 오류가 발생했습니다.', 'error')
      console.error('예약 취소 오류:', error)
    } finally {
      setLoading(false)
      setConfirmCancelId(null)
    }
  }

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const toggleReservationDetails = (reservationId) => {
    setExpandedReservationId(expandedReservationId === reservationId ? null : reservationId)
  }

  const openCancelConfirm = (reservationId, event) => {
    event.stopPropagation()
    setConfirmCancelId(reservationId)
  }

  const closeCancelConfirm = () => {
    setConfirmCancelId(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="예약 내역" onBack={() => navigate('/mypage')} />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F7B32B]"></div>
        </div>
        <Navigation />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Header title="예약 내역" onBack={() => navigate('/mypage')} />
        <div className="flex-1 flex justify-center items-center">
          <p className="text-red-500">{error}</p>
        </div>
        <Navigation />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="예약 내역" onBack={() => navigate('/mypage')} />

      <div className="flex-1 overflow-y-auto p-4">
        {reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-lg shadow overflow-hidden cursor-pointer"
                onClick={() => toggleReservationDetails(reservation.id)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {reservation.storeName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        예약일: {formatDate(reservation.reservationDate)}{' '}
                        {formatTime(reservation.reservationTime)}
                      </p>
                    </div>
                    <ReservationStatusBadge status={reservation.status} />
                  </div>

                  {expandedReservationId === reservation.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">예약 번호:</span>{' '}
                          <span className="text-gray-600">{reservation.id}</span>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">인원:</span>{' '}
                          <span className="text-gray-600">{reservation.people}명</span>
                        </p>
                        {reservation.request && (
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">요청사항:</span>{' '}
                            <span className="text-gray-600">{reservation.request}</span>
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">예약일시:</span>{' '}
                          <span className="text-gray-600">
                            {formatDate(reservation.reservationDate)}{' '}
                            {formatTime(reservation.reservationTime)}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">예약자 정보:</span>{' '}
                          <span className="text-gray-600">
                            {reservation.name} | {reservation.phone}
                          </span>
                        </p>
                      </div>

                      {reservation.status === 'PENDING' && (
                        <div className="mt-4">
                          <button
                            onClick={(e) => openCancelConfirm(reservation.id, e)}
                            className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                          >
                            예약 취소
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500">예약 내역이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 취소 확인 모달 */}
      {confirmCancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-4/5 max-w-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">예약 취소</h3>
            <p className="text-sm text-gray-500 mb-4">
              정말로 이 예약을 취소하시겠습니까? 취소 후에는 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeCancelConfirm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                아니오
              </button>
              <button
                type="button"
                onClick={() => handleCancelReservation(confirmCancelId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                예, 취소합니다
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {showToast && (
        <div
          className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 ${
            toastType === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white`}
        >
          {toastMessage}
        </div>
      )}

      <Navigation />
    </div>
  )
}

export default UserReservationsPage 