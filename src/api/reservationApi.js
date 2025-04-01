import apiClient from './apiClient'

// 예약 생성
export const createReservation = async (storeId, reservationData) => {
  try {
    const response = await apiClient.post(`/api/v1/reservation/stores/${storeId}`, reservationData)

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
export const updateReservationStatus = async (statusData) => {
  try {
    const response = await apiClient.post('/api/v1/reservation/status', statusData)

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
    const response = await apiClient.delete(`/api/v1/reservation/${reservationId}`)

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

// 가게 사장 예약 목록 조회
export const getStoreReservations = async (storeId) => {
  try {
    const response = await apiClient.get(`/api/v1/reservation/stores/${storeId}`)

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
    const response = await apiClient.get(`/api/v1/reservation/stores/pending/${storeId}`)

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

// 고객 예약 목록 조회
export const getUserReservations = async (userId) => {
  try {
    const response = await apiClient.get(`/api/v1/reservation/${userId}`)

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('고객 예약 목록 조회 오류:', error)
    return {
      success: false,
      message: error.response?.data?.message || '예약 목록 조회에 실패했습니다.',
      data: []
    }
  }
} 