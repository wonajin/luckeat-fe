import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'

function MyPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <h1 className="text-xl font-semibold text-orange-500">마이페이지</h1>
      </div>

      <div className="flex-1 p-4">
        {/* 프로필 섹션 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h2 className="font-medium">사용자 닉네임</h2>
              <p className="text-sm text-gray-500">example@example.com</p>
            </div>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('/profile-edit')}
            className="w-full text-left px-4 py-3 bg-white rounded-lg border hover:bg-gray-50"
          >
            회원정보 수정
          </button>
          <button
            onClick={() => alert('찜한 가게 기능은 준비중입니다.')}
            className="w-full text-left px-4 py-3 bg-white rounded-lg border hover:bg-gray-50"
          >
            내가 찜한 가게
          </button>
          <button
            onClick={() => alert('리뷰 관리 기능은 준비중입니다.')}
            className="w-full text-left px-4 py-3 bg-white rounded-lg border hover:bg-gray-50"
          >
            리뷰 관리
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 bg-white rounded-lg border hover:bg-gray-50 text-red-500"
          >
            로그아웃
          </button>
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default MyPage
