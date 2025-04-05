import apiClient from './apiClient'
import { processImageData } from './uploadApi'
import { API_BASE_URL, API_DIRECT_URL } from '../config/apiConfig'
import { TOKEN_KEYS } from './apiClient'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/apiConfig'
import { getCookieValue } from '../utils/cookieUtils'
import uploadApi from './uploadApi'

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
    // 필터링 파라미터 정리 및 필요한 경우 기본값 설정
    let newParams = { ...params }
    
    if (!newParams.page) {
      newParams.page = 0
    }
    
    if (!newParams.size) {
      newParams.size = 10
    }
    
    const url = `/stores`
    
    // 토큰 확인 (있으면 로그인 상태, 없으면 비로그인)
    const hasToken = !!localStorage.getItem('accessToken')
    
    // API 요청
    const response = await apiClient.get(url, {
      params: newParams
    })
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    // 에러 응답 구조화
    if (error.response) {
      const { status } = error.response
      
      // 인증 오류 (401)가 발생해도 가게 목록은 조회 가능하게 설정
      if (status === 401) {
        // 토큰 제거
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        
        // 토큰 없이 재시도
        try {
          const response = await apiClient.get(`/stores`, {
            params
          })
          
          return {
            success: true,
            data: response.data,
            isAnonymous: true
          }
        } catch (retryErr) {
          return {
            success: false,
            message: '가게 목록을 불러올 수 없습니다.'
          }
        }
      }
      
      return {
        success: false,
        message: '가게 목록을 불러올 수 없습니다.'
      }
    }
    
    return {
      success: false,
      message: '가게 목록을 불러올 수 없습니다. 네트워크 연결을 확인해주세요.'
    }
  }
}

// 특정 가게 상세 조회
export const getStoreById = async (storeId) => {
  try {
    // API 요청
    const accessToken = localStorage.getItem('accessToken')
    
    const response = await apiClient.get(`/stores/${storeId}`)
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      message: '가게 정보를 불러올 수 없습니다.',
      error
    }
  }
}

// 가게 정보 수정
export const updateStore = async (storeId, storeData, storeImage) => {
  try {
    // 이미지 처리 (이미지 파일이 있는 경우에만)
    let processedData = storeData
    if (storeImage) {
      console.log('가게 이미지 업로드 시작:', storeImage.name)
      processedData = await processImageData(
        storeData,
        storeImage,
        'storeImg',
        'stores',
      )
      console.log('이미지 처리 후 데이터:', processedData.storeImg)
    }

    // API 호출
    const response = await apiClient.put(`/api/v1/stores/${storeId}`, {
      storeName: processedData.storeName,
      storeImg: processedData.storeImg,
      address: processedData.address,
      categoryId: processedData.categoryId,
      website: processedData.website || '',
      storeUrl: processedData.storeUrl || '',
      permissionUrl: processedData.permissionUrl || '',
      latitude: processedData.latitude || 0,
      longitude: processedData.longitude || 0,
      contactNumber: processedData.contactNumber,
      description: processedData.description,
      businessNumber: processedData.businessNumber,
      pickupTime: processedData.pickupTime || '',
      businessHours: processedData.businessHours || '',
      reviewSummary: processedData.reviewSummary || '',
      avgRating: processedData.avgRating || 0,
      avgRatingGoogle: processedData.avgRatingGoogle || 0,
      googlePlaceId: processedData.googlePlaceId || '',
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('가게 정보 수정 오류:', error)
    return {
      success: false,
      message:
        error.response?.data?.message || '가게 정보 수정에 실패했습니다.',
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
    const response = await apiClient.get(API_ENDPOINTS.MY_STORE)
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || '가게 정보를 불러올 수 없습니다.',
      error
    }
  }
}

// 상품 상세 정보 조회
export const getProductById = async (storeId, productId) => {
  try {
    const response = await axios.get(
      `/api/v1/stores/${storeId}/products/${productId}`,
    )
    return response.data
  } catch (error) {
    console.error('상품 정보 조회 실패:', error)
    throw error
  }
}
