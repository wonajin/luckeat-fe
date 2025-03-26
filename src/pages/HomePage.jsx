import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import { getStores } from '../api/storeApi'
import defaultImage from '../assets/images/luckeat-default.png'
import homepageImage from '../assets/images/Homepage_1.png'
import storeDefaultImage from '../assets/images/제빵사디폴트이미지.png'

function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [locationFilter, setLocationFilter] = useState('내 주변')
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [showScrollTopButton, setShowScrollTopButton] = useState(false)
  const [sortOption, setSortOption] = useState('가까운 순')
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [loading, setLoading] = useState(true)
  const sortOptionsRef = useRef(null)
  const storeListRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showArrows, setShowArrows] = useState(false)

  const cardNews = [
    {
      id: 1,
      title: '제주도 빵을',
      description: '사랑하는 모임',
      image: homepageImage,
      link: '/intro',
    },
    {
      id: 2,
      title: '제주도 한정 메뉴',
      description: '제주도에서만 맛볼 수 있는 특별한 빵',
      image: homepageImage,
      link: '/jeju-special',
    },
    {
      id: 3,
      title: '제빵사와 함께하기',
      description: '당신의 빵집을 널리 알려보세요',
      image: homepageImage,
      link: '/partner',
    },
  ]

  const locationOptions = [
    { id: 'nearby', name: '내 주변', icon: '📍' },
    { id: 'jeju-city', name: '제주시', icon: '🏙️' },
    { id: 'seogwipo', name: '서귀포', icon: '🌊' },
    { id: 'aewol', name: '애월', icon: '☕' },
    { id: 'hamdeok', name: '함덕', icon: '🏖️' },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === cardNews.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? cardNews.length - 1 : prev - 1))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const params = {}
        if (showDiscountOnly) {
          params.isDiscountOpen = true
        }

        if (locationFilter !== '내 주변') {
          params.location = locationFilter
        }

        try {
          const storesData = await getStores(params)
          console.log('가게 데이터 API 응답:', storesData)

          const storesList = Array.isArray(storesData)
            ? storesData
            : storesData?.data || []
          console.log('처리된 가게 목록:', storesList)

          setStores(storesList)
          setFilteredStores(storesList)
        } catch (storeError) {
          console.error('가게 데이터 로딩 중 오류:', storeError)
          setStores([])
          setFilteredStores([])
        }

        setLoading(false)
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error)
        setLoading(false)
        setStores([])
        setFilteredStores([])
      }
    }

    fetchData()
  }, [showDiscountOnly, locationFilter])

  console.log('현재 상태 - 로딩:', loading, '데이터:', stores)

  const handleScroll = () => {
    if (storeListRef.current) {
      setShowScrollTopButton(storeListRef.current.scrollTop > 300)
    }
  }

  const scrollToTop = () => {
    if (storeListRef.current) {
      storeListRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

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

  useEffect(() => {
    if (!stores || stores.length === 0) return

    let result = [...stores]
    console.log('필터링 전 가게 수:', result.length)

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((store) => {
        const storeName = store.storeName || store.name || ''
        return storeName.toLowerCase().includes(query)
      })
      console.log('검색 필터링 후 가게 수:', result.length)
    }

    if (sortOption === '가까운 순') {
      result.sort((a, b) => {
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
        const ratingA = a.averageRating || 0
        const ratingB = b.averageRating || 0

        if (ratingB === ratingA) {
          const reviewsA = a.reviewCount || 0
          const reviewsB = b.reviewCount || 0
          return reviewsB - reviewsA
        }

        return ratingB - ratingA
      })
    }

    console.log('정렬 후 최종 가게 수:', result.length)
    setFilteredStores(result)
  }, [searchQuery, sortOption, stores])

  console.log('현재 stores 데이터:', stores)
  console.log('현재 filteredStores 데이터:', filteredStores)

  if (stores && stores.length > 0) {
    console.log('첫 번째 가게 데이터 구조:', stores[0])
    console.log('첫 번째 가게 키:', Object.keys(stores[0]))
  }

  const handleLocationSelect = (location) => {
    setLocationFilter(location)
  }

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

  const handleCardClick = (link) => {
    navigate(link)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b flex justify-center items-center bg-white sticky top-0 z-30">
        <h1
          className="text-2xl font-bold text-yellow-500"
          onClick={() => navigate(0)}
        >
          제빵사
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

      <div className="flex-1 overflow-y-auto" ref={storeListRef} onScroll={handleScroll}>
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

        <div
          className="relative px-4 py-4 border-b"
          onMouseEnter={() => setShowArrows(true)}
          onMouseLeave={() => setShowArrows(false)}
        >
          <div className="relative w-full h-48 overflow-hidden rounded-lg">
            {cardNews.map((card, index) => (
              <div
                key={card.id}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                onClick={() => handleCardClick(card.link)}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 p-5 flex flex-col justify-center items-center">
                  <h1 className="text-white text-3xl font-bold text-center mb-2">
                    {card.title}
                  </h1>
                  <p className="text-white text-xl opacity-90 text-center">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
              {cardNews.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            
            {showArrows && (
              <>
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 rounded-full p-2 z-20 text-white hover:bg-opacity-50 transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevSlide()
                  }}
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 rounded-full p-2 z-20 text-white hover:bg-opacity-50 transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextSlide()
                  }}
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="px-4 py-3 border-b">
          <h3 className="text-base font-medium mb-2">어디로 가시나요?</h3>
          <div className="flex justify-between">
            {locationOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleLocationSelect(option.name)}
                className={`flex flex-col items-center justify-center ${
                  locationFilter === option.name 
                  ? 'text-yellow-600' 
                  : 'text-gray-600'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                  locationFilter === option.name 
                  ? 'bg-yellow-100 border-2 border-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  <span className="text-lg">{option.icon}</span>
                </div>
                <span className="text-xs font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-2 border-b flex justify-between items-center">
          <button
            className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${showDiscountOnly ? 'bg-yellow-100' : 'bg-gray-100'}`}
            onClick={() => setShowDiscountOnly(!showDiscountOnly)}
          >
            <span className="w-4 h-4 inline-flex items-center justify-center mr-1 bg-yellow-400 text-white rounded-full text-xs">
              {showDiscountOnly ? '✓' : ''}
            </span>
            할인중만
          </button>

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

        <div className="px-4 pb-28">
          <div className="py-2">
            <h2 className="font-bold text-lg">
              {locationFilter === '내 주변' ? '내 주변' : locationFilter} 마감 할인 ({filteredStores.length})
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
                    src={storeDefaultImage}
                    alt={store.storeName || store.name || '가게 이미지'}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.src = storeDefaultImage
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
        </div>

        {showScrollTopButton && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 translate-x-28 bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-yellow-600 scroll-container"
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

      <div className="w-full fixed bottom-0 z-30">
        <Navigation />
      </div>
    </div>
  )
}

export default HomePage
