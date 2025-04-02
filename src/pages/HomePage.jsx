import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import { getStores } from '../api/storeApi'
import defaultImage from '../assets/images/luckeat-default.png'
import banner01 from '../assets/images/럭킷배너01.png'
import banner02 from '../assets/images/럭킷배너02.png'
import banner03 from '../assets/images/럭킷배너03.png'
import storeDefaultImage from '../assets/images/제빵사디폴트이미지.png'
import luckeatLogo from '../assets/images/luckeat-logo.png'
import SearchBar from '../components/Search/SearchBar'
import ScrollTopButton from '../components/common/ScrollTopButton'

function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [showScrollTopButton, setShowScrollTopButton] = useState(false)
  const [sortOption, setSortOption] = useState('가까운 순')
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const sortOptionsRef = useRef(null)
  const storeListRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showArrows, setShowArrows] = useState(false)
  const [displayedStores, setDisplayedStores] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const storesPerPage = 10 // 한 번에 로드할 가게 수 증가
  const [hasMore, setHasMore] = useState(true) // 더 로드할 데이터 여부
  const [totalStoreCount, setTotalStoreCount] = useState(0) // 전체 가게 수 추가
  const [autoSlide, setAutoSlide] = useState(true)
  const autoSlideInterval = useRef(null)
  const [slideDirection, setSlideDirection] = useState('right')
  const API_BASE_URL = 'https://dxa66rf338pjr.cloudfront.net/api/v1'

  const cardNews = [
    {
      id: 1,
      image: banner01,
      link: '/intro',
    },
    {
      id: 2,
      image: banner02,
      link: '/jeju-special',
    },
    {
      id: 3,
      image: banner03,
      link: '/partner',
    },
  ]

  const categoryOptions = [
    { id: 'all', name: '전체', icon: '🔍' },
    { id: 1, name: '한식', icon: '🍚' },
    { id: 2, name: '일식', icon: '🍱' },
    { id: 3, name: '중식', icon: '🥢' },
    { id: 4, name: '양식', icon: '🍝' },
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

  // 서버에서 페이지별로 데이터 가져오기
  const fetchStores = useCallback(async (page = 1, reset = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      let url = `${API_BASE_URL}/stores`
      let queryParams = new URLSearchParams()

      // 페이지네이션 파라미터 추가
      queryParams.append('page', page)
      queryParams.append('size', storesPerPage)

      // 할인 중인 가게만 보기 필터
      if (showDiscountOnly) {
        queryParams.append('isDiscountOpen', 'true')
      }

      // 카테고리 필터링
      if (categoryFilter && categoryFilter !== '전체') {
        const category = categoryOptions.find(opt => opt.name === categoryFilter)
        if (category) {
          console.log('카테고리 필터 적용:', category.name, category.id);
          queryParams.append('categoryId', category.id)
        } else {
          console.log('카테고리를 찾을 수 없음:', categoryFilter);
        }
      }

      // 검색어 필터링
      if (searchQuery) {
        queryParams.append('query', searchQuery)
      }

      // 정렬 옵션
      let sortBy = '';
      switch (sortOption) {
        case '가까운 순':
          sortBy = 'distance';
          break;
        case '리뷰 많은 순':
          sortBy = 'reviewCount';
          break;
        case '공유 많은 순':
          sortBy = 'shareCount';
          break;
        case '별점 높은 순':
          sortBy = 'avgRating';
          break;
        default:
          sortBy = 'distance';
      }
      queryParams.append('sort', sortBy);

      console.log('요청 URL:', url + (queryParams.toString() ? `?${queryParams.toString()}` : ''));

      // 쿼리 파라미터가 있으면 URL에 추가
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
      }

      try {
        const response = await fetch(url)
        const data = await response.json()
        
        // 응답 데이터 로깅
        console.log('API 응답 데이터 길이:', data.length);
        
        // 데이터가 없거나 배열이 아닌 경우 처리
        if (!data || !Array.isArray(data)) {
          if (page === 1) {
            setStores([])
            setDisplayedStores([])
            setFilteredStores([])
            setTotalStoreCount(0) // 가게가 없는 경우 개수 0으로 설정
          }
          setHasMore(false)
          return
        }
        
        // 페이지가 1이거나 reset이 true면 데이터 초기화
        if (page === 1 || reset) {
          setStores(data)
          
          // 추가: 카테고리 필터링이 활성화된 경우 클라이언트 측에서 추가 필터링 적용
          let filteredData = [...data];
          
          // 카테고리 필터링
          if (categoryFilter && categoryFilter !== '전체') {
            const category = categoryOptions.find(opt => opt.name === categoryFilter);
            if (category) {
              console.log('클라이언트 측 카테고리 필터링 적용:', category.name, category.id);
              filteredData = filteredData.filter(store => {
                const storeCategoryId = store.categoryId || store.category || (store.categories && store.categories[0]);
                console.log('가게 카테고리 ID 확인:', store.storeName, storeCategoryId);
                return String(storeCategoryId) === String(category.id);
              });
              console.log('필터링 후 가게 수:', filteredData.length);
            }
          }
          
          // 검색어 필터링 - 클라이언트 측에서도 적용
          if (searchQuery && searchQuery.trim() !== '') {
            console.log('클라이언트 측 검색어 필터링 적용:', searchQuery);
            filteredData = filteredData.filter(store => {
              const storeName = store.storeName || store.name || '';
              return storeName.toLowerCase().includes(searchQuery.toLowerCase());
            });
            console.log('검색 필터링 후 가게 수:', filteredData.length);
          }
          
          setDisplayedStores(filteredData)
          setFilteredStores(filteredData)
          // 첫 페이지인 경우 전체 가게 수를 현재 받은 데이터의 개수로 설정
          setTotalStoreCount(filteredData.length)
        } else {
          // 이미 로드된 데이터에 추가
          setStores(prev => [...prev, ...data])
          
          // 추가: 카테고리 필터링이 활성화된 경우 클라이언트 측에서 추가 필터링 적용
          let filteredData = [...data];
          if (categoryFilter && categoryFilter !== '전체') {
            const category = categoryOptions.find(opt => opt.name === categoryFilter);
            if (category) {
              console.log('클라이언트 측 카테고리 필터링 적용(추가 데이터):', category.name, category.id);
              filteredData = filteredData.filter(store => {
                const storeCategoryId = store.categoryId || store.category || (store.categories && store.categories[0]);
                return String(storeCategoryId) === String(category.id);
              });
            }
          }
          
          const updatedFilteredData = [...filteredStores, ...filteredData];
          setDisplayedStores(prev => [...prev, ...filteredData])
          setFilteredStores(updatedFilteredData)
          // 총 가게 수 업데이트 (필터링된 데이터로 계산)
          setTotalStoreCount(updatedFilteredData.length)
        }

        // 받은 데이터가 요청한 size보다 적으면 더 이상 데이터가 없는 것으로 간주
        setHasMore(data.length === storesPerPage)
        setCurrentPage(page)
      } catch (error) {
        console.error('API 호출 오류:', error);
        // 오류 발생 시 조용히 처리하고 사용자에게 오류 메시지 표시
        if (page === 1) {
          setStores([])
          setDisplayedStores([])
          setFilteredStores([])
        }
        setHasMore(false)
      }
    } catch (error) {
      console.error('fetchStores 오류:', error);
      // 전체 오류 처리
      if (page === 1) {
        setStores([])
        setDisplayedStores([])
        setFilteredStores([])
      }
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [showDiscountOnly, categoryFilter, searchQuery, sortOption, storesPerPage, API_BASE_URL]);

  // 초기 데이터 로드 및 필터 변경 시 데이터 다시 로드
  useEffect(() => {
    console.log('필터 변경됨:', { categoryFilter, searchQuery, showDiscountOnly, sortOption });
    // 필터가 변경되면 페이지를 1로 초기화하고 데이터 다시 로드
    setCurrentPage(1) // 페이지 리셋
    setDisplayedStores([]) // 표시된 가게 초기화
    setStores([]) // 저장된 가게 초기화
    setFilteredStores([]) // 필터링된 가게도 초기화
    setHasMore(true) // 더 불러올 데이터가 있다고 가정
    fetchStores(1, true)
  }, [fetchStores, showDiscountOnly, categoryFilter, searchQuery, sortOption]);

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
    console.log('카테고리 선택:', category);
    
    // "전체" 카테고리 처리
    if (category === '전체') {
      setCategoryFilter('전체')
      setSearchQuery('') // 검색어 초기화 추가
      return
    }
    
    // 이미 선택된 카테고리를 다시 클릭하면 해제하고 전체로 돌아감
    if (categoryFilter === category) {
      console.log('카테고리 해제, 전체로 돌아감');
      setCategoryFilter('전체')
      setSearchQuery('') // 검색어 초기화 추가
    } else {
      console.log('카테고리 설정:', category);
      setCategoryFilter(category)
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

  const handleSearch = (query) => {
    console.log('검색어 변경됨:', query);
    setSearchQuery(query);
    
    // 검색어가 비었을 때 (사용자가 검색어를 지웠을 때)
    if (!query || query.trim() === '') {
      console.log('검색어가 비어있음. 카테고리 필터만 적용하여 데이터 다시 불러오기');
      setSearchQuery('');
      fetchStores(1, true);
      return;
    }
    
    // 검색어가 있을 경우 현재 데이터에서 즉시 필터링 적용
    console.log('클라이언트 측 검색 필터링 적용:', query);
    
    // 현재 표시된 가게 목록에서 검색어로 필터링
    const filteredResults = stores.filter(store => {
      const storeName = store.storeName || store.name || '';
      return storeName.toLowerCase().includes(query.toLowerCase());
    });
    
    console.log('검색 필터링 결과:', filteredResults.length, '개 항목');
    setFilteredStores(filteredResults);
    setDisplayedStores(filteredResults);
    setTotalStoreCount(filteredResults.length);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-4 py-3 border-b flex justify-center items-center bg-white sticky top-0 z-30">
        <h1
          className="text-2xl font-bold text-yellow-500"
          onClick={() => {
            setCategoryFilter('전체');
            setSearchQuery('');
            setShowDiscountOnly(false);
            setSortOption('가까운 순');
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
              {categoryFilter ? `${categoryFilter} 맛집` : '전체 맛집'} (
              {totalStoreCount.toString().replace('*', '')}
              )
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
                  className="flex items-center p-3 border rounded-lg mb-3 cursor-pointer"
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
                      {(store.address || '주소 정보 없음').length > 20
                        ? (store.address || '주소 정보 없음').substring(0, 20) +
                          '...'
                        : store.address || '주소 정보 없음'}
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
                    setSearchQuery('');
                    setShowDiscountOnly(false);
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

      <div className="w-full bg-white border-t">
        <Navigation />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* 스크롤바 숨기기 위한 스타일 */
        .flex-1 {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
          overflow-y: auto;
        }
        .flex-1::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        `
      }}
      />
    </div>
  )
}

export default HomePage
