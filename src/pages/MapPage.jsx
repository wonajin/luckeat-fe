import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'

function MapPage() {
  const navigate = useNavigate()
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="text-2xl mr-4"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold text-orange-500">Luckeat</h1>
      </div>

      {/* 카테고리 스크롤 */}
      <div className="border-b overflow-x-auto">
        <div className="flex px-4 py-2 whitespace-nowrap">
          <button className="px-3 py-1 text-sm">전체</button>
          <button className="px-3 py-1 text-sm">한식</button>
          <button className="px-3 py-1 text-sm">정육</button>
          <button className="px-3 py-1 text-sm">수산</button>
          <button className="px-3 py-1 text-sm">분식</button>
          <button className="px-3 py-1 text-sm">야채/과일</button>
        </div>
      </div>

      {/* 검색바 */}
      <div className="px-4 py-2">
        <div className="relative">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="w-full p-2 pr-10 border rounded-lg"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </button>
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 relative bg-gray-100">
        {/* 지도가 들어갈 자리 */}
        <div className="absolute inset-0">
          {/* 실제 지도는 나중에 구현 */}
        </div>

        {/* 마감 할인 필터 */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <button 
            className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
              showDiscountOnly 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border'
            }`}
            onClick={() => setShowDiscountOnly(!showDiscountOnly)}
          >
            <span>마감 할인중만</span>
            {showDiscountOnly && <span>✓</span>}
          </button>
        </div>

        {/* 확대/축소 버튼 */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <button className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center">
            +
          </button>
          <button className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center">
            -
          </button>
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default MapPage 