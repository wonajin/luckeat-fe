import apiClient from './apiClient'

/**
 * 예약 생성
 * @param {number} storeId - 가게 ID
 * @param {object} reservationData - 예약 데이터 (productId, quantity, isZerowaste)
 * @returns {Promise<object>} 예약 생성 결과
 */
export const createReservation = async (storeId, reservationData) => {
  try {
    const response = await apiClient.post(
      `/api/v1/reservation/stores/${storeId}`,
      reservationData,
    )

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('예약 생성 오류:', error)
    return {
      success: false,
      message: error.response?.data?.message || '예약 생성에 실패했습니다.',
    }
  }
}

/**
 * 예약 상태 변경 (확정/거절)
 * @param {object} statusData - 상태 변경 데이터 (reservationId, status)
 * @returns {Promise<object>} 상태 변경 결과
 */
export const updateReservationStatus = async (statusData) => {
  try {
    const response = await apiClient.post(
      '/api/v1/reservation/status',
      statusData,
    )

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('예약 상태 변경 오류:', error)
    return {
      success: false,
      message:
        error.response?.data?.message || '예약 상태 변경에 실패했습니다.',
    }
  }
}

/**
 * 예약 취소
 * @param {number} reservationId - 예약 ID
 * @returns {Promise<object>} 취소 결과
 */
export const cancelReservation = async (reservationId) => {
  try {
    const response = await apiClient.delete(
      `/api/v1/reservation/${reservationId}`,
    )

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('예약 취소 오류:', error)
    return {
      success: false,
      message: error.response?.data?.message || '예약 취소에 실패했습니다.',
    }
  }
}

/**
 * 가게 사장 예약 목록 조회
 * @param {number} storeId - 가게 ID
 * @returns {Promise<object>} 예약 목록
 */
export const getStoreReservations = async (storeId) => {
  try {
    const response = await apiClient.get(
      `/api/v1/reservation/stores/${storeId}`,
    )

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('가게 예약 목록 조회 오류:', error)
    return {
      success: false,
      message:
        error.response?.data?.message || '예약 목록 조회에 실패했습니다.',
      data: [],
    }
  }
}

/**
 * 가게 사장 예약 펜딩 목록 조회
 * @param {number} storeId - 가게 ID
 * @returns {Promise<object>} 대기중인 예약 목록
 */
export const getStorePendingReservations = async (storeId) => {
  try {
    const response = await apiClient.get(
      `/api/v1/reservation/stores/pending/${storeId}`,
    )

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('가게 펜딩 예약 목록 조회 오류:', error)
    return {
      success: false,
      message:
        error.response?.data?.message || '펜딩 예약 목록 조회에 실패했습니다.',
      data: [],
    }
  }
}

/**
 * 고객 예약 목록 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise<object>} 예약 목록
 */
export const getUserReservations = async (userId) => {
  try {
    const response = await apiClient.get(`/api/v1/reservation/${userId}`)

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('고객 예약 목록 조회 오류:', error)
    return {
      success: false,
      message:
        error.response?.data?.message || '예약 목록 조회에 실패했습니다.',
      data: [],
    }
  }
}

/**
 * 사용자의 완료된 예약 목록 조회
 * @returns {Promise<object>} 완료된 예약 목록
 */
export const getUserCompletedReservations = async () => {
  try {
    // 'me'를 사용하여 현재 사용자의 모든 예약을 가져옴
    const userId = 'me'
    const response = await apiClient.get(`/api/v1/reservation/${userId}`)
    
    if (response.data) {
      // 서버 응답에서 완료된 예약만 필터링
      // 'COMPLETED', 'PICKED_UP' 등 완료 상태인 예약만 필터링
      const completedOrders = response.data.filter(
        (order) =>
          order.status === 'COMPLETED' ||
          order.status === 'PICKED_UP' ||
          order.status === 'DONE'
      )
      
      return {
        success: true,
        data: { 
          completedOrders 
        }
      }
    }
    
    return {
      success: true,
      data: { completedOrders: [] }
    }
  } catch (error) {
    console.error('완료된 예약 목록 조회 오류:', error)
    return {
      success: false,
      message:
        error.response?.data?.message || '완료된 예약 목록 조회에 실패했습니다.',
      data: { completedOrders: [] }
    }
  }
}

/**
 * 사용자의 환경 기여 통계 조회
 * @returns {Promise<object>} 환경 기여 통계 데이터
 */
export const getUserEcoStats = async () => {
  try {
    const response = await apiClient.get('/api/v1/reservation/user/eco-stats')

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('환경 기여 통계 조회 오류:', error)
    // API 엔드포인트가 아직 없을 수 있으므로 실패해도 빈 데이터 반환
    return {
      success: false,
      message:
        error.response?.data?.message || '환경 기여 통계 조회에 실패했습니다.',
      data: {
        completedOrders: [],
        totalSaved: 0,
      },
    }
  }
}
