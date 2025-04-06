import apiClient from './apiClient'

// 리뷰 작성
export const createReview = async (reviewData) => {
  try {
    const response = await apiClient.post('/api/v1/reviews', reviewData)
    if (response.status === 201) {
      // 토스트 메시지 표시
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: '리뷰가 성공적으로 작성되었습니다.',
          type: 'success'
        }
      }))
      return response.status
    }
    throw new Error('리뷰 작성에 실패했습니다.')
  } catch (error) {
    // 에러 토스트 메시지 표시
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: {
        message: '리뷰 작성에 실패했습니다. 다시 시도해주세요.',
        type: 'error'
      }
    }))
    throw error
  }
}

// 모든 리뷰 목록 조회
export const getReviews = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/v1/reviews', { params })
    return response
  } catch (error) {
    return { data: { reviews: [], totalPages: 0 } }
  }
}

// 리뷰 id로 리뷰 조회
export const getReviewById = async (reviewId) => {
  try {
    const response = await apiClient.get(`/api/v1/reviews/${reviewId}`)
    return response
  } catch (error) {
    throw error
  }
}

// 가게 id로 리뷰 조회
export const getStoreReviews = async (storeId) => {
  try {
    const response = await apiClient.get(`/api/v1/reviews/store/${storeId}`)
    return response
  } catch (error) {
    return { data: { reviews: [], totalPages: 0 } }
  }
}

// 사용자 id로 리뷰 조회 (내 리뷰)
export const getMyReviews = async () => {
  try {
    const response = await apiClient.get('/api/v1/reviews/my-reviews')
    return response
  } catch (error) {
    return { data: { reviews: [], totalPages: 0 } }
  }
}

// 리뷰 수정
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await apiClient.put(`/api/v1/reviews/${reviewId}`, reviewData)
    return response.status
  } catch (error) {
    throw error
  }
}

// 리뷰 삭제
export const deleteReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/api/v1/reviews/${reviewId}`)
    return response.status
  } catch (error) {
    throw error
  }
}
