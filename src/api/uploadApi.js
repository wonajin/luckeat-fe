// 기본 API URL
const API_BASE_URL = '/api/v1'

/**
 * 이미지 데이터를 처리하고 업로드합니다.
 * @param {Object} formData - 폼 데이터
 * @param {File} imageFile - 이미지 파일
 * @param {string} imageFieldName - 이미지 필드 이름 (예: 'storeImg', 'productImg')
 * @param {string} uploadPath - 업로드 경로 (예: '/store-images', '/product-images')
 * @returns {Promise<Object>} 처리된 데이터
 */
export const processImageData = async (
  formData,
  imageFile,
  imageFieldName,
  uploadPath,
) => {
  // 이미지 파일이 없는 경우 원본 데이터 반환
  if (!imageFile) {
    return formData
  }

  try {
    // 이미지 업로드를 위한 FormData 객체 생성
    const imageFormData = new FormData()
    imageFormData.append('image', imageFile)

    // 토큰 가져오기
    const token = localStorage.getItem('token')

    // fetch를 사용한 이미지 업로드
    const response = await fetch(`${API_BASE_URL}${uploadPath}`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: imageFormData,
    })

    if (!response.ok) {
      throw new Error(`이미지 업로드 실패: ${response.statusText}`)
    }

    const result = await response.json()

    // 업로드된 이미지 URL을 원본 데이터에 추가
    return {
      ...formData,
      [imageFieldName]: result.imageUrl,
    }
  } catch (error) {
    console.error('이미지 업로드 중 오류 발생:', error)
    throw error
  }
}

/**
 * 여러 이미지를 업로드합니다.
 * @param {Array<File>} imageFiles - 이미지 파일 배열
 * @param {string} uploadPath - 업로드 경로
 * @returns {Promise<Array<string>>} 업로드된 이미지 URL 배열
 */
export const uploadMultipleImages = async (imageFiles, uploadPath) => {
  if (!imageFiles || imageFiles.length === 0) {
    return []
  }

  try {
    const token = localStorage.getItem('token')
    const uploadPromises = imageFiles.map(async (file) => {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_BASE_URL}${uploadPath}`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`이미지 업로드 실패: ${response.statusText}`)
      }

      const result = await response.json()
      return result.imageUrl
    })

    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('이미지 업로드 중 오류 발생:', error)
    throw error
  }
}
