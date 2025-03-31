import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import { getStores } from '../api/storeApi'
import defaultImage from '../assets/images/luckeat-default.png'
import homepageImage from '../assets/images/Homepage_1.png'
import homepageImage2 from '../assets/images/Homepagr_2.png'
import homepageImage3 from '../assets/images/Hompage_2.jpg'
import storeDefaultImage from '../assets/images/제빵사디폴트이미지.png'
import SearchBar from '../components/Search/SearchBar'
import ScrollTopButton from '../components/common/ScrollTopButton'

function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [locationFilter, setLocationFilter] = useState('')
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
  const [displayedStores, setDisplayedStores] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const storesPerPage = 5

  const cardNews = [
    {
      id: 1,
      image: homepageImage,
      link: '/intro',
    },
    {
      id: 2,
      image: homepageImage2,
      link: '/jeju-special',
    },
    {
      id: 3,
      image: homepageImage3,
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

  const handleScroll = useCallback(() => {
    if (!storeListRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = storeListRef.current
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

    if (isNearBottom && !loading && displayedStores.length < filteredStores.length) {
      const nextPage = currentPage + 1
      const startIndex = (nextPage - 1) * storesPerPage
      const endIndex = startIndex + storesPerPage
      const newStores = filteredStores.slice(0, endIndex)
      
      setDisplayedStores(newStores)
      setCurrentPage(nextPage)
    }
  }, [currentPage, loading, filteredStores, displayedStores.length])

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const scrollContainer = storeListRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

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
    }

    if (locationFilter && locationFilter !== '내 주변') {
      result = result.filter((store) => {
        const address = (store.address || '').toLowerCase()
        
        switch(locationFilter) {
          case '제주시':
            return address.includes('제주시')
          case '서귀포':
            return address.includes('서귀포')
          case '애월':
            return address.includes('애월')
          case '함덕':
            return address.includes('함덕')
          default:
            return true
        }
      })
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
        const ratingA = a.avgRatingGoogle || 0
        const ratingB = b.avgRatingGoogle || 0

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
  }, [searchQuery, sortOption, stores, locationFilter])

  // filteredStores가 업데이트될 때마다 표시할 가게 목록 업데이트
  useEffect(() => {
    const initialStores = filteredStores.slice(0, storesPerPage)
    setDisplayedStores(initialStores)
    setCurrentPage(1)
  }, [filteredStores])

  console.log('현재 stores 데이터:', stores)
  console.log('현재 filteredStores 데이터:', filteredStores)

  if (stores && stores.length > 0) {
    console.log('첫 번째 가게 데이터 구조:', stores[0])
    console.log('첫 번째 가게 키:', Object.keys(stores[0]))
  }

  const handleLocationSelect = (location) => {
    setLocationFilter(locationFilter === location ? '' : location)
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
    <div className="flex flex-col h-full relative">
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

      <div className="flex-1 overflow-hidden pb-16" ref={storeListRef} onScroll={handleScroll}>
        <div className="px-4 py-2 border-b">
          <SearchBar 
            initialValue={searchQuery}
            onSearch={setSearchQuery}
          />
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
                <div className="absolute inset-0 p-5 flex flex-col justify-center items-center">
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
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                    locationFilter === option.name
                      ? 'bg-yellow-100 border-2 border-yellow-400' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
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
              {locationFilter === '내 주변' ? '내 주변' : locationFilter || '전체'} 가게 목록 ({filteredStores.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p>로딩 중...</p>
            </div>
          ) : displayedStores && displayedStores.length > 0 ? (
            <>
              {displayedStores.map((store, index) => (
                <div
                  key={store.id || store.storeId || index}
                  className="flex items-center p-3 border rounded-lg mb-3 cursor-pointer"
                  onClick={() => handleStoreClick(store)}
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                    <img
                      src={store.storeImg || storeDefaultImage}
                      alt={store.storeName || store.name || '가게 이미지'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = storeDefaultImage
                      }}
                    />
                  </div>
                  <div className="flex-1 ml-3">
                    <h3 className="font-bold truncate" title={store.storeName || store.name || '이름 없음'}>
                      {(store.storeName || store.name || '이름 없음').length > 20 
                        ? (store.storeName || store.name || '이름 없음').substring(0, 20) + '...'
                        : (store.storeName || store.name || '이름 없음')}
                    </h3>
                    <p className="text-sm text-gray-500 truncate" title={store.address || '주소 정보 없음'}>
                      {(store.address || '주소 정보 없음').length > 20
                        ? (store.address || '주소 정보 없음').substring(0, 20) + '...'
                        : (store.address || '주소 정보 없음')}
                    </p>
                    <div className="flex items-center">
                      <div className="flex items-center text-sm text-yellow-500 mr-2">
                        <span className="mr-1">★</span>
                        <span>
                          {store.avgRatingGoogle
                            ? store.avgRatingGoogle.toFixed(1)
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
              ))}
              {displayedStores.length < filteredStores.length && (
                <div className="flex justify-center items-center py-4">
                  <p className="text-gray-500">더 많은 가게 불러오는 중...</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <p>표시할 가게가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      <ScrollTopButton scrollContainerRef={storeListRef} />

      <div className="w-full bg-white border-t">
        <Navigation />
      </div>

      <style jsx>{`
        /* 스크롤바 숨기기 위한 스타일 */
        .flex-1 {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
          overflow-y: auto;
        }
        .flex-1::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  )
}

export default HomePage
