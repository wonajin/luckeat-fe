import apiClient from './apiClient'
import { processImageData, uploadImage } from './uploadApi'

// 가게의 상품 목록 조회
export const getStoreProducts = async (storeId) => {
  try {
    const response = await apiClient.get(`/stores/${storeId}/products`)
    return response.data
  } catch (error) {
    console.error('상품 목록 조회 오류:', error)
    return []
  }
}

// 상품 등록 (이미지 업로드 지원)
export const createProduct = async (storeId, productData, productImg) => {
  try {
    // 이미지 처리
    let imgData = null
    if (productImg) {
      const formData = new FormData()
      formData.append('file', productImg)
      
      const imageResponse = await apiClient.post(
        '/api/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      if (imageResponse.status === 200) {
        imgData = imageResponse.data
      }
    }
    
    // 상품 데이터 생성
    const data = {
      productName: productData.productName,
      originalPrice: parseInt(productData.originalPrice),
      discountedPrice: parseInt(productData.discountedPrice),
      description: productData.description || '',
      expiryDate: productData.expiryDate || null,
    }
    
    if (imgData) {
      data.productImg = imgData
    }
    
    const response = await apiClient.post(`/stores/${storeId}/products`, data)
    return response.data
  } catch (error) {
    console.error('상품 등록 에러:', error)
    throw error
  }
}

// 상품 수정 (이미지 업로드 지원)
export const updateProduct = async (
  storeId,
  productId,
  productData,
  productImg
) => {
  try {
    // 이미지 처리
    let imgData = null
    if (productImg) {
      const formData = new FormData()
      formData.append('file', productImg)
      
      const imageResponse = await apiClient.post(
        '/api/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      if (imageResponse.status === 200) {
        imgData = imageResponse.data
      }
    }
    
    // 상품 데이터 업데이트
    const data = {
      productName: productData.productName,
      originalPrice: parseInt(productData.originalPrice),
      discountedPrice: parseInt(productData.discountedPrice),
      description: productData.description || '',
      expiryDate: productData.expiryDate || null,
    }
    
    if (imgData) {
      data.productImg = imgData
    }
    
    const response = await apiClient.put(`/stores/${storeId}/products/${productId}`, data)
    return response.data
  } catch (error) {
    console.error('상품 수정 에러:', error)
    throw error
  }
}

// 상품 상태 수정 (활성화/비활성화)
export const updateProductStatus = async (storeId, productId, isOpen) => {
  try {
    const response = await apiClient.patch(`/stores/${storeId}/products/${productId}/status`, {
      isOpen: isOpen
    })
    return response.data
  } catch (error) {
    console.error('상품 상태 수정 오류:', error)
    throw error
  }
}

// 상품 삭제
export const deleteProduct = async (storeId, productId) => {
  try {
    const response = await apiClient.delete(`/stores/${storeId}/products/${productId}`)
    return response.data
  } catch (error) {
    console.error('상품 삭제 오류:', error)
    throw error
  }
}
