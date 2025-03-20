import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import CategoryList from '../components/store/CategoryList'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import { getStores } from '../api/storeApi'
import { getCategories } from '../api/categoryApi'

function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [stores, setStores] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showScrollTopButton, setShowScrollTopButton] = useState(false)
  const [sortOption, setSortOption] = useState('가까운 순')
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [loading, setLoading] = useState(true)
  const sortOptionsRef = useRef(null)
  const storeListRef = useRef(null)

  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 카테고리 데이터 가져오기
        const categoriesData = await getCategories()
        console.log('카테고리 데이터:', categoriesData)
        // 배열이 아닌 경우 대비
        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData?.data || [],
        )

        // 가게 데이터 가져오기
        const storesData = await getStores()
        console.log('가게 데이터:', storesData)

        // 데이터 구조 확인 후 적절히 설정
        const storesList = Array.isArray(storesData)
          ? storesData
          : storesData?.data || []
        console.log('처리된 가게 목록:', storesList)

        setStores(storesList)
        setFilteredStores(storesList)
        setLoading(false)
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 로딩 및 데이터 상태 디버깅
  console.log('현재 상태 - 로딩:', loading, '데이터:', stores)

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
    if (!stores || stores.length === 0) return

    let result = [...stores]

    // 카테고리 필터링 - API 데이터 구조에 맞게 수정
    if (selectedCategory) {
      result = result.filter((store) => {
        // categoryId 또는 category 필드 검사
        const storeCategory = store.categoryId || store.category
        return String(storeCategory) === String(selectedCategory)
      })
    }

    // 검색어 필터링 - 필드명 확인 필요
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((store) => {
        const storeName = store.storeName || store.name || ''
        return storeName.toLowerCase().includes(query)
      })
    }

    // 할인 필터링
    if (showDiscountOnly) {
      // 할인 상품이 있는 가게만 필터링
      result = result.filter(
        (store) =>
          store.products &&
          store.products.some((product) => !product.isSoldOut),
      )
    }

    // 정렬 옵션 적용
    if (sortOption === '가까운 순') {
      result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    } else if (sortOption === '리뷰 많은 순') {
      result.sort(
        (a, b) =>
          (b.reviews ? b.reviews.length : 0) -
          (a.reviews ? a.reviews.length : 0),
      )
    } else if (sortOption === '공유 많은 순') {
      // 실제 구현에서는 공유 수에 따라 정렬
      result.sort((a, b) => (b.shareCount || 0) - (a.shareCount || 0))
    }

    setFilteredStores(result)
  }, [searchQuery, showDiscountOnly, selectedCategory, sortOption, stores])

  console.log('현재 stores 데이터:', stores)
  console.log('현재 filteredStores 데이터:', filteredStores)

  // 첫 번째 가게 항목의 구조 확인 (있는 경우)
  if (stores && stores.length > 0) {
    console.log('첫 번째 가게 데이터 구조:', stores[0])
    console.log('첫 번째 가게 키:', Object.keys(stores[0]))
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b flex justify-center items-center bg-white sticky top-0 z-20">
        <h1
          className="text-2xl font-bold text-yellow-500"
          onClick={() => navigate(0)}
        >
          Luckeat
        </h1>
        <div className="absolute right-4 text-sm">
          {isLoggedIn ? (
            <div className="flex space-x-2">
              <button
                className="text-gray-700"
                onClick={async () => {
                  await logout()
                  navigate(0)
                }}
              >
                로그아웃
              </button>
            </div>
          ) : (
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
          )}
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
          <p>
            데이터 상태:{' '}
            {loading
              ? '로딩 중'
              : `${Array.isArray(stores) ? '배열' : '배열 아님'}, 길이: ${stores?.length || 0}`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p>로딩 중...</p>
          </div>
        ) : filteredStores && filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <div
              key={store.id}
              className="flex items-center p-3 border rounded-lg mb-3"
              onClick={() => navigate(`/store/${store.id}`)}
            >
              <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                <img
                  src="https://dxflvza4ey8e9.cloudfront.net/store/luckeat-default.png"
                  alt={store.storeName || '가게 이미지'}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.src =
                      'https://dxflvza4ey8e9.cloudfront.net/store/luckeat-default.png'
                  }}
                />
              </div>
              <div className="flex-1 ml-3">
                <h3 className="font-bold">{store.storeName || '이름 없음'}</h3>
                <p className="text-sm text-gray-500">
                  {store.address || '주소 정보 없음'}
                </p>
                <p className="text-sm font-medium">
                  공유 {store.shareCount || 0}회
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <p>표시할 가게가 없습니다.</p>
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
