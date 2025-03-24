import apiClient from './apiClient'

// 카테고리 생성
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/categories', categoryData)
    return response.data
  } catch (error) {
    throw error
  }
}

// 카테고리 목록 조회
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories')
    return response.data
  } catch (error) {
    console.error('카테고리 목록 조회 오류:', error)
    
    // 오류 응답 구조화
    let errorMessage = '카테고리 목록을 불러오는데 실패했습니다.'
    
    if (error.response) {
      // 서버에서 응답이 왔지만 오류 상태 코드인 경우
      const { status } = error.response
      console.error(`HTTP 오류 (${status}):`, error.response.data)
      
      if (status === 401) {
        errorMessage = '인증이 필요합니다. 로그인 상태가 아니거나 토큰이 만료되었습니다.'
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

// 카테고리 수정
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await apiClient.patch(
      `/categories/${categoryId}`,
      categoryData,
    )
    return response.data
  } catch (error) {
    throw error
  }
}

// 카테고리 삭제
export const deleteCategory = async (categoryId) => {
  try {
    const response = await apiClient.delete(`/categories/${categoryId}`)
    return response.data
  } catch (error) {
    throw error
  }
}
