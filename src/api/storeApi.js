import apiClient from './apiClient'
import { processImageData } from './uploadApi'
import { API_BASE_URL, API_DIRECT_URL } from '../config/apiConfig'
import { TOKEN_KEYS } from './apiClient'
import axios from 'axios'

// 가게 등록 (이미지 업로드 지원)
export const registerStore = async (storeData, storeImage) => {
  try {
    // 이미지 처리
    const processedData = await processImageData(
      storeData,
      storeImage,
      'storeImg',
      'stores',
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
    console.log('getStores 호출 - 파라미터:', params)

    // isDiscountOpen 파라미터가 있는지 확인
    let url = '/stores'

    // 파라미터에 isDiscountOpen가 있을 때만 URL에 직접 추가
    if (params.isDiscountOpen === true) {
      url = `/stores?isDiscountOpen=true`
      // 다른 파라미터는 그대로 유지하되 isDiscountOpen는 제거
      const { isDiscountOpen, ...otherParams } = params
      params = otherParams
    }

    console.log('API 요청 URL:', url)
    console.log('API 요청 파라미터(수정됨):', params)

    // 토큰 있는지 확인 (디버깅용)
    const hasToken = localStorage.getItem('accessToken') !== null
    console.log('인증 토큰 상태:', hasToken ? '토큰 있음' : '토큰 없음')

    // API_BASE_URL에 이미 슬래시가 포함되어 있으므로 'stores'만 사용
    const response = await apiClient.get(url, {
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

    // 오류 응답 구조화
    let errorMessage = '가게 목록을 불러오는데 실패했습니다.'

    if (error.response) {
      // 서버에서 응답이 왔지만 오류 상태 코드인 경우
      const { status } = error.response
      console.error(`HTTP 오류 (${status}):`, error.response.data)

      if (status === 401) {
        errorMessage =
          '인증이 필요합니다. 로그인 상태가 아니거나 토큰이 만료되었습니다.'
        console.log('인증 오류 발생: 로그인 없이 계속 진행합니다.')
        // 비로그인 상태에서도 계속 진행할 수 있도록 빈 배열 반환
        return []
      }
    } else if (error.request) {
      // 요청이 전송되었지만 응답이 없는 경우
      console.error('네트워크 오류: 서버에 연결할 수 없습니다.')
      errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
    }

    // 오류를 던지는 대신 빈 배열 반환
    console.error(errorMessage)
    return []
  }
}

// 특정 가게 상세 조회
export const getStoreById = async (storeId) => {
  try {
    console.log(`가게 상세 정보 요청: 가게 ID ${storeId}`)

    // 현재 액세스 토큰 확인
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS)
    console.log('요청 시 토큰 확인:', accessToken ? '토큰 있음' : '토큰 없음')

    const response = await apiClient.get(`/stores/${storeId}`)
    console.log('가게 상세 정보 응답:', response.data)

    // 응답 데이터 확인 및 변환
    const storeData = response.data?.data || response.data

    return {
      success: true,
      data: storeData,
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
      error: error.message,
    }
  }
}

// 가게 정보 수정
export const updateStore = async (storeId, storeData) => {
  try {
    const response = await apiClient.put(`/api/v1/stores/${storeId}`, {
      storeName: storeData.storeName,
      storeImg: storeData.storeImg,
      address: storeData.address,
      website: storeData.website || '',
      storeUrl: storeData.storeUrl || '',
      permissionUrl: storeData.permissionUrl || '',
      latitude: storeData.latitude || 0,
      longitude: storeData.longitude || 0,
      contactNumber: storeData.contactNumber,
      description: storeData.description,
      businessNumber: storeData.businessNumber,
      businessHours: storeData.businessHours || '',
      reviewSummary: storeData.reviewSummary || '',
      avgRating: storeData.avgRating || 0,
      avgRatingGoogle: storeData.avgRatingGoogle || 0,
      googlePlaceId: storeData.googlePlaceId || '',
    })
    
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || '가게 정보 수정에 실패했습니다.',
    }
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

// 사용자의 가게 정보 조회
export const getMyStore = async () => {
  try {
    console.log('내 가게 정보 요청')
    const response = await apiClient.get('/api/v1/stores/my')
    console.log('내 가게 정보 응답:', response.data)

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('내 가게 정보 조회 오류:', error)

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
      error: error.message,
    }
  }
}
