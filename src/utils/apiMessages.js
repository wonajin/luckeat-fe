/**
 * API 응답 메시지 상수
 * 백엔드 API에서 반환하는 응답 메시지를 정의합니다.
 */

// 성공 메시지
export const SUCCESS_MESSAGES = {
  // 인증 관련
  LOGIN_SUCCESS: '로그인에 성공했습니다. 환영합니다!',
  REGISTER_SUCCESS: '회원가입이 완료되었습니다! 로그인 후 이용해 주세요.',
  USER_INFO_SUCCESS: '사용자 정보를 성공적으로 불러왔습니다.',
  USER_UPDATE_SUCCESS: '사용자 정보가 성공적으로 수정되었습니다.',
  USER_DELETE_SUCCESS: '회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.',

  // 가게 관련
  STORE_CREATE_SUCCESS: '가게 등록이 완료되었습니다!',
  STORE_READ_SUCCESS: '가게 정보를 성공적으로 불러왔습니다.',
  STORE_UPDATE_SUCCESS: '가게 정보가 성공적으로 수정되었습니다.',
  STORE_DELETE_SUCCESS: '가게가 성공적으로 삭제되었습니다.',

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
  BAD_REQUEST: '필수 정보가 누락되었거나 잘못된 요청입니다. 입력 내용을 확인해주세요.',
  EMAIL_DUPLICATE: '이미 가입된 이메일입니다. 다른 이메일로 시도하거나 로그인해 주세요.',
  NICKNAME_DUPLICATE: '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.',

  // 401 에러 (인증 실패)
  UNAUTHORIZED: '로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.',
  TOKEN_EXPIRED: '로그인 상태가 만료되었습니다. 보안을 위해 다시 로그인해 주세요.',
  ACCESS_TOKEN_EXPIRED: '인증 정보가 만료되었습니다. 다시 로그인해 주세요.',

  // 403 에러 (권한 없음)
  FORBIDDEN: '해당 기능에 접근할 권한이 없습니다. 권한을 확인해주세요.',

  // 404 에러 (리소스 없음)
  STORE_NOT_FOUND: '요청하신 가게 정보를 찾을 수 없습니다.',
  REVIEW_NOT_FOUND: '요청하신 리뷰 정보를 찾을 수 없습니다.',
  CATEGORY_NOT_FOUND: '요청하신 카테고리 정보를 찾을 수 없습니다.',
  PRODUCT_NOT_FOUND: '요청하신 상품 정보를 찾을 수 없습니다.',
  USER_NOT_FOUND: '요청하신 사용자 정보를 찾을 수 없습니다.',
  PERMISSION_NOT_FOUND: '리뷰 작성 권한 정보를 찾을 수 없습니다.',

  // 500 에러 (서버 오류)
  DATABASE_ERROR: '데이터베이스 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  SERVER_ERROR: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  REQUEST_FAILED: '요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.',
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
      return '정보가 성공적으로 등록되었습니다.'
    case 400:
      return ERROR_MESSAGES.BAD_REQUEST
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED
    case 403:
      return ERROR_MESSAGES.FORBIDDEN
    case 404:
      return '요청하신 정보를 찾을 수 없습니다. 경로를 확인해주세요.'
    case 500:
      return ERROR_MESSAGES.SERVER_ERROR
    default:
      return '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
}

/**
 * 성공 응답을 처리합니다.
 * @param {Object} response - API 응답 객체
 * @returns {Object} 성공 정보를 담은 객체
 */
export const handleSuccessResponse = (response) => {
  // 기본값 설정
  let message = null;
  let isSuccess = true;
  let responseData = {};
  let statusCode = 200;

  try {
    // response가 null이거나 undefined인 경우 대비
    if (!response) {
      return {
        success: false,
        data: {},
        statusCode: 500,
        message: '서버로부터 응답을 받지 못했습니다.',
      };
    }

    // 상태 코드 확인
    statusCode = response.status || 200;
    
    // 데이터 안전하게 접근
    responseData = response.data || {};
    
    // 서버 응답에 명시적인 성공 플래그가 있는지 확인
    if (responseData.hasOwnProperty('success')) {
      isSuccess = Boolean(responseData.success);
    } else {
      // 명시적인 성공 플래그가 없는 경우:
      // 1. HTTP 상태 코드로 성공 여부 판단 (200, 201인 경우 성공)
      // 2. 토큰이 있는 경우 로그인 성공으로 간주
      isSuccess = (statusCode === 200 || statusCode === 201 || statusCode === 204);
      
      // 로그인 응답으로 보이는 경우 (accessToken이 있는 경우)
      if (responseData.accessToken) {
        isSuccess = true;
      }
    }

    // 응답 데이터에 메시지가 있으면 사용
    if (responseData.message) {
      message = responseData.message;
    }
    // 없으면 상태 코드에 따라 기본 메시지 사용
    else if (statusCode === 201) {
      message = SUCCESS_MESSAGES.REGISTER_SUCCESS;
    } else if (statusCode === 200) {
      message = '요청이 성공적으로 처리되었습니다.';
    }

    // 성공 여부가 명시적으로 실패로 표시되었을 경우
    if (!isSuccess) {
      message = message || '요청이 성공적으로 처리되지 않았습니다.';
    }

    return {
      success: isSuccess,
      data: responseData,
      statusCode: statusCode,
      message: message,
    };
  } catch (error) {
    return {
      success: false,
      data: responseData || {},
      statusCode: statusCode,
      message: '응답 처리 중 오류가 발생했습니다.',
      error: error.message,
    };
  }
};

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
