import apiClient from './apiClient'

// 가게의 상품 목록 조회
export const getStoreProducts = async (storeId) => {
  try {
    const response = await apiClient.get(`/api/v1/stores/${storeId}/products`)
    return response.data
  } catch (error) {
    console.error('상품 목록 조회 오류:', error)
    return []
  }
}

// 상품 등록
export const createProduct = async (storeId, productData) => {
  try {
    const data = {
      productName: productData.productName,
      originalPrice: parseInt(productData.originalPrice),
      discountedPrice: parseInt(productData.discountedPrice),
      description: productData.description || '',
      productCount: parseInt(productData.stock), // stock을 productCount로 변경
      is_open: true // isOpen 추가
    }
    
    const response = await apiClient.post(`/api/v1/stores/${storeId}/products`, data)
    return response.data
  } catch (error) {
    console.error('상품 등록 에러:', error)
    throw error
  }
}

// 상품 수정 
export const updateProduct = async (storeId, productId, productData) => {
  try {
    const data = {
      productName: productData.productName,
      originalPrice: parseInt(productData.originalPrice),
      discountedPrice: parseInt(productData.discountedPrice),
      description: productData.description || '',
      productCount: parseInt(productData.stock) // stock을 productCount로 변경
    }
    
    const response = await apiClient.put(`/api/v1/stores/${storeId}/products/${productId}`, data)
    return response.data
  } catch (error) {
    console.error('상품 수정 에러:', error)
    throw error
  }
}

// 상품 수량 수정
export const updateProductCount = async (storeId, productId, count) => {
  try {
    const response = await apiClient.patch(`/api/v1/stores/${storeId}/products/${productId}/count`, {
      count: count
    })
    return response.data
  } catch (error) {
    console.error('상품 수량 수정 오류:', error)
    throw error
  }
}

// 상품 삭제
export const deleteProduct = async (storeId, productId) => {
  try {
    const response = await apiClient.delete(`/api/v1/stores/${storeId}/products/${productId}`)
    return response.data
  } catch (error) {
    console.error('상품 삭제 오류:', error)
    throw error
  }
}

// 상품 상태 업데이트
export const updateProductStatus = async (storeId, productId, isOpen) => {
  try {
    const response = await apiClient.patch(`/api/v1/stores/${storeId}/products/${productId}/status`, {
      isOpen: isOpen
    })
    return response.data
  } catch (error) {
    console.error('상품 상태 업데이트 오류:', error)
    throw error
  }
}
