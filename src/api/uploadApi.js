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
    // 이미지 업로드를 위한 FormData 객체 생성
    const imageFormData = new FormData()
    imageFormData.append('file', imageFile)

    // 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken')

    // 업로드할 API 엔드포인트 결정
    const endpoint = API_ENDPOINTS.IMAGES(type)
    
    // API_URL 사용
    const uploadUrl = `${API_DIRECT_URL}/api/v1${endpoint}`
    
    console.log('이미지 업로드 시작:', uploadUrl)
    console.log(
      '업로드 이미지 정보:',
      imageFile.name,
      imageFile.type,
      imageFile.size,
    )

    // fetch를 사용한 이미지 업로드
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
      body: imageFormData,
    })

    console.log('이미지 업로드 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('이미지 업로드 응답 에러:', errorText)
      throw new Error(`이미지 업로드 실패: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('이미지 업로드 성공:', result)

    // 업로드된 이미지 URL 반환
    return result.imageUrl
  } catch (error) {
    console.error('이미지 업로드 중 오류 발생:', error)
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

    // S3 URL 구조에서 필요한 경로 부분 추출
    // 예: https://luckeat-front.s3.ap-northeast-2.amazonaws.com/images/products/34abb3e9-6791-4a15-816f-539b91f4ebbd-레오나르도디카프리오.jpeg
    // 에서 /images/products/34abb3e9-6791-4a15-816f-539b91f4ebbd-레오나르도디카프리오.jpeg 부분만 추출
    const pathPart = imageUrl.replace(
      'https://luckeat-front.s3.ap-northeast-2.amazonaws.com',
      '',
    )
    
    // API_DIRECT_URL 변수를 사용하여 새 URL 생성 (.env의 VITE_API_URL 값이 설정되어 있음)
    const formattedImageUrl = `https://dxa66rf338pjr.cloudfront.net${pathPart}`;
    
    console.log('이미지 URL 변환:', {
      원본: imageUrl,
      변환: formattedImageUrl,
    })

    // 업로드된 이미지 URL을 원본 데이터에 추가
    return {
      ...formData,
      [imageFieldName]: formattedImageUrl,
    }
  } catch (error) {
    console.error('이미지 업로드 중 오류 발생:', error)
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
    console.error('이미지 업로드 중 오류 발생:', error)
    throw error
  }
}
