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
import { hasValidAccessToken } from './utils/jwtUtils'

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
      <Router>
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="w-[390px] h-[775px] bg-white flex flex-col border border-gray-200 rounded-lg overflow-hidden relative">
            <AppRoutes />
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
