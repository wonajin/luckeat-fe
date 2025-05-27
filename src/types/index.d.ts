// 환경 변수 타입 선언
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SENTRY_DSN: string;
  readonly MODE: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 사용자 관련 타입
interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'BUSINESS' | 'ADMIN';
  profileImage?: string;
}

// 상점 관련 타입
interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  category: string;
  ownerId: string;
}

// 상품 관련 타입
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  imageUrl?: string;
  storeId: string;
  quantity: number;
}

// 예약 관련 타입
interface Reservation {
  id: string;
  userId: string;
  storeId: string;
  productId: string;
  quantity: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  pickupTime: string;
}

// 리뷰 관련 타입
interface Review {
  id: string;
  userId: string;
  storeId: string;
  productId: string;
  reservationId: string;
  rating: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
} 