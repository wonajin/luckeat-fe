/**
 * API 응답 메시지 상수
 * 백엔드 API에서 반환하는 응답 메시지를 정의합니다.
 */

// 성공 메시지
export const SUCCESS_MESSAGES = {
  // 인증 관련
  LOGIN_SUCCESS: '로그인 성공',
  REGISTER_SUCCESS: '회원가입 성공',
  USER_INFO_SUCCESS: '사용자 정보 조회 성공',
  USER_UPDATE_SUCCESS: '사용자 정보 수정 성공',
  USER_DELETE_SUCCESS: '사용자 삭제 성공',

  // 가게 관련
  STORE_CREATE_SUCCESS: '가게 등록 성공',
  STORE_READ_SUCCESS: '가게 데이터 조회 성공',
  STORE_UPDATE_SUCCESS: '가게 정보 수정 성공',
  STORE_DELETE_SUCCESS: '가게 삭제 성공',

  // 리뷰 관련
  REVIEW_CREATE_SUCCESS: '리뷰 작성 성공',
  REVIEW_READ_SUCCESS: '리뷰 데이터 조회 성공',
  REVIEW_UPDATE_SUCCESS: '리뷰 수정 성공',
  REVIEW_DELETE_SUCCESS: '리뷰 삭제 성공',

  // 카테고리 관련
  CATEGORY_CREATE_SUCCESS: '카테고리 등록 성공',
  CATEGORY_READ_SUCCESS: '카테고리 데이터 조회 성공',
  CATEGORY_UPDATE_SUCCESS: '카테고리 정보 수정 성공',
  CATEGORY_DELETE_SUCCESS: '카테고리 삭제 성공',

  // 상품 관련
  PRODUCT_CREATE_SUCCESS: '상품 등록 성공',
  PRODUCT_READ_SUCCESS: '상품 데이터 조회 성공',
  PRODUCT_UPDATE_SUCCESS: '상품 정보 수정 성공',
  PRODUCT_DELETE_SUCCESS: '상품 삭제 성공',

  // 권한 관련
  PERMISSION_GRANT_SUCCESS: '리뷰 작성 권한 부여 성공',
  PERMISSION_READ_SUCCESS: '권한 데이터 조회 성공',
}

// 오류 메시지
export const ERROR_MESSAGES = {
  // 400 에러 (잘못된 요청)
  BAD_REQUEST: '필수 요청값 누락 또는 잘못된 요청',
  EMAIL_DUPLICATE: '이메일이 이미 존재함',
  NICKNAME_DUPLICATE: '닉네임이 이미 존재함',

  // 401 에러 (인증 실패)
  UNAUTHORIZED: '인증이 필요함 (Authorization 헤더 누락 또는 토큰 만료)',
  TOKEN_EXPIRED: '로그인 토큰 만료 (재로그인 필요)',
  ACCESS_TOKEN_EXPIRED: '액세스 토큰 만료 (토큰 갱신 필요)',

  // 403 에러 (권한 없음)
  FORBIDDEN: '권한이 없음 (해당 작업을 수행할 수 없음)',

  // 404 에러 (리소스 없음)
  STORE_NOT_FOUND: '가게 정보를 찾을 수 없음',
  REVIEW_NOT_FOUND: '리뷰 정보를 찾을 수 없음',
  CATEGORY_NOT_FOUND: '카테고리 정보를 찾을 수 없음',
  PRODUCT_NOT_FOUND: '상품 정보를 찾을 수 없음',
  USER_NOT_FOUND: '사용자 정보를 찾을 수 없음',
  PERMISSION_NOT_FOUND: '리뷰 작성 권한 정보를 찾을 수 없음',

  // 500 에러 (서버 오류)
  DATABASE_ERROR: '데이터베이스 접속 실패',
  SERVER_ERROR: '서버 내부 오류',
  REQUEST_FAILED: '요청 처리 실패',
}

/**
 * 응답 메시지가 성공 메시지인지 확인합니다.
 * @param {string} message - 확인할 메시지
 * @returns {boolean} 성공 메시지인 경우 true, 아닌 경우 false
 */
export const isSuccessMessage = (message) => {
  return Object.values(SUCCESS_MESSAGES).includes(message)
}

/**
 * HTTP 상태 코드에 따른 메시지를 반환합니다.
 * @param {number} statusCode - HTTP 상태 코드
 * @param {string} message - 응답 메시지 (선택적)
 * @returns {string} 상태 코드에 해당하는 기본 메시지 또는 제공된 메시지
 */
export const getMessageByStatusCode = (statusCode, message = null) => {
  if (message) return message

  switch (statusCode) {
    case 200:
      return '요청이 성공적으로 처리되었습니다.'
    case 201:
      return '정상적으로 처리되었습니다.'
    case 400:
      return ERROR_MESSAGES.BAD_REQUEST
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED
    case 403:
      return ERROR_MESSAGES.FORBIDDEN
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.'
    case 500:
      return ERROR_MESSAGES.SERVER_ERROR
    default:
      return '알 수 없는 오류가 발생했습니다.'
  }
}

/**
 * 성공 응답을 처리합니다.
 * @param {Object} response - API 응답 객체
 * @returns {Object} 성공 정보를 담은 객체
 */
export const handleSuccessResponse = (response) => {
  console.log('apiMessages - handleSuccessResponse 호출됨. 상태 코드:', response.status);
  
  // 성공 상태 코드인지 확인 (200대)
  const isSuccessStatus = response.status >= 200 && response.status < 300;
  
  // 응답에서 메시지 추출
  const message = response.data?.message || getMessageByStatusCode(response.status);
  
  console.log('apiMessages - 응답 처리 결과:', { 
    success: isSuccessStatus, 
    statusCode: response.status,
    message
  });
  
  return {
    success: isSuccessStatus, // 명시적으로 success 플래그 설정
    data: response.data,
    message: message,
    statusCode: response.status,
  }
}

/**
 * 오류 응답을 처리합니다.
 * @param {Object} error - API 오류 객체
 * @returns {Object} 오류 정보를 담은 객체
 */
export const handleErrorResponse = (error) => {
  const statusCode = error.response?.status || 500
  const errorMessage =
    error.response?.data?.message || getMessageByStatusCode(statusCode)

  return {
    success: false,
    status: statusCode,
    message: errorMessage,
  }
}

export default {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  isSuccessMessage,
  getMessageByStatusCode,
  handleSuccessResponse,
  handleErrorResponse,
}
