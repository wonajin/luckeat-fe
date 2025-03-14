import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import Header from '../components/layout/Header'
import { stores } from '../data/storeData'
import CategoryList from '../components/store/CategoryList'

function MapPage() {
  const navigate = useNavigate()
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [filteredStores, setFilteredStores] = useState(stores)
  const [selectedCategory, setSelectedCategory] = useState('전체')

  // 할인 필터와 카테고리 변경 시 가게 목록 필터링
  useEffect(() => {
    let result = [...stores]
    
    if (showDiscountOnly) {
      result = result.filter((store) =>
        store.products.some((product) => !product.isSoldOut),
      )
    }
    
    if (selectedCategory !== '전체') {
      result = result.filter((store) => store.category === selectedCategory)
    }
    
    setFilteredStores(result)
  }, [showDiscountOnly, selectedCategory])

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <Header title="지도" />

      {/* 카테고리 */}
      <div className="border-b">
        <CategoryList
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
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
      <div className="flex-1 relative bg-gray-100 overflow-hidden">
        {/* 지도가 들어갈 자리 */}
        <div className="absolute inset-0 h-2/3">{/* 실제 지도는 나중에 구현 */}</div>

        {/* 마감 할인 필터 */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <button
            className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
              showDiscountOnly
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-700 border'
            }`}
            onClick={() => setShowDiscountOnly(!showDiscountOnly)}
          >
            <span>마감 할인중만</span>
            {showDiscountOnly && <span>✓</span>}
          </button>
        </div>

        {/* 확대/축소 버튼 */}
        <div className="absolute right-4 top-1/3 -translate-y-1/2 flex flex-col gap-2">
          <button className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center">
            +
          </button>
          <button className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center">
            -
          </button>
        </div>

        {/* 가게 목록 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white rounded-t-2xl shadow-lg overflow-y-auto">
          <div className="p-4">
            <h3 className="font-bold mb-2">주변 가게 ({filteredStores.length})</h3>
            <div className="space-y-3">
              {filteredStores.slice(0, 3).map((store) => (
                <div
                  key={store.id}
                  className="flex items-center p-2 border rounded-lg"
                  onClick={() => navigate(`/store/${store.id}`)}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-md mr-3">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{store.name}</h4>
                    <p className="text-xs text-gray-500">{store.distance}</p>
                    <p className="text-xs text-gray-700 font-bold">
                      {store.discount} 할인
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default MapPage
