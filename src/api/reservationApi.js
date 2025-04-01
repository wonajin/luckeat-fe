import apiClient from './apiClient'
import {
  handleSuccessResponse,
  handleErrorResponse,
} from '../utils/apiMessages'
import { API_ENDPOINTS } from '../config/apiConfig'

/**
 * 예약 생성
 * @param {number} storeId - 가게 ID
 * @param {object} reservationData - 예약 데이터 (productId, quantity, isZerowaste)
 * @returns {Promise<object>} 예약 생성 결과
 */
export const createReservation = async (reservationData) => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.RESERVATIONS,
      reservationData,
    )
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

/**
 * 예약 상태 변경 (승인/거절/완료)
 * @param {object} statusData - 상태 변경 데이터 (reservationId, status)
 * @returns {Promise<object>} 상태 변경 결과
 */
export const updateReservationStatus = async (statusData) => {
  try {
    const { reservationId, status } = statusData
    const response = await apiClient.post(
      `${API_ENDPOINTS.RESERVATIONS}/${reservationId}/status`,
      { status },
    )
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

/**
 * 예약 취소 (고객용)
 * @param {number} reservationId - 예약 ID
 * @returns {Promise<object>} 취소 결과
 */
export const cancelReservation = async (reservationId) => {
  try {
    const response = await apiClient.post(
      `${API_ENDPOINTS.RESERVATIONS}/${reservationId}/cancel`,
    )
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

/**
 * 가게별 예약 목록 조회
 * @param {number} storeId - 가게 ID
 * @returns {Promise<object>} 예약 목록
 */
export const getStoreReservations = async (storeId) => {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.STORES}/${storeId}/reservations`,
    )
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

/**
 * 가게별 대기중인 예약 목록 조회
 * @param {number} storeId - 가게 ID
 * @returns {Promise<object>} 대기중인 예약 목록
 */
export const getStorePendingReservations = async (storeId) => {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.STORES}/${storeId}/reservations/pending`,
    )
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

/**
 * 사용자별 예약 목록 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise<object>} 예약 목록
 */
export const getUserReservations = async (userId) => {
  try {
    // userId가 'me'이면 현재 로그인한 사용자 본인의 예약을 조회
    // 그 외에는 특정 사용자의 예약을 조회
    const endpoint =
      userId === 'me'
        ? `${API_ENDPOINTS.USERS}/me/reservations`
        : `${API_ENDPOINTS.USERS}/${userId}/reservations`

    const response = await apiClient.get(endpoint)
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

/**
 * 예약 상세 조회
 * @param {number} reservationId - 예약 ID
 * @returns {Promise<object>} 예약 상세 정보
 */
export const getReservationDetail = async (reservationId) => {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.RESERVATIONS}/${reservationId}`,
    )
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

/**
 * 사용자별 완료된 예약 목록 조회 (환경 기여도 계산용)
 * @param {number} userId - 사용자 ID
 * @returns {Promise<object>} 완료된 예약 목록
 */
export const getUserCompletedReservations = async (userId) => {
  try {
    // userId가 'me'이면 현재 로그인한 사용자 본인의 예약을 조회
    // 그 외에는 특정 사용자의 예약을 조회
    const endpoint =
      userId === 'me'
        ? `${API_ENDPOINTS.USERS}/me/reservations/completed`
        : `${API_ENDPOINTS.USERS}/${userId}/reservations/completed`

    const response = await apiClient.get(endpoint)
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}

/**
 * 사용자별 환경 기여 통계 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise<object>} 환경 기여 통계 데이터
 */
export const getUserEcoStats = async (userId) => {
  try {
    // userId가 'me'이면 현재 로그인한 사용자 본인의 통계를 조회
    // 그 외에는 특정 사용자의 통계를 조회
    const endpoint =
      userId === 'me'
        ? `${API_ENDPOINTS.USERS}/me/eco-stats`
        : `${API_ENDPOINTS.USERS}/${userId}/eco-stats`

    const response = await apiClient.get(endpoint)
    return handleSuccessResponse(response)
  } catch (error) {
    return handleErrorResponse(error)
  }
}
