import {
  API_BASE_URL,
  API_DIRECT_URL,
  API_ENDPOINTS,
} from '../config/apiConfig'

/**
 * 이미지를 업로드하고 URL을 반환합니다.
 * @param {File} imageFile - 이미지 파일
 * @param {string} type - 업로드 타입 ('products', 'stores', 'reviews' 중 하나)
 * @returns {Promise<string>} 업로드된 이미지 URL
 */
export const uploadImage = async (imageFile, type) => {
  if (!imageFile) {
    return null
  }

  try {
    // 토큰 가져오기
    const accessToken = sessionStorage.getItem('accessToken')

    // 1. 먼저 Presigned URL 생성을 위한 요청
    const presignedUrlEndpoint = `/images/${type}/presigned-url`
    const presignedUrlParams = new URLSearchParams({
      fileName: imageFile.name,
      contentType: imageFile.type
    })
    
    // Presigned URL 요청
    const presignedUrlResponse = await fetch(`${API_DIRECT_URL}/api/v1${presignedUrlEndpoint}?${presignedUrlParams}`, {
      method: 'POST',
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
    })

    if (!presignedUrlResponse.ok) {
      throw new Error(
        `Presigned URL 생성 실패: ${presignedUrlResponse.status} ${presignedUrlResponse.statusText}`
      )
    }

    const { presignedUrl, fileKey } = await presignedUrlResponse.json()

    // 2. S3에 직접 파일 업로드
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': imageFile.type,
        'x-amz-acl': 'public-read',
      },
      body: imageFile,
    })

    if (!uploadResponse.ok) {
      throw new Error(
        `이미지 업로드 실패: ${uploadResponse.status} ${uploadResponse.statusText}`
      )
    }

    // 3. CloudFront URL 생성 (S3 도메인을 CloudFront로 변환)
    // S3 URL 구조에서 필요한 경로 부분 추출
    return `https://dxa66rf338pjr.cloudfront.net/${fileKey}`
  } catch (error) {
    throw error
  }
}

/**
 * 이미지 데이터를 처리하고 업로드합니다.
 * @param {Object} formData - 폼 데이터
 * @param {File} imageFile - 이미지 파일
 * @param {string} imageFieldName - 이미지 필드 이름 (예: 'storeImg', 'productImg')
 * @param {string} type - 업로드 타입 ('products', 'stores', 'reviews' 중 하나)
 * @returns {Promise<Object>} 처리된 데이터
 */
export const processImageData = async (
  formData,
  imageFile,
  imageFieldName,
  type,
) => {
  // 이미지 파일이 없는 경우 원본 데이터 반환
  if (!imageFile) {
    return formData
  }

  try {
    // 이미지 업로드 함수 호출하여 URL 받기
    const imageUrl = await uploadImage(imageFile, type)
    
    // 업로드된 이미지 URL을 원본 데이터에 추가
    return {
      ...formData,
      [imageFieldName]: imageUrl,
    }
  } catch (error) {
    throw error
  }
}

/**
 * 여러 이미지를 업로드합니다.
 * @param {Array<File>} imageFiles - 이미지 파일 배열
 * @param {string} type - 업로드 타입 ('products', 'stores', 'reviews' 중 하나)
 * @returns {Promise<Array<string>>} 업로드된 이미지 URL 배열
 */
export const uploadMultipleImages = async (imageFiles, type) => {
  if (!imageFiles || imageFiles.length === 0) {
    return []
  }

  try {
    const uploadPromises = imageFiles.map(file => uploadImage(file, type));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw error
  }
}
