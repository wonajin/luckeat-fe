import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import CategoryList from '../components/store/CategoryList'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import { getStores } from '../api/storeApi'
import { getCategories } from '../api/categoryApi'
import defaultImage from '../assets/images/luckeat-default.png'

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
        console.log('카테고리 API 응답:', categoriesData)

        // 응답 구조 확인 및 로그
        const categoriesList = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData?.data || []

        console.log('처리된 카테고리 목록:', categoriesList)
        setCategories(categoriesList)

        // 가게 데이터 가져오기 - 필터 파라미터 적용
        const params = {}
        // 할인중인 가게만 보여주기 옵션이 선택된 경우 API 파라미터 추가
        if (showDiscountOnly) {
          params.isDiscountOpen = true
        }

        // API 호출 시 오류 처리 추가
        try {
          const storesData = await getStores(params)
          console.log('가게 데이터 API 응답:', storesData)

          // 데이터 구조 확인 후 적절히 설정
          const storesList = Array.isArray(storesData)
            ? storesData
            : storesData?.data || []
          console.log('처리된 가게 목록:', storesList)

          setStores(storesList)
          setFilteredStores(storesList)
        } catch (storeError) {
          console.error('가게 데이터 로딩 중 오류:', storeError)
          // 오류가 발생해도 빈 배열로 설정하여 UI가 깨지지 않도록 함
          setStores([])
          setFilteredStores([])
        }

        setLoading(false)
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error)
        setLoading(false)
        // 오류 발생 시 빈 배열로 초기화
        setStores([])
        setFilteredStores([])
      }
    }

    fetchData()
  }, [showDiscountOnly]) // showDiscountOnly 변경 시 데이터 다시 가져오기

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
    console.log('필터링 전 가게 수:', result.length)
    console.log('선택된 카테고리:', selectedCategory)

    // 카테고리 필터링 - 백엔드 API 응답 구조에 맞게 수정
    if (selectedCategory) {
      result = result.filter((store) => {
        // categoryId를 비교 (API 응답 구조에 맞게 수정)
        return store.categoryId === selectedCategory
      })
      console.log('카테고리 필터링 후 가게 수:', result.length)
    }

    // 검색어 필터링 - 필드명 확인 필요
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((store) => {
        const storeName = store.storeName || store.name || ''
        return storeName.toLowerCase().includes(query)
      })
      console.log('검색 필터링 후 가게 수:', result.length)
    }

    // 할인 필터링은 API에서 처리하므로 여기서는 제거
    // 이미 showDiscountOnly 변경 시 useEffect를 통해 API 요청이 다시 이루어짐

    // 정렬 옵션 적용
    if (sortOption === '가까운 순') {
      result.sort((a, b) => {
        // distance가 문자열 형식이면(예: "0.5km") 숫자로 변환
        const distanceA =
          typeof a.distance === 'string'
            ? parseFloat(a.distance.replace(/[^0-9.]/g, ''))
            : parseFloat(a.distance || 0)
        const distanceB =
          typeof b.distance === 'string'
            ? parseFloat(b.distance.replace(/[^0-9.]/g, ''))
            : parseFloat(b.distance || 0)
        return distanceA - distanceB
      })
    } else if (sortOption === '리뷰 많은 순') {
      result.sort((a, b) => {
        const reviewsA = a.reviewCount || 0
        const reviewsB = b.reviewCount || 0
        return reviewsB - reviewsA
      })
    } else if (sortOption === '공유 많은 순') {
      result.sort((a, b) => {
        const shareCountA = a.shareCount || 0
        const shareCountB = b.shareCount || 0
        return shareCountB - shareCountA
      })
    } else if (sortOption === '별점 높은 순') {
      result.sort((a, b) => {
        // API에서 받아온 averageRating 사용
        const ratingA = a.averageRating || 0
        const ratingB = b.averageRating || 0

        // 별점이 같으면 리뷰 수가 많은 순으로 정렬
        if (ratingB === ratingA) {
          const reviewsA = a.reviewCount || 0
          const reviewsB = b.reviewCount || 0
          return reviewsB - reviewsA
        }

        return ratingB - ratingA // 별점 높은 순으로 내림차순 정렬
      })
    }

    console.log('정렬 후 최종 가게 수:', result.length)
    setFilteredStores(result)
  }, [searchQuery, selectedCategory, sortOption, stores]) // showDiscountOnly 제거

  console.log('현재 stores 데이터:', stores)
  console.log('현재 filteredStores 데이터:', filteredStores)

  // 첫 번째 가게 항목의 구조 확인 (있는 경우)
  if (stores && stores.length > 0) {
    console.log('첫 번째 가게 데이터 구조:', stores[0])
    console.log('첫 번째 가게 키:', Object.keys(stores[0]))
  }

  // 카테고리 핸들러
  const handleCategorySelect = (category) => {
    console.log('카테고리 선택:', category)
    setSelectedCategory(category === selectedCategory ? '' : category)
  }

  // HomePage.jsx 파일에서 가게 카드 클릭 핸들러 추가
  const handleStoreClick = (store) => {
    console.log('가게 선택:', store)
    const storeId = store.id || store.storeId

    if (!storeId) {
      console.error('가게 ID가 없습니다:', store)
      return
    }

    console.log(`가게 상세 페이지로 이동: /store/${storeId}`)
    navigate(`/store/${storeId}`)
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
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
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
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${sortOption === '별점 높은 순' ? 'bg-gray-100 font-bold' : ''}`}
                  onClick={() => {
                    setSortOption('별점 높은 순')
                    setShowSortOptions(false)
                  }}
                >
                  별점 높은 순
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

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p>로딩 중...</p>
          </div>
        ) : filteredStores && filteredStores.length > 0 ? (
          filteredStores.map((store, index) => (
            <div
              key={store.id || store.storeId || index}
              className="flex items-center p-3 border rounded-lg mb-3 cursor-pointer"
              onClick={() => handleStoreClick(store)}
            >
              <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                <img
                  src={defaultImage}
                  alt={store.storeName || store.name || '가게 이미지'}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.src = defaultImage
                  }}
                />
              </div>
              <div className="flex-1 ml-3">
                <h3 className="font-bold">
                  {store.storeName || store.name || '이름 없음'}
                </h3>
                <p className="text-sm text-gray-500">
                  {store.address || '주소 정보 없음'}
                </p>
                <div className="flex items-center">
                  {/* 별점 표시 */}
                  <div className="flex items-center text-sm text-yellow-500 mr-2">
                    <span className="mr-1">★</span>
                    <span>
                      {store.averageRating
                        ? store.averageRating.toFixed(1)
                        : '0.0'}
                    </span>
                    <span className="text-gray-500 ml-1">
                      ({store.reviewCount || 0})
                    </span>
                  </div>
                  {/* 공유 수 표시 */}
                  <p className="text-sm font-medium">
                    공유 {store.shareCount || 0}회
                  </p>
                </div>
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
