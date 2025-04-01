import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'
import { formatDate, formatTime } from '../utils/dateUtils'
import { RESERVATION_STATUS, getStatusText, getStatusStyle } from '../utils/reservationStatus'

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
  const { isLoggedIn, user } = useAuth()
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

  // 더미 데이터
  const dummyReservations = [
    {
      id: 1,
      storeName: '맛있는 베이커리',
      storeId: 101,
      productName: '크로와상 키트',
      quantity: 2,
      reservationDate: '2023-05-20',
      reservationTime: '18:00',
      createdAt: '2023-05-15T14:30:00',
      status: RESERVATION_STATUS.PENDING,
      price: 15000,
      isZeroWaste: true
    },
    {
      id: 2,
      storeName: '행복한 떡집',
      storeId: 102,
      productName: '찹쌀떡 키트',
      quantity: 1,
      reservationDate: '2023-05-21',
      reservationTime: '19:30',
      createdAt: '2023-05-16T15:45:00',
      status: RESERVATION_STATUS.CONFIRMED,
      price: 8000,
      isZeroWaste: false
    },
    {
      id: 3,
      storeName: '신선한 샐러드',
      storeId: 103,
      productName: '야채 샐러드 키트',
      quantity: 3,
      reservationDate: '2023-05-18',
      reservationTime: '12:00',
      createdAt: '2023-05-14T16:20:00',
      status: RESERVATION_STATUS.COMPLETED,
      price: 12000,
      isZeroWaste: true
    },
    {
      id: 4,
      storeName: '맛있는 베이커리',
      storeId: 101,
      productName: '식빵 키트',
      quantity: 2,
      reservationDate: '2023-05-16',
      reservationTime: '17:30',
      createdAt: '2023-05-10T17:10:00',
      status: RESERVATION_STATUS.REJECTED,
      price: 10000,
      isZeroWaste: false
    },
    {
      id: 5,
      storeName: '홈메이드 파스타',
      storeId: 104,
      productName: '까르보나라 키트',
      quantity: 1,
      reservationDate: '2023-05-22',
      reservationTime: '18:45',
      createdAt: '2023-05-17T18:05:00',
      status: RESERVATION_STATUS.CANCELED,
      price: 14000,
      isZeroWaste: true
    },
    // 추가 데이터 (스크롤 테스트용)
    {
      id: 6,
      storeName: '분식왕',
      storeId: 105,
      productName: '떡볶이 키트',
      quantity: 2,
      reservationDate: '2023-05-23',
      reservationTime: '12:00',
      createdAt: '2023-05-18T10:10:00',
      status: RESERVATION_STATUS.PENDING,
      price: 9000,
      isZeroWaste: true
    },
    {
      id: 7,
      storeName: '맛있는 베이커리',
      storeId: 101,
      productName: '치아바타 키트',
      quantity: 1,
      reservationDate: '2023-05-24',
      reservationTime: '14:30',
      createdAt: '2023-05-18T11:20:00',
      status: RESERVATION_STATUS.CONFIRMED,
      price: 12000,
      isZeroWaste: false
    },
    {
      id: 8,
      storeName: '신선한 초밥',
      storeId: 106,
      productName: '연어초밥 키트',
      quantity: 3,
      reservationDate: '2023-05-25',
      reservationTime: '18:00',
      createdAt: '2023-05-18T14:30:00',
      status: RESERVATION_STATUS.PENDING,
      price: 25000,
      isZeroWaste: true
    },
    {
      id: 9,
      storeName: '이탈리안 피자',
      storeId: 107,
      productName: '마르게리타 피자 키트',
      quantity: 1,
      reservationDate: '2023-05-25',
      reservationTime: '19:00',
      createdAt: '2023-05-19T09:45:00',
      status: RESERVATION_STATUS.CONFIRMED,
      price: 18000,
      isZeroWaste: false
    },
    {
      id: 10,
      storeName: '데일리 커피',
      storeId: 108,
      productName: '케이크 키트',
      quantity: 2,
      reservationDate: '2023-05-26',
      reservationTime: '10:00',
      createdAt: '2023-05-19T15:55:00',
      status: RESERVATION_STATUS.PENDING,
      price: 16000,
      isZeroWaste: true
    }
  ]

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    // API 호출 대신 더미 데이터 사용
    setTimeout(() => {
      setReservations(dummyReservations)
      setLoading(false)
    }, 500)
  }, [isLoggedIn, user, navigate])

  const handleCancelReservation = async () => {
    if (!reservationToCancel) return

    try {
      setLoading(true)
      
      // API 호출 대신 더미 상태 변경
      setTimeout(() => {
        // 예약 취소 로직
        setReservations(prev => 
          prev.map(reservation => 
            reservation.id === reservationToCancel.id 
              ? { ...reservation, status: RESERVATION_STATUS.CANCELED }
              : reservation
          )
        )
        
        showToastMessage('예약이 취소되었습니다', 'success')
        setShowCancelConfirm(false)
        setReservationToCancel(null)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('예약 취소 중 오류:', error)
      showToastMessage('예약 취소 중 오류가 발생했습니다', 'error')
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

  // 예약 상태 텍스트 변환
  const getStatusText = (status) => {
    switch(status) {
      case 'PENDING': return '대기중'
      case 'CONFIRMED': return '승인됨'
      case 'REJECTED': return '거절됨'
      case 'COMPLETED': return '완료됨'
      case 'CANCELED': return '취소됨'
      default: return '상태 미정'
    }
  }

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
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filter === 'COMPLETED' ? 'bg-[#F7B32B] text-white' : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFilter('COMPLETED')}
              >
                완료됨
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filter === 'REJECTED' ? 'bg-[#F7B32B] text-white' : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFilter('REJECTED')}
              >
                거절됨
              </button>
            </div>
          </div>
        )}

        {/* 예약 목록 */}
        <div className="p-3">
          {filteredReservations.length > 0 ? (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-lg shadow overflow-hidden cursor-pointer"
                  onClick={() => toggleReservationDetails(reservation.id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {reservation.storeName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {reservation.productName} {reservation.quantity}개
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(reservation.reservationDate)} {formatTime(reservation.reservationTime)}
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
                          {reservation.isZeroWaste && (
                            <p className="text-sm">
                              <span className="font-medium text-green-700">제로웨이스트:</span>{' '}
                              <span className="text-green-600">포장용기 지참</span>
                            </p>
                          )}
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">예약일:</span>{' '}
                            <span className="text-gray-600">
                              {formatDate(reservation.reservationDate)} {formatTime(reservation.reservationTime)}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">예약시간:</span>{' '}
                            <span className="text-gray-600">{formatTime(reservation.reservationTime)}</span>
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