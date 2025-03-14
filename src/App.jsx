import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MyPage from './pages/MyPage'
import StoreDetailPage from './pages/StoreDetailPage'
import EditProfilePage from './pages/EditProfilePage'
import ReviewManagementPage from './pages/ReviewManagementPage'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="w-[390px] h-[910px] bg-white flex flex-col border border-gray-200 rounded-lg overflow-hidden relative">
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
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
