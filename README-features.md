# 럭키트 예약 기능 체크리스트

## 가게 상세 페이지 (StoreDetailPage.jsx)

### 럭키트 정보 표시
- [ ] 럭키트 이름과 라벨 표시
- [ ] 럭키트 설명 표시
- [ ] 가격(원래 가격, 할인 가격) 표시
- [ ] 할인율 표시
- [ ] 럭키트 이미지 표시
- [ ] 예약하기 버튼 표시

### 예약 모달
- [ ] 예약하기 버튼 클릭 시 모달 열림
- [ ] 예약자 정보 입력 폼 (이름, 연락처)
- [ ] 픽업 날짜/시간 선택 (가게 영업시간 반영)
- [ ] 수량 선택
- [ ] 제로웨이스트(용기 지참) 옵션 선택
- [ ] 요청사항(메모) 입력
- [ ] 취소 버튼 작동
- [ ] 예약 완료 버튼 작동
- [ ] 로그인하지 않은 사용자의 경우 로그인 페이지로 이동

### 예약 완료 후
- [ ] 예약 완료 메시지 표시
- [ ] 예약 목록 페이지로 이동 버튼 제공

## 사용자 예약 목록 페이지 (UserReservationsPage.jsx)

### 예약 목록 표시
- [ ] 예약 목록 로딩 상태 표시
- [ ] 예약 정보 요약 표시 (가게명, 상품명, 수량, 예약 일시)
- [ ] 예약 상태 뱃지 표시
- [ ] 제로웨이스트 표시

### 필터링 기능
- [ ] 전체 예약 보기 필터
- [ ] 대기중 예약 필터
- [ ] 승인됨 예약 필터
- [ ] 취소됨 예약 필터
- [ ] 완료됨 예약 필터
- [ ] 거절됨 예약 필터

### 예약 상세 정보 및 관리
- [ ] 예약 항목 클릭 시 상세 정보 확장
- [ ] 예약 번호, 가격, 제로웨이스트 여부, 예약 일시 상세 표시
- [ ] 대기중 예약에 대해 취소 버튼 제공
- [ ] 취소 확인 모달 작동
- [ ] 가게 정보 보기 버튼 작동

## 가게 예약 관리 페이지 (StoreReservationsPage.jsx)

### 예약 목록 표시
- [ ] 예약 목록 로딩 상태 표시
- [ ] 예약 정보 요약 표시 (고객명, 연락처, 수량, 예약 일시)
- [ ] 예약 상태 뱃지 표시
- [ ] 제로웨이스트 표시

### 필터링 기능
- [ ] 전체 예약 보기 필터
- [ ] 대기중 예약 필터
- [ ] 승인됨 예약 필터
- [ ] 거절됨 예약 필터
- [ ] 완료됨 예약 필터

### 예약 관리 기능
- [ ] 예약 항목 클릭 시 상세 정보 확장
- [ ] 고객 정보 (이름, 연락처) 표시
- [ ] 예약 상세 정보 표시
- [ ] 대기중 예약에 대해 승인/거절 버튼 제공
- [ ] 승인/거절 확인 모달 작동
- [ ] 고객 연락처 복사 기능
- [ ] 승인/거절 후 상태 업데이트 표시

## 공통 요구사항
- [ ] 모든 상태 표시는 reservationStatus.js의 공통 상수와 함수 사용
- [ ] 더미 데이터로 정적인 UI가 완벽하게 작동
- [ ] 모든 상태 변경이 사용자에게 시각적으로 명확하게 표시
- [ ] 모바일 화면에 최적화된 UI
- [ ] 모든 오류 상황에 대한 적절한 피드백 제공

## API 연동 준비
- [ ] API 호출 함수 준비 (reservationApi.js)
- [ ] 더미 데이터를 실제 API 응답 구조와 일치시키기
- [ ] API 호출 시 로딩 및 오류 상태 처리 로직 준비 