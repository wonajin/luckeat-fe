import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import CategoryList from '../components/store/CategoryList'
import { stores, categories } from '../data/storeData'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'

function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [filteredStores, setFilteredStores] = useState(stores)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showScrollTopButton, setShowScrollTopButton] = useState(false)
  const [sortOption, setSortOption] = useState('가까운 순')
  const [showSortOptions, setShowSortOptions] = useState(false)
  const sortOptionsRef = useRef(null)
  const storeListRef = useRef(null)

  // 스크롤 위치에 따라 상단으로 이동 버튼 표시 여부 결정
  const handleScroll = () => {
    if (storeListRef.current) {
      setShowScrollTopButton(storeListRef.current.scrollTop > 300)
    }
  }

  // 상단으로 스크롤 이동
  const scrollToTop = () => {
    if (storeListRef.current) {
      storeListRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  // 정렬 옵션 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sortOptionsRef.current &&
        !sortOptionsRef.current.contains(event.target)
      ) {
        setShowSortOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 검색어, 할인 필터, 카테고리가 변경될 때 가게 목록 필터링
  useEffect(() => {
    let result = [...stores]

    // 카테고리 필터링
    if (selectedCategory) {
      result = result.filter((store) => store.category === selectedCategory)
    }

    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (store) =>
          store.name.toLowerCase().includes(query) ||
          store.products.some((product) =>
            product.name.toLowerCase().includes(query),
          ),
      )
    }

    // 할인 필터링
    if (showDiscountOnly) {
      // 할인 상품이 있는 가게만 필터링
      result = result.filter((store) =>
        store.products.some((product) => !product.isSoldOut),
      )
    }

    // 정렬 옵션 적용
    if (sortOption === '가까운 순') {
      result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    } else if (sortOption === '리뷰 많은 순') {
      result.sort((a, b) => b.reviews.length - a.reviews.length)
    } else if (sortOption === '공유 많은 순') {
      // 실제 구현에서는 공유 수에 따라 정렬
      // 현재는 임의로 ID 기준으로 정렬
      result.sort((a, b) => a.id - b.id)
    }

    setFilteredStores(result)
  }, [searchQuery, showDiscountOnly, selectedCategory, sortOption])

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b flex justify-center items-center bg-white sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-yellow-500">Luckeat</h1>
        <div className="absolute right-4 text-sm">
          <div className="flex space-x-2">
            <button
              className="text-gray-700"
              onClick={() => navigate('/login')}
            >
              로그인
            </button>
            <span className="text-gray-300">|</span>
            <button
              className="text-gray-700"
              onClick={() => navigate('/signup')}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>

      {/* 검색창 */}
      <div className="px-4 py-2 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="가게 이름, 메뉴 검색"
            className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 카테고리 */}
      <div className="border-b">
        <CategoryList
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* 필터링 및 정렬 옵션 */}
      <div className="px-4 py-2 border-b flex justify-between items-center">
        <div className="flex items-center">
          <button
            className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center mr-2 ${showDiscountOnly ? 'bg-yellow-100' : 'bg-gray-100'}`}
            onClick={() => setShowDiscountOnly(!showDiscountOnly)}
          >
            <span className="w-4 h-4 inline-flex items-center justify-center mr-1 bg-yellow-400 text-white rounded-full text-xs">
              {showDiscountOnly ? '✓' : ''}
            </span>
            할인중만
          </button>
        </div>

        {/* 정렬 옵션 */}
        <div className="relative" ref={sortOptionsRef}>
          <button
            className="text-sm text-gray-500 flex items-center"
            onClick={() => setShowSortOptions(!showSortOptions)}
          >
            <span>{sortOption}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showSortOptions && (
            <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-10">
              <div className="py-1">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${sortOption === '가까운 순' ? 'bg-gray-100 font-bold' : ''}`}
                  onClick={() => {
                    setSortOption('가까운 순')
                    setShowSortOptions(false)
                  }}
                >
                  가까운 순
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${sortOption === '리뷰 많은 순' ? 'bg-gray-100 font-bold' : ''}`}
                  onClick={() => {
                    setSortOption('리뷰 많은 순')
                    setShowSortOptions(false)
                  }}
                >
                  리뷰 많은 순
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${sortOption === '공유 많은 순' ? 'bg-gray-100 font-bold' : ''}`}
                  onClick={() => {
                    setSortOption('공유 많은 순')
                    setShowSortOptions(false)
                  }}
                >
                  공유 많은 순
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 가게 목록 */}
      <div
        ref={storeListRef}
        className="flex-1 overflow-y-auto px-4 pb-20 scroll-container scrollbar-hide"
        onScroll={handleScroll}
      >
        <div className="py-2">
          <h2 className="font-bold text-lg">
            내 주변 마감 할인 ({filteredStores.length})
          </h2>
        </div>

        {filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <div
              key={store.id}
              className="flex items-center p-3 border rounded-lg mb-3"
              onClick={() => navigate(`/store/${store.id}`)}
            >
              <div className="w-16 h-16 bg-gray-200 rounded-md mr-3">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{store.name}</h3>
                <p className="text-sm text-gray-500">{store.distance}</p>
                <p className="text-sm text-gray-700 font-bold">
                  {store.discount} 할인
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}

        {/* 맨 위로 스크롤 버튼 */}
        {showScrollTopButton && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 translate-x-28 bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-yellow-600 scro ll-container"
            aria-label="맨 위로 스크롤"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 네비게이션 바 */}
      <Navigation />
    </div>
  )
}

export default HomePage
