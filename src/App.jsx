import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MyPage from './pages/MyPage'
import ProfileEditPage from './pages/ProfileEditPage'
import StoreDetailPage from './pages/StoreDetailPage'
import MyReviewPage from './pages/MyReviewPage'

const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
}

function App() {
  return (
    <BrowserRouter {...router}>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-[390px] h-[910px] bg-white flex flex-col border border-gray-200 rounded-lg overflow-hidden relative">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/profile-edit" element={<ProfileEditPage />} />
            <Route path="/store/:id" element={<StoreDetailPage />} />
            <Route path="/my-reviews" element={<MyReviewPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
