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
 * 가게사장 예약 목록 조회
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
    console.error('가게사장 예약 목록 조회 오류:', error)
    return {
      success: false,
      message: error.response?.data?.message || '예약 목록 조회에 실패했습니다.',
      data: [],
    }
  }
}

/**
 * 가게사장 예약 펜딩 목록 조회
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
    console.error('가게 펜딩 목록 조회 오류:', error)
    return {
      success: false,
      message: error.response?.data?.message || '펜딩 예약 목록 조회에 실패했습니다.',
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
      message: error.response?.data?.message || '예약 목록 조회에 실패했습니다.',
      data: [],
    }
  }
}


/**
 * 사용자별 완료된 예약 목록 조회 
 * @param {number} userId - 사용자 ID
 * @returns {Promise<object>} 완료된 예약 목록
 */
export const getUserCompletedReservations = async () => {
  try {
    // 사용자 정보 가져오기
    const userString = localStorage.getItem('user')
    if (!userString) {
      return {
        success: false,
        message: '로그인 정보를 찾을 수 없습니다.',
        data: { completedOrders: [], confirmedOrders: [] }
      }
    }
    
    const user = JSON.parse(userString)
    // user 객체에서 userId 또는 id 값을 사용
    const userId = user.userId || user.id
    
    // 유효한 userId가 없는 경우 처리
    if (!userId) {
      console.error('유효한 사용자 ID를 찾을 수 없습니다.')
      return {
        success: false,
        message: '유효한 사용자 ID를 찾을 수 없습니다.',
        data: { completedOrders: [], confirmedOrders: [] }
      }
    }
    
    // userId로 예약 정보 조회
    const response = await apiClient.get(`/api/v1/reservation/${userId}`)
 
    if (response.data) {
      // 예약 내역 전체
      const reservations = Array.isArray(response.data) ? response.data : []
      
      // 완료된 예약만 필터링 ('COMPLETED', 'PICKED_UP', 'DONE')
      const completedOrders = reservations.filter(
        (order) =>
          order.status === 'COMPLETED' ||
          order.status === 'PICKED_UP' ||
          order.status === 'DONE'
      )
      
      // 확정된 예약만 필터링 ('CONFIRMED')
      const confirmedOrders = reservations.filter(
        (order) => order.status === 'CONFIRMED'
      )
      
      // 실제 주문 건수 = 완료된 주문 + 확정된 주문
      const totalOrderCount = completedOrders.length + confirmedOrders.length
 
      return {
        success: true,
        data: { 
          completedOrders,
          confirmedOrders,
          totalOrderCount
        }
      }
    }
 
    return {
      success: true,
      data: { 
        completedOrders: [], 
        confirmedOrders: [],
        totalOrderCount: 0
      }
    }
  } catch (error) {
    console.error('완료된 예약 목록 조회 오류:', error)
    return {
      success: false,
      message:
        error.response?.data?.message || '완료된 예약 목록 조회에 실패했습니다.',
      data: { 
        completedOrders: [], 
        confirmedOrders: [],
        totalOrderCount: 0
      }
    }
  }
}

/**
 * 사용자별 환경 기여 통계 조회
 * @param {number} userId - 사용자 ID
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
