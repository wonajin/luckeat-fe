import { useState } from 'react'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import StoreList from '../components/store/StoreList'
import CategoryList from '../components/store/CategoryList'

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [selectedSort, setSelectedSort] = useState('distance')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)

  const sortOptions = [
    { id: 'distance', label: '가까운 순' },
    { id: 'reviews', label: '리뷰 많은 순' },
    { id: 'shares', label: '공유 많은 순' },
  ]

  const getSortLabel = () => {
    return sortOptions.find((option) => option.id === selectedSort)?.label
  }

  return (
    <>
      <Header />

      {/* 검색바 */}
      <div className="px-4 py-2">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          className="w-full p-2 border rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 카테고리 */}
      <CategoryList />

      {/* 가게 목록 헤더 */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <span>가게 목록</span>
          <label className="flex items-center gap-1 text-blue-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showDiscountOnly}
              onChange={(e) => setShowDiscountOnly(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span>마감할인중인</span>
          </label>
        </div>
        <div className="relative">
          <button
            className="text-sm text-gray-600 flex items-center gap-1"
            onClick={() => setShowSortOptions(!showSortOptions)}
          >
            {getSortLabel()} ▾
          </button>

          {/* 정렬 옵션 드롭다운 */}
          {showSortOptions && (
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 w-32 z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                    selectedSort === option.id
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedSort(option.id)
                    setShowSortOptions(false)
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <StoreList sortBy={selectedSort} showDiscountOnly={showDiscountOnly} />

      <Navigation />

      {/* 드롭다운 외부 클릭 시 닫기 */}
      {showSortOptions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowSortOptions(false)}
        />
      )}
    </>
  )
}

export default HomePage
