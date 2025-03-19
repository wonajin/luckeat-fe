import apiClient from './apiClient'
import { processImageData } from './uploadApi'

// 상품 등록 (이미지 업로드 지원)
export const registerProduct = async (storeId, productData, productImage) => {
  try {
    // 이미지 처리
    const processedData = await processImageData(
      productData,
      productImage,
      'productImg',
      '/product-images',
    )

    const response = await apiClient.post(
      `/stores/${storeId}/products`,
      processedData,
    )
    return response.data
  } catch (error) {
    throw error
  }
}

// 상품 리스트 조회
export const getProducts = async (storeId) => {
  try {
    const response = await apiClient.get(`/stores/${storeId}/products`)
    return response.data
  } catch (error) {
    throw error
  }
}

// 특정 상품 조회
export const getProductById = async (storeId, productId) => {
  try {
    const response = await apiClient.get(
      `/stores/${storeId}/products/${productId}`,
    )
    return response.data
  } catch (error) {
    throw error
  }
}

// 상품 수정 (이미지 업로드 지원)
export const updateProduct = async (
  storeId,
  productId,
  productData,
  productImage,
) => {
  try {
    // 이미지 처리
    const processedData = await processImageData(
      productData,
      productImage,
      'productImg',
      '/product-images',
    )

    const response = await apiClient.put(
      `/stores/${storeId}/products/${productId}`,
      processedData,
    )
    return response.data
  } catch (error) {
    throw error
  }
}

// 상품 상태 수정
export const updateProductStatus = async (storeId, productId, isOpen) => {
  try {
    const response = await apiClient.patch(
      `/stores/${storeId}/products/${productId}`,
      { is_open: isOpen },
    )
    return response.data
  } catch (error) {
    throw error
  }
}

// 상품 삭제
export const deleteProduct = async (storeId, productId) => {
  try {
    const response = await apiClient.delete(
      `/stores/${storeId}/products/${productId}`,
    )
    return response.data
  } catch (error) {
    throw error
  }
}
