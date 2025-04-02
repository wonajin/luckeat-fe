import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/dateUtils'
import { RESERVATION_STATUS, getStatusText, getStatusStyle } from '../utils/reservationStatus'
import { getUserReservations, cancelReservation } from '../api/reservationApi'

const ReservationStatusBadge = ({ status }) => {
  const { bgColor, textColor } = getStatusStyle(status)
  const statusText = getStatusText(status)

  return (
    <span className={`${bgColor} ${textColor} text-xs font-medium px-2.5 py-0.5 rounded`}>
      {statusText}
    </span>
  )
}

const UserReservationsPage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, user, checkCurrentAuthStatus } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState('ALL') // 'ALL', 'PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED', 'REJECTED'
  const [error, setError] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success') // 'success' or 'error'
  const [expandedReservationId, setExpandedReservationId] = useState(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [reservationToCancel, setReservationToCancel] = useState(null)

  // 더미 데이터 대신 API 호출로 대체
  useEffect(() => {
    const verifyAuth = async () => {
      const isValid = await checkCurrentAuthStatus()
      if (!isValid) {
        navigate('/login')
        return
      }
      fetchReservations()
    }

    verifyAuth()
  }, [checkCurrentAuthStatus, navigate])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null) // 에러 상태 초기화
      
      // 로컬 스토리지에서 사용자 정보 확인
      const userString = localStorage.getItem('user')
      if (!userString) {
        setError('로그인이 필요합니다.')
        return
      }
      
      const userData = JSON.parse(userString)
      const userId = userData.userId || userData.id
      
      if (!userId) {
        setError('유효한 사용자 ID를 찾을 수 없습니다.')
        return
      }

      const response = await getUserReservations(userId)
      
      if (!response) {
        setError('서버 응답이 없습니다.')
        return
      }

      if (response.success) {
        // response.data가 배열인지 확인
        const reservationsData = Array.isArray(response.data) ? response.data : []
        setReservations(reservationsData)
      } else {
        setError(response.message || '예약 정보를 가져오는데 실패했습니다.')
        setReservations([]) // 실패 시 빈 배열로 초기화
      }
    } catch (error) {
      console.error('예약 목록 조회 오류:', error)
      setError('예약 정보를 가져오는데 문제가 발생했습니다.')
      setReservations([]) // 에러 발생 시 빈 배열로 초기화
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async () => {
    if (!reservationToCancel) return

    try {
      setLoading(true)
      
      // cancelReservation API 사용
      const response = await cancelReservation(reservationToCancel.id)
      
      if (response.success) {
        // 예약 상태 업데이트
        setReservations((prev) => 
          prev.map((reservation) =>
            reservation.id === reservationToCancel.id
              ? { ...reservation, status: RESERVATION_STATUS.CANCELED }
              : reservation
          )
        )
        
        showToastMessage('예약이 취소되었습니다', 'success')
      } else {
        showToastMessage(response.message || '예약 취소에 실패했습니다', 'error')
      }
    } catch (error) {
      console.error('예약 취소 중 오류:', error)
      showToastMessage('예약 취소 중 오류가 발생했습니다', 'error')
    } finally {
      setShowCancelConfirm(false)
      setReservationToCancel(null)
      setLoading(false)
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

  const openCancelConfirm = (reservation) => {
    setReservationToCancel(reservation)
    setShowCancelConfirm(true)
  }

  const closeCancelConfirm = () => {
    setShowCancelConfirm(false)
    setReservationToCancel(null)
  }

  // 예약 상태에 따른 필터링
  const filteredReservations = filter === 'ALL' 
    ? reservations 
    : reservations.filter(r => r.status === filter)

  // 최신순 정렬
  const sortedReservations = [...filteredReservations].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="나의 예약" onBack={() => navigate('/mypage')} />
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
        <Header title="나의 예약" onBack={() => navigate('/mypage')} />
        <div className="flex-1 flex justify-center items-center">
          <p className="text-red-500">{error}</p>
        </div>
        <Navigation />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="나의 예약" onBack={() => navigate('/mypage')} />

      <div className="flex-1 overflow-y-auto">
        {/* 상단 정보 영역 */}
        <div className="bg-white p-4 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            나의 예약
          </h1>
          <p className="text-sm text-gray-600">
            모든 예약 내역을 확인하고 관리할 수 있습니다.
          </p>
        </div>

        {/* 필터 버튼 */}
        <div className="p-3 flex justify-between items-center">
          <button
            className="flex items-center text-sm font-medium text-gray-700"
            onClick={() => setShowFilter(!showFilter)}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            필터: {filter === 'ALL' ? '전체' : getStatusText(filter)}
          </button>
        </div>

        {/* 필터 옵션 */}
        {showFilter && (
          <div className="px-3 pb-3">
            <div className="bg-white rounded-lg shadow-sm p-2 flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filter === 'ALL' ? 'bg-[#F7B32B] text-white' : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFilter('ALL')}
              >
                전체
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filter === 'PENDING' ? 'bg-[#F7B32B] text-white' : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFilter('PENDING')}
              >
                대기중
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filter === 'CONFIRMED' ? 'bg-[#F7B32B] text-white' : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFilter('CONFIRMED')}
              >
                승인됨
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filter === 'CANCELED' ? 'bg-[#F7B32B] text-white' : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFilter('CANCELED')}
              >
                취소됨
              </button>
            </div>
          </div>
        )}

        {/* 예약 목록 */}
        <div className="p-3">
          {sortedReservations.length > 0 ? (
            <div className="space-y-4">
              {sortedReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div 
                    className="p-4"
                    onClick={() => toggleReservationDetails(reservation.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {reservation.storeName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {reservation.productName} {reservation.quantity}개
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(reservation.createdAt)}
                        </p>
                        {reservation.isZeroWaste && (
                          <p className="text-xs text-green-600 font-medium mt-1">
                            제로웨이스트 (포장용기 지참)
                          </p>
                        )}
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
                            <span className="font-medium text-gray-700">가격:</span>{' '}
                            <span className="text-gray-600">{reservation.price.toLocaleString()}원</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">예약 날짜:</span>{' '}
                            <span className="text-gray-600">{formatDateTime(reservation.reservationDate)}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">예약 시간:</span>{' '}
                            <span className="text-gray-600">{formatDateTime(reservation.reservationTime)}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">예약 생성:</span>{' '}
                            <span className="text-gray-600">{formatDateTime(reservation.createdAt)}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">포장 방법:</span>{' '}
                            <span className={reservation.isZeroWaste ? "text-green-600 font-medium" : "text-gray-600"}>
                              {reservation.isZeroWaste ? '제로웨이스트 (포장용기 지참)' : '일반 포장'}
                            </span>
                          </p>
                        </div>

                        {reservation.status === 'PENDING' && (
                          <div className="mt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openCancelConfirm(reservation)
                              }}
                              className="w-full py-2 bg-[#F7B32B] hover:bg-[#E09D18] text-white rounded-lg transition"
                            >
                              예약 취소
                            </button>
                          </div>
                        )}

                        <div className="mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/store/${reservation.storeId}`)
                            }}
                            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          >
                            가게 정보 보기
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <p className="text-gray-500 text-sm">
                {filter === 'ALL' ? '예약 내역이 없습니다.' : `${getStatusText(filter)} 상태의 예약이 없습니다.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 취소 확인 모달 */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">예약 취소 확인</h3>
            <p className="text-gray-500 mb-5">
              정말로 예약을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={closeCancelConfirm}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition"
              >
                취소
              </button>
              <button
                onClick={handleCancelReservation}
                className="flex-1 py-2 bg-[#F7B32B] hover:bg-[#E09D18] text-white rounded-lg transition"
              >
                확인
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