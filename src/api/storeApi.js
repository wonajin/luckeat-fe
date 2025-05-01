import apiClient from './apiClient'
import { processImageData } from './uploadApi'
import { uploadImage } from './uploadApi'
import { API_BASE_URL, API_DIRECT_URL } from '../config/apiConfig'
import { TOKEN_KEYS } from './apiClient'
import axios from 'axios'

// 가게 등록 (이미지 업로드 지원)
export const registerStore = async (storeData, storeImage) => {
  try {
    // 이미지 처리
    let storeImgUrl = null;
    if (storeImage) {
      try {
        storeImgUrl = await uploadImage(storeImage, 'stores');
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        throw new Error('이미지 업로드에 실패했습니다.');
      }
    }

    // 가게 등록 API 호출
    const dataToSubmit = {
      ...storeData,
      storeImg: storeImgUrl
    };
    
    const response = await apiClient.post('/stores', dataToSubmit);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 가게 목록 조회 (필터링 및 정렬 옵션 지원)
export const getStores = async (params = {}) => {
  try {
    // API 요청 경로 설정
    let url = '/api/v1/stores';
    
    // URL 매개변수 객체 생성
    const urlParams = new URLSearchParams();
    
    // 모든 매개변수 URL에 추가
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        urlParams.append(key, value);
      }
    }
    
    // 매개변수가 있으면 URL에 추가
    if (urlParams.toString()) {
      url = `${url}?${urlParams.toString()}`;
    }

    // API 요청
    const response = await apiClient.get(url);
    
    // 페이지네이션 응답인지 확인하고 적절히 처리
    const data = response.data?.content || response.data || [];

    return {
      success: true,
      data
    };
  } catch (error) {
    // 오류 응답 구조화
    let errorMessage = '가게 목록을 불러오는데 실패했습니다.';

    if (error.response) {
      // 서버에서 응답이 왔지만 오류 상태 코드인 경우
      const { status } = error.response;

      if (status === 401) {
        errorMessage =
          '인증이 필요합니다. 로그인 상태가 아니거나 토큰이 만료되었습니다.';
        // 비로그인 상태에서도 계속 진행할 수 있도록 빈 배열 반환
        return [];
      }
    } else if (error.request) {
      // 요청이 전송되었지만 응답이 없는 경우
      errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    }

    // 오류를 던지는 대신 빈 배열 반환
    return [];
  }
}

// 특정 가게 상세 조회
export const getStoreById = async (storeId) => {
  try {
    // 현재 액세스 토큰 확인
    const accessToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS)

    const response = await apiClient.get(`/stores/${storeId}`)

    // 응답 데이터 확인 및 변환
    const storeData = response.data?.data || response.data

    return {
      success: true,
      data: storeData,
    }
  } catch (error) {
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
export const updateStore = async (storeId, storeData, storeImage) => {
  try {
    // 이미지 처리 (이미지 파일이 있는 경우에만)
    let storeImgUrl = storeData.storeImg;
    if (storeImage) {
      try {
        storeImgUrl = await uploadImage(storeImage, 'stores');
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        // 이미지 업로드 실패 시 기존 이미지 유지
      }
    }

    // API 호출
    const response = await apiClient.put(`/api/v1/stores/${storeId}`, {
      storeName: storeData.storeName,
      storeImg: storeImgUrl,
      address: storeData.address,
      categoryId: storeData.categoryId,
      website: storeData.website || '',
      storeUrl: storeData.storeUrl || '',
      permissionUrl: storeData.permissionUrl || '',
      latitude: storeData.latitude || 0,
      longitude: storeData.longitude || 0,
      contactNumber: storeData.contactNumber,
      description: storeData.description,
      businessNumber: storeData.businessNumber,
      pickupTime: storeData.pickupTime || '',
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
    const response = await apiClient.get('/api/v1/stores/my')

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
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

// 상품 상세 정보 조회
export const getProductById = async (storeId, productId) => {
  try {
    const response = await apiClient.get(`/stores/${storeId}/products/${productId}`)
    return response.data
  } catch (error) {
    throw error
  }
}
