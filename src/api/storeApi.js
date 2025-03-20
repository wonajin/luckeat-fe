import apiClient from './apiClient'
import { processImageData } from './uploadApi'
import { API_BASE_URL, API_DIRECT_URL } from '../config/apiConfig'
import { TOKEN_KEYS } from './apiClient'

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
    console.log(`가게 상세 정보 요청: 가게 ID ${storeId}`)
    
    // 현재 액세스 토큰 확인 (여러 키 시도)
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS) || 
                       localStorage.getItem(TOKEN_KEYS.LEGACY)
    console.log('요청 시 토큰 확인:', accessToken ? '토큰 있음' : '토큰 없음')
    
    const response = await apiClient.get(`/stores/${storeId}`)
    console.log('가게 상세 정보 응답:', response.data)
    
    // 응답 데이터 확인 및 변환
    const storeData = response.data?.data || response.data
    
    return {
      success: true,
      data: storeData
    }
  } catch (error) {
    console.error('가게 상세 정보 조회 오류:', error)
    
    // 구체적인 오류 메시지 제공
    let errorMessage = '가게 정보를 불러오는데 실패했습니다.'
    
    if (error.response) {
      // 서버에서 응답이 왔지만 오류 상태 코드인 경우
      const { status } = error.response
      if (status === 404) {
        errorMessage = '가게를 찾을 수 없습니다.'
      } else if (status === 401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.'
      } else if (status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
    } else if (error.request) {
      // 요청이 전송되었지만 응답이 없는 경우
      errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.message
    }
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
