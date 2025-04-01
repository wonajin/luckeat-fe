import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'
import { formatDate, formatTime } from '../utils/dateUtils'

const ReservationStatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-200'
  let textColor = 'text-gray-700'
  let statusText = '대기중'

  switch (status) {
    case 'CONFIRMED':
      bgColor = 'bg-green-100'
      textColor = 'text-green-700'
      statusText = '승인됨'
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

const StoreReservationsPage = () => {
  const { storeId } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL') // 'ALL', 'PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED'
  const [error, setError] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success') // 'success' or 'error'
  const [expandedReservationId, setExpandedReservationId] = useState(null)
  const [activeFilter, setActiveFilter] = useState('ALL')

  // 더미 데이터 생성
  const dummyReservations = [
    {
      id: 1,
      customerName: '김고객',
      phone: '010-1234-5678',
      quantity: 2,
      reservationDate: '2023-05-15',
      reservationTime: '18:00',
      createdAt: '2023-05-14T14:30:00',
      status: 'PENDING',
      isZeroWaste: true
    },
    {
      id: 2,
      customerName: '박손님',
      phone: '010-2345-6789',
      quantity: 1,
      reservationDate: '2023-05-15',
      reservationTime: '19:30',
      notes: '문 앞에 놓아주세요',
      createdAt: '2023-05-14T15:45:00',
      status: 'CONFIRMED',
      isZeroWaste: false
    },
    {
      id: 3,
      customerName: '이방문',
      phone: '010-3456-7890',
      quantity: 3,
      reservationDate: '2023-05-16',
      reservationTime: '12:00',
      createdAt: '2023-05-14T16:20:00',
      status: 'COMPLETED',
      isZeroWaste: true
    },
    {
      id: 4,
      customerName: '최손님',
      phone: '010-4567-8901',
      quantity: 2,
      reservationDate: '2023-05-16',
      reservationTime: '17:30',
      createdAt: '2023-05-14T17:10:00',
      status: 'REJECTED',
      isZeroWaste: false
    },
    {
      id: 5,
      customerName: '정방문',
      phone: '010-5678-9012',
      quantity: 1,
      reservationDate: '2023-05-16',
      reservationTime: '18:45',
      notes: '친환경 용기 준비해주세요',
      createdAt: '2023-05-14T18:05:00',
      status: 'PENDING',
      isZeroWaste: true
    },
    // 추가 데이터 (스크롤 테스트용)
    {
      id: 6,
      customerName: '강고객',
      phone: '010-6789-0123',
      quantity: 2,
      reservationDate: '2023-05-17',
      reservationTime: '13:00',
      createdAt: '2023-05-15T09:10:00',
      status: 'PENDING',
      isZeroWaste: true
    },
    {
      id: 7,
      customerName: '윤손님',
      phone: '010-7890-1234',
      quantity: 3,
      reservationDate: '2023-05-17',
      reservationTime: '14:30',
      createdAt: '2023-05-15T10:20:00',
      status: 'CONFIRMED',
      isZeroWaste: false
    },
    {
      id: 8,
      customerName: '임방문',
      phone: '010-8901-2345',
      quantity: 1,
      reservationDate: '2023-05-17',
      reservationTime: '16:00',
      createdAt: '2023-05-15T11:30:00',
      status: 'PENDING',
      isZeroWaste: true
    },
    {
      id: 9,
      customerName: '한손님',
      phone: '010-9012-3456',
      quantity: 2,
      reservationDate: '2023-05-18',
      reservationTime: '12:30',
      createdAt: '2023-05-15T13:40:00',
      status: 'PENDING',
      isZeroWaste: false
    },
    {
      id: 10,
      customerName: '오방문',
      phone: '010-0123-4567',
      quantity: 4,
      reservationDate: '2023-05-18',
      reservationTime: '18:30',
      createdAt: '2023-05-15T14:50:00',
      status: 'CONFIRMED',
      isZeroWaste: true
    }
  ]

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    setTimeout(() => {
      setReservations(dummyReservations)
      setLoading(false)
    }, 500)
  }, [isLoggedIn, navigate])

  const handleReservationStatus = async (reservationId, status) => {
    try {
      setLoading(true)
      
      setTimeout(() => {
        const message = status === 'CONFIRMED' ? '예약이 승인되었습니다' : '예약이 거절되었습니다'
        showToastMessage(message, 'success')
        
        setReservations(prev => 
          prev.map(reservation => 
            reservation.id === reservationId 
              ? { ...reservation, status: status }
              : reservation
          )
        )
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('예약 상태 변경 중 오류:', error)
      showToastMessage('예약 상태 변경 중 오류가 발생했습니다', 'error')
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

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setActiveFilter(newFilter)
  }

  const filteredReservations = filter === 'ALL' 
    ? reservations 
    : reservations.filter(r => r.status === filter)

  const getStatusText = (status) => {
    switch(status) {
      case 'PENDING': return '대기중'
      case 'CONFIRMED': return '승인됨'
      case 'REJECTED': return '거절됨'
      case 'COMPLETED': return '완료됨'
      default: return '상태 미정'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="예약 목록" onBack={() => navigate('/business')} />
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
        <Header title="예약 목록" onBack={() => navigate('/business')} />
        <div className="flex-1 flex justify-center items-center">
          <p className="text-red-500">{error}</p>
        </div>
        <Navigation />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="예약 목록" onBack={() => navigate('/business')} />

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white p-4 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            가게 예약 목록
          </h1>
          <p className="text-sm text-gray-600">
            모든 예약 내역을 확인하고 관리할 수 있습니다.
          </p>
        </div>

        <div className="px-3 pt-3 pb-3">
          <div className="bg-white rounded-lg shadow-sm p-2 flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                activeFilter === 'ALL' ? 'bg-[#F7B32B] text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleFilterChange('ALL')}
            >
              전체
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                activeFilter === 'PENDING' ? 'bg-[#F7B32B] text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleFilterChange('PENDING')}
            >
              대기중
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                activeFilter === 'CONFIRMED' ? 'bg-[#F7B32B] text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleFilterChange('CONFIRMED')}
            >
              승인됨
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                activeFilter === 'REJECTED' ? 'bg-[#F7B32B] text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleFilterChange('REJECTED')}
            >
              거절됨
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                activeFilter === 'COMPLETED' ? 'bg-[#F7B32B] text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleFilterChange('COMPLETED')}
            >
              완료됨
            </button>
          </div>
        </div>

        <div className="p-3">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#F7B32B]"></div>
            </div>
          ) : filteredReservations.length > 0 ? (
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
                          {reservation.customerName || '고객'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          럭키트 {reservation.quantity || 1}개
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(reservation.createdAt)} {formatTime(reservation.createdAt)}
                        </p>
                        {reservation.isZeroWaste && (
                          <p className="text-xs text-green-600 font-medium mt-1">
                            제로웨이스트 손님 (포장용기 지참)
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <ReservationStatusBadge status={reservation.status} />
                        <div className="ml-2 text-gray-500">
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${
                              expandedReservationId === reservation.id ? 'transform rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {expandedReservationId === reservation.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">예약 번호:</span>{' '}
                            <span className="text-gray-600">{reservation.id}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">연락처:</span>{' '}
                            <span className="text-gray-600">{reservation.phone || '정보 없음'}</span>
                          </p>
                          {reservation.isZeroWaste && (
                            <p className="text-sm">
                              <span className="font-medium text-green-700">제로웨이스트:</span>{' '}
                              <span className="text-green-600">포장용기 지참</span>
                            </p>
                          )}
                          {reservation.notes && (
                            <p className="text-sm">
                              <span className="font-medium text-gray-700">요청사항:</span>{' '}
                              <span className="text-gray-600">{reservation.notes}</span>
                            </p>
                          )}
                        </div>

                        {reservation.status === 'PENDING' && (
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReservationStatus(reservation.id, 'REJECTED')
                              }}
                              className="flex-1 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition"
                            >
                              거절
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReservationStatus(reservation.id, 'CONFIRMED')
                              }}
                              className="flex-1 py-2 bg-[#F7B32B] hover:bg-[#E09D18] text-white rounded-lg transition"
                            >
                              승인
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
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <p className="text-gray-500 text-sm">
                {filter === 'ALL' ? '예약 내역이 없습니다.' : `${getStatusText(filter)} 상태의 예약이 없습니다.`}
              </p>
            </div>
          )}
        </div>
      </div>

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

export default StoreReservationsPage 