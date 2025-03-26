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

// 상품 등록 (임시 이미지 URL 사용)
export const createProduct = async (storeId, productData, productImage) => {
  try {
    console.log('상품 등록 시작:', storeId);
    console.log('상품 데이터:', {
      productId: productData.productId,
      productName: productData.productName,
      originalPrice: productData.originalPrice,
      discountedPrice: productData.discountedPrice
    });
    
    // 임시 이미지 URL 설정
    let finalProductData = { ...productData };
    
    // 이미지가 있으면 임시 URL 설정, 없으면 그대로 진행
    if (productImage) {
      // 임시 이미지 URL 설정 (실제 업로드는 나중에 구현)
      finalProductData.productImg = "https://via.placeholder.com/300x200?text=상품이미지";
      console.log('임시 이미지 URL 추가됨');
    }
    
    console.log('상품 등록 요청 데이터:', finalProductData);
    
    // 상품 등록 API 호출
    const response = await apiClient.post(`/stores/${storeId}/products`, finalProductData);
    console.log('상품 등록 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('상품 등록 오류:', error)
    throw error
  }
}

// 상품 수정 (임시 이미지 URL 사용)
export const updateProduct = async (storeId, productId, productData, productImage) => {
  try {
    console.log('상품 수정 시작:', storeId, productId);
    console.log('상품 데이터:', {
      productName: productData.productName,
      originalPrice: productData.originalPrice,
      discountedPrice: productData.discountedPrice,
      productImg: productData.productImg
    });
    
    // 임시 이미지 URL 설정
    let finalProductData = { ...productData };
    
    // 이미지가 있으면 임시 URL 설정, 없으면 기존 이미지 URL 유지
    if (productImage) {
      // 임시 이미지 URL 설정 (실제 업로드는 나중에 구현)
      finalProductData.productImg = "https://via.placeholder.com/300x200?text=상품이미지";
      console.log('임시 이미지 URL 추가됨');
    }
    
    console.log('상품 수정 요청 데이터:', finalProductData);
    
    // 상품 수정 API 호출
    const response = await apiClient.put(`/stores/${storeId}/products/${productId}`, finalProductData);
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
