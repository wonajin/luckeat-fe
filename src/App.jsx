import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MyPage from './pages/MyPage'
import StoreDetailPage from './pages/StoreDetailPage'
import EditProfilePage from './pages/EditProfilePage'
import ReviewManagementPage from './pages/ReviewManagementPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import * as Sentry from '@sentry/react'
import { hasValidAccessToken } from './utils/jwtUtils'

// 오류 발생 시 보여줄 폴백 컴포넌트
const FallbackComponent = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-[390px] h-[775px] bg-white flex flex-col border border-gray-200 rounded-lg overflow-hidden relative p-6">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          앗! 문제가 발생했습니다.
        </h2>
        <p className="mb-6">
          죄송합니다. 예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나
          나중에 다시 시도해보세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          페이지 새로고침
        </button>
      </div>
    </div>
  )
}

// 토큰 유효성 검사 래퍼 컴포넌트
function AuthWrapper({ children }) {
  const { checkCurrentAuthStatus } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // 현재 경로가 인증이 필요하지 않은 경로인지 확인
    const publicPaths = ['/login', '/signup']
    const isPublicPath = publicPaths.includes(location.pathname)

    // 인증이 필요한 경로에서만 토큰 유효성 검사
    if (!isPublicPath) {
      const isValid = checkCurrentAuthStatus()

      // 유효하지 않은 토큰을 가진 경우 로그인 페이지로 리다이렉션
      if (!isValid && location.pathname !== '/login') {
        navigate('/login', {
          replace: true,
          state: {
            from: location.pathname,
            message: '로그인이 필요하거나 세션이 만료되었습니다.',
          },
        })
      }
    }
  }, [location.pathname, checkCurrentAuthStatus, navigate, location])

  return children
}

function AppRoutes() {
  return (
    <AuthWrapper>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/store/:id" element={<StoreDetailPage />} />
        <Route path="/reviews" element={<ReviewManagementPage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
      </Routes>
    </AuthWrapper>
  )
}

function App() {
  return (
    <AuthProvider>
      <Sentry.ErrorBoundary fallback={<FallbackComponent />}>
        <Router>
          <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-[390px] h-[775px] bg-white flex flex-col border border-gray-200 rounded-lg overflow-hidden relative">
              <AppRoutes />
            </div>
          </div>
        </Router>
      </Sentry.ErrorBoundary>
    </AuthProvider>
  )
}

export default Sentry.withProfiler(App)
