import apiClient from './apiClient'
import { processImageData } from './uploadApi'
import { API_BASE_URL, API_DIRECT_URL } from '../config/apiConfig'

// 가게 등록 (이미지 업로드 지원)
export const registerStore = async (storeData, storeImage) => {
  try {
    // 이미지 처리
    const processedData = await processImageData(
      storeData,
      storeImage,
      'storeImg',
      '/store-images',
    )

    // 가게 등록 API 호출
    const response = await apiClient.post('/stores', processedData)
    return response.data
  } catch (error) {
    throw error
  }
}

// 가게 목록 조회 (필터링 및 정렬 옵션 지원)
export const getStores = async (params = {}) => {
  try {
    // API_BASE_URL에 이미 슬래시가 포함되어 있으므로 'stores'만 사용
    // 또는 API_ENDPOINTS.STORES 사용 권장
    const response = await apiClient.get('stores', {
      params,
    })

    console.log('가게 목록 조회 응답 전체:', response)
    console.log('가게 목록 조회 응답 데이터:', response.data)
    console.log('데이터 타입:', typeof response.data)

    // 이 부분에서 데이터 구조 로깅
    if (Array.isArray(response.data)) {
      console.log('배열 길이:', response.data.length)
    } else if (response.data && typeof response.data === 'object') {
      console.log('객체 키:', Object.keys(response.data))
    }

    return response.data
  } catch (error) {
    console.error('가게 목록 조회 오류:', error)
    throw error
  }
}

// 특정 가게 상세 조회
export const getStoreById = async (storeId) => {
  try {
    const response = await apiClient.get(`/stores/${storeId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// 가게 정보 수정 (이미지 업로드 지원)
export const updateStore = async (storeId, storeData, storeImage) => {
  try {
    // 이미지 처리
    const processedData = await processImageData(
      storeData,
      storeImage,
      'storeImg',
      '/store-images',
    )

    const response = await apiClient.put(`/stores/${storeId}`, processedData)
    return response.data
  } catch (error) {
    throw error
  }
}

// 가게 공유수 증가
export const increaseStoreShare = async (storeId) => {
  try {
    const response = await apiClient.post(`/stores/${storeId}/share`)
    return response.data
  } catch (error) {
    throw error
  }
}

// 가게 삭제
export const deleteStore = async (storeId) => {
  try {
    const response = await apiClient.delete(`/stores/${storeId}`)
    return response.data
  } catch (error) {
    throw error
  }
}
