/**
 * JWT 토큰 관련 유틸리티 함수
 */

interface DecodedToken {
  exp: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

/**
 * JWT 토큰에서 페이로드 부분을 추출하고 디코딩하는 함수
 * @param {string} token - JWT 토큰
 * @returns {Object|null} 디코딩된 페이로드 객체 또는 유효하지 않은 경우 null
 */
export const decodeToken = (token: string | null): DecodedToken | null => {
  if (!token) return null

  try {
    // JWT는 header.payload.signature 형식으로 구성됨
    const base64Payload = token.split('.')[1]
    if (!base64Payload) return null

    // Base64 디코딩
    const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payload) as DecodedToken
  } catch (error) {
    return null
  }
}

/**
 * JWT 토큰의 만료 여부를 확인하는 함수
 * @param {string} token - JWT 토큰
 * @returns {boolean} 만료되었거나 유효하지 않은 경우 true, 유효한 경우 false
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true

  try {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) return true

    // exp는 초 단위의 유닉스 타임스탬프이므로 1000을 곱해 밀리초로 변환
    const expirationTime = decoded.exp * 1000
    const currentTime = Date.now()

    return currentTime >= expirationTime
  } catch (error) {
    return true // 오류 발생 시 만료된 것으로
  }
}

/**
 * JWT 토큰의 유효성을 검사하는 함수 (형식 및 만료 여부)
 * @param {string} token - JWT 토큰
 * @returns {boolean} 유효한 경우 true, 그렇지 않은 경우 false
 */
export const isValidToken = (token: string | null): boolean => {
  if (!token) return false

  // JWT 형식 확인 (header.payload.signature)
  const tokenParts = token.split('.')
  if (tokenParts.length !== 3) return false

  // 만료 여부 확인
  return !isTokenExpired(token)
}

/**
 * 로컬 스토리지에 저장된 액세스 토큰의 유효성을 확인하는 함수
 * @returns {boolean} 유효한 토큰이 있으면 true, 그렇지 않으면 false
 */
export const hasValidAccessToken = (): boolean => {
  const accessToken = sessionStorage.getItem('accessToken')
  return isValidToken(accessToken)
} 