import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'

function MyPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl mr-4 border border-gray-300 rounded-lg p-1"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold text-yellow-500">Luckeat</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-2xl font-bold text-center my-4">마이페이지</h2>

        {/* 사용자 정보 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="https://via.placeholder.com/100?text=Profile"
                alt="프로필"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold"> 배이맥스님, 혼저서예</h3>
              <p className="text-sm text-gray-500">
                베이맥스님을 기다리는 음식이 있어요!
              </p>
              <div className="flex items-center mt-1">
                <span className="text-yellow-500 font-bold">2</span>
                <span className="ml-1 text-sm text-gray-500">그릇</span>
              </div>
            </div>
          </div>
        </div>

        {/* 메뉴 목록 */}
        <div className="p-4 space-y-4">
          <div className="border-b pb-2">
            <button
              className="w-full text-left font-bold text-gray-700 flex justify-between items-center"
              onClick={() => navigate('/reviews')}
            >
              <span>리뷰 관리</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>

          <div className="border-b pb-2">
            <button
              className="w-full text-left font-bold text-gray-700 flex justify-between items-center"
              onClick={() => navigate('/edit-profile')}
            >
              <span>회원 정보 수정</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>

          <div className="border-b pb-2">
            <button
              className="w-full text-left font-bold text-gray-700 flex justify-between items-center"
              onClick={() => navigate('/login')}
            >
              <span>로그아웃</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>

          <div className="border-b pb-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">고객 문의</span>
              <span className="text-gray-400">luckeat@example.com</span>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 mt-auto">
          <p className="text-center text-sm text-gray-400">
            Copyright @MYRO Corp. All Rights Reserved
          </p>
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default MyPage 