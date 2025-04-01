import apiClient from './apiClient'

// 예약 생성
export const createReservation = async (storeId, reservationData) => {
  try {
    const response = await apiClient.post(`/stores/${storeId}/reservations`, reservationData)
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('예약 생성 오류:', error)
    return {
      success: false,
      message: error.response?.data?.message || '예약 생성에 실패했습니다.'
    }
  }
}

// 예약 상태 변경 (확정/거절)
export const updateReservationStatus = async (reservationId, status) => {
  try {
    const response = await apiClient.patch(`/reservations/${reservationId}/status`, { status })
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('예약 상태 변경 오류:', error)
    return {
      success: false,
      message: error.response?.data?.message || '예약 상태 변경에 실패했습니다.'
    }
  }
}

// 예약 취소
export const cancelReservation = async (reservationId) => {
  try {
    const response = await apiClient.delete(`/reservations/${reservationId}`)
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('예약 취소 오류:', error)
    return {
      success: false,
      message: error.response?.data?.message || '예약 취소에 실패했습니다.'
    }
  }
}

// 가게별 예약 목록 조회 (사업자용)
export const getStoreReservations = async (storeId) => {
  try {
    const response = await apiClient.get(`/stores/${storeId}/reservations`)
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('가게 예약 목록 조회 오류:', error)
    return {
      success: false,
      message: error.response?.data?.message || '예약 목록 조회에 실패했습니다.',
      data: []
    }
  }
}

// 가게 사장 예약 펜딩 목록 조회
export const getStorePendingReservations = async (storeId) => {
  try {
    const response = await apiClient.get(`/stores/${storeId}/reservations/pending`)
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('가게 펜딩 예약 목록 조회 오류:', error)
    return {
      success: false,
      message: error.response?.data?.message || '펜딩 예약 목록 조회에 실패했습니다.',
      data: []
    }
  }
}

// 사용자 예약 목록 조회
export const getUserReservations = async () => {
  try {
    const response = await apiClient.get('/reservations/user')
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('사용자 예약 목록 조회 오류:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || '예약 목록을 불러오는데 실패했습니다.',
      data: [] 
    }
  }
}

// 사용자 예약 취소
export const cancelUserReservation = async (reservationId) => {
  try {
    const response = await apiClient.delete(`/reservations/${reservationId}`)
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('예약 취소 오류:', error)
    return {
      success: false,
      message: error.response?.data?.message || '예약 취소에 실패했습니다.'
    }
  }
}

// 예약 상세 정보 조회
export const getReservationById = async (reservationId) => {
  try {
    const response = await apiClient.get(`/reservations/${reservationId}`)
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('예약 상세 정보 조회 오류:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || '예약 정보를 불러오는데 실패했습니다.',
      data: null
    }
  }
} 