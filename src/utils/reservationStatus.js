/**
 * 예약 상태 관련 상수와 유틸리티 함수
 */

// 예약 상태 상수
export const RESERVATION_STATUS = {
  PENDING: 'PENDING',     // 대기중
  CONFIRMED: 'CONFIRMED', // 승인됨
  REJECTED: 'REJECTED',   // 거절됨
  CANCELED: 'CANCELED',   // 취소됨
  COMPLETED: 'COMPLETED'  // 완료됨
}

// 예약 상태 텍스트 변환 함수
export const getStatusText = (status) => {
  switch(status) {
    case RESERVATION_STATUS.PENDING:
      return '대기중'
    case RESERVATION_STATUS.CONFIRMED:
      return '승인됨'
    case RESERVATION_STATUS.REJECTED:
      return '거절됨'
    case RESERVATION_STATUS.COMPLETED:
      return '완료됨'
    case RESERVATION_STATUS.CANCELED:
      return '취소됨'
    default:
      return '상태 미정'
  }
}

// 예약 상태별 색상 스타일 (배경색, 텍스트 색상)
export const getStatusStyle = (status) => {
  switch(status) {
    case RESERVATION_STATUS.PENDING:
      return {
        bgColor: 'bg-gray-200',
        textColor: 'text-gray-700',
      }
    case RESERVATION_STATUS.CONFIRMED:
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
      }
    case RESERVATION_STATUS.REJECTED:
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
      }
    case RESERVATION_STATUS.COMPLETED:
      return {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
      }
    case RESERVATION_STATUS.CANCELED:
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
      }
    default:
      return {
        bgColor: 'bg-gray-200',
        textColor: 'text-gray-700',
      }
  }
} 