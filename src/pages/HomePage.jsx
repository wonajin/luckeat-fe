import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import { getStores } from '../api/storeApi'
import defaultImage from '../assets/images/luckeat-default.png'
import banner01 from '../assets/images/럭킷배너01.png'
import banner02 from '../assets/images/럭킷배너02.png'
import banner03 from '../assets/images/럭킷배너03.png'
import storeDefaultImage from '../assets/images/luckeat_default_image.webp'
import luckeatLogo from '../assets/images/luckeat-logo.png'
import SearchBar from '../components/Search/SearchBar'
import ScrollTopButton from '../components/common/ScrollTopButton'
import { API_BASE_URL } from '../config/apiConfig'
import { debounce } from 'lodash'

function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDiscountOnly, setShowDiscountOnly] = useState(() => {
    const saved = sessionStorage.getItem('showDiscountOnly')
    return saved ? JSON.parse(saved) : false
  })
  const [categoryFilter, setCategoryFilter] = useState(() => {
    const saved = sessionStorage.getItem('categoryFilter')
    return saved || '전체'
  })
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [showScrollTopButton, setShowScrollTopButton] = useState(false)
  const [sortOption, setSortOption] = useState(() => {
    const saved = sessionStorage.getItem('sortOption')
    return saved || '공유 많은 순'
  })
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const sortOptionsRef = useRef(null)
  const storeListRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showArrows, setShowArrows] = useState(false)
  const [displayedStores, setDisplayedStores] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const storesPerPage = 10 // 한 번에 로드할 가게 수 증가
  const [hasMore, setHasMore] = useState(true) // 더 로드할 데이터 여부
  const [totalStoreCount, setTotalStoreCount] = useState(0) // 전체 가게 수 추가
  const [autoSlide, setAutoSlide] = useState(true)
  const autoSlideInterval = useRef(null)
  const [slideDirection, setSlideDirection] = useState('right')
  const [userLocation, setUserLocation] = useState(() => {
    // 세션스토리지에서 사용자 위치 정보 불러오기
    const savedLocation = sessionStorage.getItem('userLocation')
    if (savedLocation) {
      return JSON.parse(savedLocation)
    }
    // 기본값 (제주 구름스퀘어)
    return {
      lat: 33.4996,
      lng: 126.5302,
    }
  })
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(() => {
    const saved = sessionStorage.getItem('locationPermissionRequested')
    return saved ? JSON.parse(saved) : false
  })
  const [showLocationModal, setShowLocationModal] = useState(false)

  const cardNews = [
    {
      id: 1,
      image: banner01,
      /*페이지 추후 추가 후 연결
      link: '/intro',*/
    },
    {
      id: 2,
      image: banner02,
      /*페이지 추후 추가 후 연결
      link: '/jeju-special',*/
    },
    {
      id: 3,
      image: banner03,
      /*페이지 추후 추가 후 연결
       link: '/partner',*/
    },
  ]
 // 카테고리 옵션 추가
  const categoryOptions = [
    { id: 'all', name: '전체', icon: '🔍' },
    { id: 1, name: '한식', icon: '🍚' },
    { id: 4, name: '일식', icon: '🍱' },
    { id: 2, name: '중식', icon: '🥢' },
    { id: 3, name: '양식', icon: '🍝' },
    { id: 5, name: '카페/베이커리', icon: '🍞' },
    { id: 6, name: '샐러드/청과', icon: '🥗' },
  ]

  const nextSlide = useCallback(() => {
    setSlideDirection('right')
    setCurrentSlide((prev) => (prev === cardNews.length - 1 ? 0 : prev + 1))
  }, [cardNews.length])

  const prevSlide = useCallback(() => {
    setSlideDirection('left')
    setCurrentSlide((prev) => (prev === 0 ? cardNews.length - 1 : prev - 1))
  }, [cardNews.length])

  // 자동 슬라이드 설정
  useEffect(() => {
    if (autoSlide) {
      autoSlideInterval.current = setInterval(nextSlide, 5000) // 5초마다 다음 슬라이드로
    }
    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current)
      }
    }
  }, [autoSlide, nextSlide])

  // 마우스 호버 시 자동 슬라이드 일시 정지
  const handleMouseEnter = () => {
    setShowArrows(true)
    setAutoSlide(false)
  }

  const handleMouseLeave = () => {
    setShowArrows(false)
    setAutoSlide(true)
  }

  // 주소에서 '대한민국' 제거하는 함수
  const simplifyAddress = (address) => {
    if (!address) return '주소 정보 없음'
    // "대한민국" 제거
    let simplified = address.replace(/^대한민국\s+/, '')
    // 20자 제한 (20자가 넘으면 "..." 표시)
    if (simplified.length > 20) {
      simplified = simplified.substring(0, 20) + '...'
    }
    return simplified
  }

  // 위치 권한 동의 처리
  const handleLocationPermissionAgree = () => {
    setShowLocationModal(false);
    // 먼저 상태 업데이트
    setSortOption('가까운 순');
    sessionStorage.setItem('sortOption', '가까운 순');
    setLocationPermissionRequested(true);
    sessionStorage.setItem('locationPermissionRequested', JSON.stringify(true));
    // 그 다음 위치 정보 가져오기
    getUserLocation();
  };

  // 사용자 위치 가져오기 - 이제 자동으로 실행되지 않음
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          // 위치 정보 저장
          setUserLocation(newLocation)
          // 위치 정보를 세션스토리지에 저장
          sessionStorage.setItem('userLocation', JSON.stringify(newLocation))
          
          // 위치 권한 획득 후 바로 가까운 순으로 정렬된 데이터 가져오기
          fetchStores(0, true)
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error)
          alert('위치 정보 접근에 실패했습니다. 기본 위치를 사용합니다.')
          // 위치 권한 거부 시에도 가까운 순으로 정렬된 데이터 가져오기 (기본 위치 사용)
          fetchStores(0, true)
        },
        { enableHighAccuracy: true }
      )
    } else {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다. 기본 위치를 사용합니다.')
      fetchStores(0, true)
    }
  }

  // 정렬 옵션 변경 핸들러
  const handleSortOptionChange = (option) => {
    // 가까운 순 선택 시 위치 권한이 필요함
    if (option === '가까운 순' && !locationPermissionRequested) {
      // 가까운 순 선택 시 위치 권한 요청을 위한 모달 표시
      //setShowLocationModal(true);
      handleLocationPermissionAgree();
      return;
    }
    
    // 변경된 옵션을 저장하고 세션스토리지에도 저장
    setSortOption(option);
    sessionStorage.setItem('sortOption', option);
    setShowSortOptions(false);
  };

  // 위치 권한 거부 처리
  const handleLocationPermissionDecline = () => {
    setShowLocationModal(false)
    // 기본 옵션으로 돌아가기
    setSortOption('공유 많은 순')
    sessionStorage.setItem('sortOption', '공유 많은 순')
  }

  // 서버에서 페이지별로 데이터 가져오기
  const fetchStores = useCallback(async (page = 0, reset = false) => {
    try {
      if (page === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // API_BASE_URL 사용
      let url = `${API_BASE_URL}/stores`
      let queryParams = new URLSearchParams()

      // 페이지네이션 파라미터 추가
      queryParams.append('page', page)
      queryParams.append('size', storesPerPage)

      // 필터 1: 할인 중인 가게만 보기
      if (showDiscountOnly) {
        queryParams.append('isDiscountOpen', true)
      }

      // 필터 2: 카테고리 필터링
      if (categoryFilter && categoryFilter !== '전체') {
        const category = categoryOptions.find(opt => opt.name === categoryFilter)
        if (category && category.id !== 'all') {
          queryParams.append('categoryId', category.id)
        }
      }

      // 검색어 필터링
      if (searchQuery) {
        queryParams.append('storeName', searchQuery)
      }

      // 필터 3: 정렬 옵션 (4가지 중 하나만 선택 가능)
      let sort = ''
      
      switch (sortOption) {
        case '가까운 순':
          sort = 'distance'
          // 가까운 순 정렬일 때만 위치 정보 추가
          queryParams.append('lat', userLocation.lat)
          queryParams.append('lng', userLocation.lng)
          break
        case '리뷰 많은 순':
          sort = 'review'
          break
        case '공유 많은 순':
          sort = 'share'
          break
        case '별점 높은 순':
          sort = 'rating'
          break
        default:
          sort = 'distance'
          // 기본 정렬(가까운 순)일 때도 위치 정보 추가
          queryParams.append('lat', userLocation.lat)
          queryParams.append('lng', userLocation.lng)
          break
      }
      
      // 정렬 파라미터 추가
      queryParams.append('sort', sort)
      
      // 쿼리 파라미터가 있으면 URL에 추가
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
      }

      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API 응답 오류: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 새로운 페이지네이션 응답 형식 처리
        if (!data || !data.content) {
          if (page === 0) {
            setStores([])
            setDisplayedStores([])
            setFilteredStores([])
            setTotalStoreCount(0)
          }
          setHasMore(false)
          return
        }

        const newStores = data.content
        
        // 전체 가게 수 업데이트 (페이지 0일 때만 또는 리셋 시)
        if (page === 0 || reset) {
          setTotalStoreCount(data.totalElements || 0)
        }
        
        setHasMore(!data.last) // 마지막 페이지가 아니면 더 로드할 수 있음
        
        // 페이지가 0이거나 reset이 true면 데이터 초기화
        if (page === 0 || reset) {
          setStores(newStores)
          setDisplayedStores(newStores)
          setFilteredStores(newStores)
        } else {
          // 기존 데이터에 새로운 데이터 추가
          setStores(prev => [...prev, ...newStores])
          setDisplayedStores(prev => [...prev, ...newStores])
          setFilteredStores(prev => [...prev, ...newStores])
        }

        setCurrentPage(page)
      } catch (error) {
        // 오류 발생 시 조용히 처리하고 사용자에게 오류 메시지 표시
        if (page === 0) {
          setStores([])
          setDisplayedStores([])
          setFilteredStores([])
          setTotalStoreCount(0)
        }
        setHasMore(false)
      }
    } catch (error) {
      // 전체 오류 처리
      if (page === 0) {
        setStores([])
        setDisplayedStores([])
        setFilteredStores([])
        setTotalStoreCount(0)
      }
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [showDiscountOnly, categoryFilter, searchQuery, sortOption, storesPerPage, API_BASE_URL, userLocation])

  // 초기 데이터 로드 및 필터 변경 시 데이터 다시 로드
  useEffect(() => {
    // 필터가 변경되면 페이지를 0로 초기화하고 데이터 다시 로드
    setCurrentPage(0) // 페이지 리셋
    setDisplayedStores([]) // 표시된 가게 초기화
    setStores([]) // 저장된 가게 초기화
    setFilteredStores([]) // 필터링된 가게도 초기화
    setHasMore(true) // 더 불러올 데이터가 있다고 가정
    
    // 가까운 순이면서 위치 권한이 아직 없는 경우 데이터를 가져오지 않음
    if (sortOption === '가까운 순' && !locationPermissionRequested) {
      return
    }
    
    fetchStores(0, true)
  }, [fetchStores, showDiscountOnly, categoryFilter, searchQuery, sortOption])

  // 스크롤 이벤트 핸들러 최적화 (디바운싱 적용)
  const handleScroll = useCallback(() => {
    if (!storeListRef.current || loading || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = storeListRef.current;
    
    // 스크롤이 하단에 도달했는지 확인 (약간의 버퍼 추가)
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      fetchStores(currentPage + 1);
    }
  }, [currentPage, loading, loadingMore, hasMore, fetchStores]);

  // 스크롤 이벤트 리스너 등록 (디바운싱 적용)
  useEffect(() => {
    const scrollContainer = storeListRef.current;
    if (!scrollContainer) return;

    let timer;
    const debouncedHandleScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleScroll();
      }, 100); // 100ms 디바운싱
    };

    scrollContainer.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      clearTimeout(timer);
      scrollContainer.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [handleScroll]);

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

  const handleCategorySelect = (category) => {
    // "전체" 카테고리 처리
    if (category === '전체') {
      setCategoryFilter('전체')
      sessionStorage.setItem('categoryFilter', '전체')
      setSearchQuery('') // 검색어 초기화 추가
      return
    }
    
    // 이미 선택된 카테고리를 다시 클릭하면 해제하고 전체로 돌아감
    if (categoryFilter === category) {
      setCategoryFilter('전체')
      sessionStorage.setItem('categoryFilter', '전체')
      setSearchQuery('') // 검색어 초기화 추가
    } else {
      setCategoryFilter(category)
      sessionStorage.setItem('categoryFilter', category)
    }
  }

  const handleStoreClick = (store) => {
    const storeId = store.id || store.storeId

    if (!storeId) {
      return
    }

    navigate(`/store/${storeId}`)
  }

  const handleCardClick = (link) => {
    navigate(link)
  }

  // 검색 디바운스 함수 생성 (300ms 지연)
  const debouncedSearch = useRef(
    debounce((query) => {
      setSearchQuery(query)
      
      // 검색어가 비었을 때 (사용자가 검색어를 지웠을 때)
      if (!query || query.trim() === '') {
        setSearchQuery('')
        // 모든 필터링 조건을 초기화하고 데이터를 다시 로드
        setCurrentPage(0)
        setHasMore(true)
        fetchStores(0, true)
        return
      }
      
      // 검색어가 변경되면 백엔드 API를 통해 결과를 가져옵니다
      setCurrentPage(0)
      setHasMore(true)
      // fetchStores가 useEffect를 통해 자동으로 호출됩니다
    }, 300)
  ).current

  const handleSearch = (query) => {
    // 디바운스 함수 호출
    debouncedSearch(query)
  }

  // 컴포넌트 언마운트 시 디바운스 취소
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  // 할인중만 토글 핸들러 추가
  const toggleDiscountOnly = () => {
    const newValue = !showDiscountOnly;
    setShowDiscountOnly(newValue);
    sessionStorage.setItem('showDiscountOnly', JSON.stringify(newValue));
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-4 py-3 border-b flex justify-center items-center bg-white sticky top-0 z-30">
        <h1
          className="text-2xl font-bold text-yellow-500"
          onClick={() => {
            setCategoryFilter('전체');
            sessionStorage.setItem('categoryFilter', '전체');
            setSearchQuery('');
            setShowDiscountOnly(false);
            sessionStorage.setItem('showDiscountOnly', JSON.stringify(false));
            setSortOption('가까운 순');
            sessionStorage.setItem('sortOption', '가까운 순');
            navigate(0);
          }}
        >
          <img src={luckeatLogo} alt="럭킷" className="h-6" />
        </h1>
        <div className="absolute right-4 text-sm">
          {isLoggedIn ? (
            <div className="flex space-x-2">
              <button
                className="text-xs text-gray-700"
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
                className="text-xs text-gray-700"
                onClick={() => navigate('/login')}
              >
                로그인
              </button>
              <span className="text-gray-300">|</span>
              <button
                className="text-xs text-gray-700"
                onClick={() => navigate('/signup')}
              >
                회원가입
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex-1 overflow-hidden pb-16"
        ref={storeListRef}
        onScroll={handleScroll}
      >
        <div className="px-4 py-2 border-b">
          <SearchBar initialValue={searchQuery} onSearch={handleSearch} />
        </div>

        <div
          className="relative px-4 py-4 border-b"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative w-full h-48 overflow-hidden rounded-lg">
            {cardNews.map((card, index) => (
              <div
                key={card.id}
                className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out transform ${
                  index === currentSlide
                    ? 'translate-x-0 opacity-100 z-10'
                    : slideDirection === 'right'
                      ? index ===
                        (currentSlide === 0
                          ? cardNews.length - 1
                          : currentSlide - 1)
                        ? '-translate-x-full opacity-0 z-0'
                        : 'translate-x-full opacity-0 z-0'
                      : index ===
                          (currentSlide === cardNews.length - 1
                            ? 0
                            : currentSlide + 1)
                        ? 'translate-x-full opacity-0 z-0'
                        : '-translate-x-full opacity-0 z-0'
                }`}
                onClick={() => handleCardClick(card.link)}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  loading="lazy" // 이미지 지연 로딩
                />
              </div>
            ))}

            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
              {cardNews.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentSlide
                      ? 'bg-white'
                      : 'bg-white bg-opacity-50'
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
          <h3 className="text-base font-medium mb-2">
            어떤 음식을 찾으시나요?
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between gap-1">
              {categoryOptions.slice(0, 4).map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleCategorySelect(option.name)}
                  className={`px-2 py-2 rounded-full flex items-center justify-center gap-1 ${
                    categoryFilter === option.name
                      ? 'bg-yellow-400 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                  style={{ 
                    minWidth: '80px',
                    width: '80px'
                  }}
                >
                  <span>{option.icon}</span>
                  <span className="text-sm font-medium">{option.name}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between gap-1">
              {categoryOptions.slice(4).map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleCategorySelect(option.name)}
                  className={`px-2 py-2 rounded-full flex items-center justify-center gap-1 ${
                    categoryFilter === option.name
                      ? 'bg-yellow-400 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                  style={{ 
                    minWidth: '80px',
                    width: option.name === '카페/베이커리' ? '120px' : option.name === '샐러드/청과' ? '120px' : '90px'
                  }}
                >
                  <span>{option.icon}</span>
                  <span className="text-sm font-medium">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-2 border-b flex justify-between items-center">
          <button
            className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${showDiscountOnly ? 'bg-yellow-100' : 'bg-gray-100'}`}
            onClick={toggleDiscountOnly}
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
                    className={`block w-full text-left px-4 py-2 text-sm ${sortOption === '공유 많은 순' ? 'bg-gray-100 font-bold' : ''}`}
                    onClick={() => handleSortOptionChange('공유 많은 순')}
                  >
                    공유 많은 순
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${sortOption === '리뷰 많은 순' ? 'bg-gray-100 font-bold' : ''}`}
                    onClick={() => handleSortOptionChange('리뷰 많은 순')}
                  >
                    리뷰 많은 순
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${sortOption === '별점 높은 순' ? 'bg-gray-100 font-bold' : ''}`}
                    onClick={() => handleSortOptionChange('별점 높은 순')}
                  >
                    별점 높은 순
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${sortOption === '가까운 순' ? 'bg-gray-100 font-bold' : ''}`}
                    onClick={() => handleSortOptionChange('가까운 순')}
                  >
                    가까운 순
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-28">
          <div className="py-2">
            <h2 className="font-bold text-lg">
              {categoryFilter !== '전체' ? `${categoryFilter} 맛집` : '전체 맛집'} 
              {totalStoreCount > 0 && ` (${totalStoreCount})`}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
              <p className="ml-2">가게 정보를 불러오는 중...</p>
            </div>
          ) : displayedStores && displayedStores.length > 0 ? (
            <>
              {displayedStores.map((store, index) => (
                <div
                  key={store.id || store.storeId || index}
                  className="flex items-center p-3 border rounded-lg mb-3 cursor-pointer bg-white shadow-sm"
                  onClick={() => handleStoreClick(store)}
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                    <img
                      src={store.storeImg || storeDefaultImage}
                      alt={store.storeName || store.name || '가게 이미지'}
                      className="w-full h-full object-cover"
                      loading="lazy" // 이미지 지연 로딩 적용
                      onError={(e) => {
                        e.target.src = storeDefaultImage
                      }}
                    />
                  </div>
                  <div className="flex-1 ml-3">
                    <h3
                      className="font-bold truncate"
                      title={store.storeName || store.name || '이름 없음'}
                    >
                      {(store.storeName || store.name || '이름 없음').length >
                      20
                        ? (
                            store.storeName ||
                            store.name ||
                            '이름 없음'
                          ).substring(0, 20) + '...'
                        : store.storeName || store.name || '이름 없음'}
                    </h3>
                    <p
                      className="text-sm text-gray-500 truncate"
                      title={store.address || '주소 정보 없음'}
                    >
                      {simplifyAddress(store.address)}
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
              {loadingMore && (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-500 mr-2"></div>
                  <p className="text-gray-500">더 많은 가게 불러오는 중...</p>
                </div>
              )}
              {!loadingMore && !hasMore && displayedStores.length > 0 && (
                <div className="flex justify-center items-center py-4">
                  <p className="text-gray-500">더 이상 표시할 가게가 없습니다</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <p>표시할 가게가 없습니다.</p>
              {categoryFilter || searchQuery || showDiscountOnly ? (
                <button 
                  className="mt-2 text-blue-500 underline"
                  onClick={() => {
                    setCategoryFilter('전체');
                    sessionStorage.setItem('categoryFilter', '전체');
                    setSearchQuery('');
                    setShowDiscountOnly(false);
                    sessionStorage.setItem('showDiscountOnly', JSON.stringify(false));
                  }}
                >
                  전체 카테고리보기
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <ScrollTopButton scrollContainerRef={storeListRef} />

      {/* 위치 정보 동의 모달 */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5">
            <h3 className="text-lg font-bold mb-2">위치 정보 이용 동의</h3>
            <p className="text-gray-700 mb-3 text-sm">
              가까운 순으로 정렬하기 위해 현재 위치 정보가 필요합니다. 
              위치 정보 이용에 동의하시겠습니까?
            </p>
            <p className="text-xs text-gray-500 mb-4">
              동의하시면 브라우저에서 위치 정보 접근 권한을 요청합니다.
              위치 정보는 가까운 맛집을 찾는 용도로만 사용되며 저장되지 않습니다.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleLocationPermissionDecline}
              >
                취소
              </button>
              <button
                className="px-3 py-1.5 bg-yellow-500 rounded-lg text-sm text-white hover:bg-yellow-600"
                onClick={handleLocationPermissionAgree}
              >
                동의
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
