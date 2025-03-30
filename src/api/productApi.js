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
export const createProduct = async (storeId, productData, productImage) => {
  try {
    console.log('상품 등록 시작:', storeId);
    console.log('상품 데이터:', {
      productId: productData.productId,
      productName: productData.productName,
      originalPrice: productData.originalPrice,
      discountedPrice: productData.discountedPrice
    });
    
    // 이미지 처리 및 업로드
    const processedData = await processImageData(
      productData,
      productImage,
      'productImg',
      'products'
    );
    
    console.log('상품 등록 요청 데이터:', processedData);
    
    // 상품 등록 API 호출
    const response = await apiClient.post(`/stores/${storeId}/products`, processedData);
    console.log('상품 등록 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('상품 등록 오류:', error)
    throw error
  }
}

// 상품 수정 (이미지 업로드 지원)
export const updateProduct = async (storeId, productId, productData, productImage) => {
  try {
    console.log('상품 수정 시작:', storeId, productId);
    console.log('상품 데이터:', {
      productName: productData.productName,
      originalPrice: productData.originalPrice,
      discountedPrice: productData.discountedPrice,
      productImg: productData.productImg
    });
    
    // 이미지 처리 및 업로드
    const processedData = await processImageData(
      productData,
      productImage,
      'productImg',
      'products'
    );
    
    console.log('상품 수정 요청 데이터:', processedData);
    
    // 상품 수정 API 호출
    const response = await apiClient.put(`/stores/${storeId}/products/${productId}`, processedData);
    console.log('상품 수정 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('상품 수정 오류:', error)
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
