import apiClient from './apiClient'

// 카테고리 생성
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/v1/categories', categoryData)
    return response.data
  } catch (error) {
    throw error
  }
}

// 카테고리 목록 조회
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/v1/categories')
    return response.data
  } catch (error) {
    throw error
  }
}

// 카테고리 수정
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await apiClient.patch(
      `/v1/categories/${categoryId}`,
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
    const response = await apiClient.delete(`/v1/categories/${categoryId}`)
    return response.data
  } catch (error) {
    throw error
  }
}
