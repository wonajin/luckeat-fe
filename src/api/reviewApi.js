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
    console.error('리뷰 작성 중 오류:', error)
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
    console.error('리뷰 조회 중 오류:', error)
    return { data: { reviews: [], totalPages: 0 } }
  }
}

// 리뷰 id로 리뷰 조회
export const getReviewById = async (reviewId) => {
  try {
    const response = await apiClient.get(`/api/v1/reviews/${reviewId}`)
    return response
  } catch (error) {
    console.error('리뷰 상세 조회 중 오류:', error)
    throw error
  }
}

// 가게 id로 리뷰 조회
export const getStoreReviews = async (storeId) => {
  try {
    const response = await apiClient.get(`/api/v1/reviews/store/${storeId}`)
    return response
  } catch (error) {
    console.error('가게 리뷰 조회 중 오류:', error)
    return { data: { reviews: [], totalPages: 0 } }
  }
}

// 사용자 id로 리뷰 조회 (내 리뷰)
export const getMyReviews = async () => {
  try {
    console.log('내 리뷰 불러오기 요청 시작')
    const response = await apiClient.get('/api/v1/reviews/my-reviews')
    console.log('내 리뷰 응답 받음:', response)
    return response
  } catch (error) {
    console.error('내 리뷰 조회 중 오류:', error)
    return { data: { reviews: [], totalPages: 0 } }
  }
}

// 리뷰 수정
export const updateReview = async (reviewId, reviewData) => {
  try {
    console.log('리뷰 수정 요청 시작:', {
      method: 'PUT',
      url: `/api/v1/reviews/${reviewId}`,
      data: reviewData
    })
    
    const response = await apiClient.put(`/api/v1/reviews/${reviewId}`, reviewData)
    console.log('리뷰 수정 응답:', response)
    return response.status
  } catch (error) {
    console.error('리뷰 수정 중 오류:', error)
    throw error
  }
}

// 리뷰 삭제
export const deleteReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/api/v1/reviews/${reviewId}`)
    return response.status
  } catch (error) {
    console.error('리뷰 삭제 중 오류:', error)
    throw error
  }
}
