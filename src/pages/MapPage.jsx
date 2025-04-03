import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import Header from '../components/layout/Header'
import { Map, MapMarker, MarkerClusterer } from 'react-kakao-maps-sdk'
import StoreMarker from '../components/map/StoreMarker'
import MapController from '../components/map/MapController'
import { getStores } from '../api/storeApi'
import defaultImage from '../assets/images/luckeat-default.png'
import storeDefaultImage from '../assets/images/제빵사디폴트이미지.png'
import myLocationMarker from '../assets/images/my_locatoin_maker.png'
import axios from 'axios'
import SearchBar from '../components/Search/SearchBar'

function MapPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [selectedStoreId, setSelectedStoreId] = useState(null)
  const [mapCenter, setMapCenter] = useState({
    lat: 33.4996,
    lng: 126.5302,
  })
  const [mapLevel, setMapLevel] = useState(3)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const mapRef = useRef(null)
  const storeListRef = useRef(null)

  // 선택된 가게 아이템의 ref들을 저장
  const storeItemRefs = useRef({})

  // 추가된 상태들
  const [storeListExpanded, setStoreListExpanded] = useState(false)
  const mapContainerRef = useRef(null)

  // API 기본 URL 직접 설정
  const API_BASE_URL = 'https://dxa66rf338pjr.cloudfront.net'

  // 카테고리 옵션 추가
  const categoryOptions = [
    { id: 1, name: '한식', icon: '🍚' },
    { id: 2, name: '일식', icon: '🍱' },
    { id: 3, name: '중식', icon: '🥢' },
    { id: 4, name: '양식', icon: '🍝' },
    { id: 5, name: '카페/베이커리', icon: '🍞' },
    { id: 6, name: '샐러드/청과', icon: '🥗' },
  ]

  // 카테고리 선택 핸들러 추가
  const handleCategorySelect = (categoryId) => {
    setCategoryFilter(categoryFilter === categoryId ? '' : categoryId)
  }

  // 사용자 위치 가져오기 함수
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            const location = { lat: latitude, lng: longitude }
            setUserLocation(location)
            setMapCenter(location)
            resolve(location)
          },
          (error) => {
            console.error('위치 정보를 가져오는데 실패했습니다:', error)
            reject(error)
          },
          options,
        )
      } else {
        const error = new Error(
          '이 브라우저에서는 위치 정보를 지원하지 않습니다.',
        )
        console.error(error.message)
        reject(error)
      }
    })
  }

  // 사용자 위치 가져오기
  useEffect(() => {
    getUserLocation().catch((error) => {
      console.warn('위치 정보 가져오기 실패, 기본 위치 사용:', error)
      // 위치 정보 가져오기 실패 시 기본 위치 사용 (서울 시청)
      const defaultLocation = { lat: 37.5665, lng: 126.978 }
      setUserLocation(defaultLocation) // 기본 위치도 userLocation에 저장
      setMapCenter(defaultLocation)
    })
  }, [])

  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 가게 데이터 가져오기
        try {
          // 할인중인 가게만 보여주기 옵션이 선택된 경우 API 파라미터 추가
          let apiUrl = `${API_BASE_URL}/api/v1/stores`
          if (showDiscountOnly) {
            apiUrl += '?isDiscountOpen=true'
          }

          // 직접 axios로 API 호출
          const response = await axios.get(apiUrl)
          const storesData = response.data

          if (!storesData || storesData.length === 0) {
            setLoading(false)
            return
          }

          // 가게 목록 처리 - 유효한 좌표를 가진 가게만 포함
          const storesWithValidLocation = storesData
            .map((store) => {
              // 위도와 경도 데이터 처리
              // latitude, longitude 필드가 우선 (백엔드 실제 주소 좌표)
              let lat = store.latitude ? parseFloat(store.latitude) : null
              let lng = store.longitude ? parseFloat(store.longitude) : null

              // latitude, longitude가 없으면 lat, lng 필드 확인
              if (!lat || isNaN(lat)) {
                lat = store.lat ? parseFloat(store.lat) : null
              }
              if (!lng || isNaN(lng)) {
                lng = store.lng ? parseFloat(store.lng) : null
              }

              // 유효하지 않은 좌표인 경우 (null, NaN, 0)
              if (
                !lat ||
                isNaN(lat) ||
                !lng ||
                isNaN(lng) ||
                (lat === 0 && lng === 0)
              ) {
                // 유효하지 않은 좌표를 가진 가게는 지도에 표시하지 않음
                return {
                  ...store,
                  lat: null,
                  lng: null,
                  hasValidLocation: false, // 유효한 위치 없음 표시
                }
              }

              return {
                ...store,
                lat: lat,
                lng: lng,
                hasValidLocation: true,
              }
            })
            // 유효한 좌표를 가진 가게만 필터링 (지도에 표시)
            .filter((store) => store.hasValidLocation)

          setStores(storesWithValidLocation)
          setFilteredStores(storesWithValidLocation)
        } catch (error) {
          console.error('가게 정보 로드 실패:', error)
          // 오류가 있으면 getStores 함수로 재시도
          try {
            const storesData = await getStores()
            const storeList = Array.isArray(storesData)
              ? storesData
              : storesData?.data || []

            // 위치 정보 처리 - 유효한 좌표를 가진 가게만 포함
            const storesWithLocation = storeList
              .map((store) => {
                // 위도와 경도 데이터 처리
                // latitude, longitude 필드가 우선 (백엔드 실제 주소 좌표)
                let lat = store.latitude ? parseFloat(store.latitude) : null
                let lng = store.longitude ? parseFloat(store.longitude) : null

                // latitude, longitude가 없으면 lat, lng 필드 확인
                if (!lat || isNaN(lat)) {
                  lat = store.lat ? parseFloat(store.lat) : null
                }
                if (!lng || isNaN(lng)) {
                  lng = store.lng ? parseFloat(store.lng) : null
                }

                // 유효하지 않은 좌표 처리
                if (
                  !lat ||
                  isNaN(lat) ||
                  !lng ||
                  isNaN(lng) ||
                  (lat === 0 && lng === 0)
                ) {
                  // 유효하지 않은 좌표를 가진 가게는 지도에 표시하지 않음
                  return {
                    ...store,
                    lat: null,
                    lng: null,
                    hasValidLocation: false, // 유효한 위치 없음 표시
                  }
                }

                return {
                  ...store,
                  lat: lat,
                  lng: lng,
                  hasValidLocation: true,
                }
              })
              // 유효한 좌표를 가진 가게만 필터링 (지도에 표시)
              .filter((store) => store.hasValidLocation)

            setStores(storesWithLocation)
            setFilteredStores(storesWithLocation)
          } catch (retryError) {
            console.error('getStores 함수 재시도 실패:', retryError)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [userLocation, showDiscountOnly])

  // 카카오맵 로드 확인
  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        setMapLoaded(true)
      } else {
        const script = document.createElement('script')

        // API 키 설정
        const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services,clusterer,drawing&autoload=false`
        script.async = true

        script.onload = () => {
          window.kakao.maps.load(() => {
            setMapLoaded(true)
          })
        }

        script.onerror = (error) => {
          console.error('카카오맵 로드 실패:', error)
          alert(
            '지도 로딩에 실패했습니다. 카카오 개발자 센터에서 현재 도메인이 등록되어 있는지 확인해주세요.',
          )
        }

        document.head.appendChild(script)
      }
    }

    loadKakaoMap()
  }, [])

  // 검색어, 할인 필터, 카테고리가 변경될 때 가게 목록 필터링
  useEffect(() => {
    if (stores.length === 0) return

    let result = [...stores]

    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((store) => {
        const storeName = store.storeName || store.name || ''
        const address = store.address || ''
        return (
          storeName.toLowerCase().includes(query) ||
          address.toLowerCase().includes(query)
        )
      })
    }

    // 카테고리 필터링
    if (categoryFilter) {
      result = result.filter((store) => {
        return store.categoryId === categoryFilter
      })
    }

    setFilteredStores(result)
  }, [searchQuery, stores, categoryFilter])

  // 마커 클릭 핸들러
  const handleMarkerClick = useCallback((store) => {
    // store가 null인 경우 선택 해제 후 종료
    if (!store) {
      setSelectedStoreId(null)
      return
    }

    // 항상 인포윈도우가 표시되도록 설정 - 토글 방식 제거
    setSelectedStoreId(store.id)

    // 선택된 가게로 지도 중심 이동
    setMapCenter({ lat: store.lat, lng: store.lng })

    // 가게 목록 최소화 (오버레이가 더 잘 보이도록)
    setStoreListExpanded(false)

    // 지도 레벨 조정 (더 가깝게 보이도록)
    setMapLevel(3)

    // 선택된 가게로 목록 스크롤
    if (storeItemRefs.current[store.id] && storeListRef.current) {
      // 약간의 지연을 두고 스크롤 (UI 업데이트 후에 실행되도록)
      setTimeout(() => {
        storeItemRefs.current[store.id].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 100)
    }
  }, [])

  // 줌 레벨 변경 핸들러 추가
  const handleZoomChange = (newLevel) => {
    // 최소 레벨 1, 최대 레벨 14로 제한
    const level = Math.max(1, Math.min(14, newLevel))
    setMapLevel(level)
    // 줌 변경 시 가게 목록 상태를 변경하지 않도록 함
  }

  // 가게 상세 페이지로 이동
  const handleStoreDetail = (storeId) => {
    navigate(`/store/${storeId}`)
  }

  // 사용자 위치로 이동하는 핸들러 - 현재 위치 다시 가져오기
  const handleMoveToCurrentLocation = async () => {
    try {
      // 위치 정보 새로 가져오기 시도
      setLoading(true) // 로딩 표시 추가
      const location = await getUserLocation()
      setMapCenter(location)
      setMapLevel(3) // 줌 레벨 설정
      setLoading(false) // 로딩 완료
    } catch (error) {
      console.error('현재 위치로 이동 실패:', error)
      alert('현재 위치를 가져올 수 없습니다. 위치 접근 권한을 확인해주세요.')
      setLoading(false) // 에러 발생해도 로딩 종료
    }
  }

  // 지도 클릭 핸들러
  const handleMapClick = (map, mouseEvent) => {
    // 특정 조건 제거 - 마커와 오버레이를 제외한 모든 클릭에서 처리되도록
    if (mouseEvent && !mouseEvent._stopPropagation) {
      // 확장된 목록이 있을 때만 최소화
      if (storeListExpanded) {
        setStoreListExpanded(false)
      }
      // 인포윈도우는 그대로 유지 (마커 클릭 시에만 변경)
    }
  }

  // 가게 목록 스크롤 핸들러 추가
  const handleStoreListScroll = (e) => {
    if (!storeListExpanded) {
      setStoreListExpanded(true)
    }
  }

  // 검색 핸들러
  const handleSearch = (query) => {
    setSearchQuery(query)
    // 검색어 변경 후에는 매장 목록 확장
    setStoreListExpanded(true)
  }

  // 주소 간소화 및 글자수 제한 함수
  const simplifyAddress = (address) => {
    if (!address) return '주소 정보 없음'
    // "대한민국" 제거
    let simplified = address.replace(/^대한민국\s+/, '')
    // "제주특별자치도" 제거
    simplified = simplified.replace(/제주특별자치도\s+/, '')
    // 20자 제한 (20자가 넘으면 "..." 표시)
    if (simplified.length > 20) {
      simplified = simplified.substring(0, 20) + '...'
    }
    return simplified
  }

  // 지도 렌더링 코드 부분을 수정
  const renderMap = () => {
    if (!mapLoaded) {
      return (
        <div className="flex items-center justify-center h-full">
          <p>지도를 로딩 중입니다...</p>
        </div>
      )
    }

    return (
      <Map
        center={mapCenter}
        level={mapLevel}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        onClick={handleMapClick}
      >
        {/* 현재 위치 마커 */}
        {userLocation && (
          <MapMarker
            position={userLocation}
            image={{
              src: 'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_red.png',
              size: { width: 26, height: 37 },
            }}
            title="내 위치"
          />
        )}

        {/* 가게 마커 클러스터링 추가 */}
        <MarkerClusterer
          averageCenter={true}
          minLevel={5}
          disableClickZoom={false}
          styles={[
            {
              width: '50px',
              height: '50px',
              background: 'rgba(51, 204, 255, .8)',
              borderRadius: '25px',
              color: '#000',
              textAlign: 'center',
              fontWeight: 'bold',
              lineHeight: '50px',
            },
          ]}
        >
          {/* 가게 마커 */}
          {filteredStores.map((store) => (
            <StoreMarker
              key={store.id}
              store={store}
              isSelected={selectedStoreId === store.id}
              onClick={handleMarkerClick}
              onDetail={handleStoreDetail}
              userLocation={userLocation}
            />
          ))}
        </MarkerClusterer>
      </Map>
    )
  }

  // 가게 목록 부분 수정 - z-index 변경
  const renderStoreList = () => {
    if (filteredStores.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-500 mb-2">검색 결과가 없습니다</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setCategoryFilter('')
              setShowDiscountOnly(false)
            }}
            className="text-sm text-gray-600 underline"
          >
            검색 조건 초기화
          </button>
        </div>
      )
    }

    return (
      <div
        className="overflow-y-auto max-h-[calc(100%-56px)]"
        ref={storeListRef}
        onScroll={handleStoreListScroll}
      >
        {filteredStores.map((store) => {
          const isSelected = selectedStoreId === store.id
          const itemRef = React.createRef()
          storeItemRefs.current[store.id] = itemRef

          return (
            <div
              key={store.id}
              ref={itemRef}
              className={`p-3 border-b flex items-start cursor-pointer relative ${
                isSelected ? 'bg-yellow-50' : ''
              }`}
              onClick={() => handleStoreDetail(store.id)}
            >
              {/* 가게 이미지 */}
              <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={store.storeImg || defaultImage}
                  alt={store.name || store.storeName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = defaultImage
                  }}
                />
              </div>

              {/* 가게 정보 */}
              <div className="ml-3 flex-grow">
                <h3 className="font-medium text-gray-900 mb-0.5 pr-14">
                  {store.name || store.storeName || '이름 없는 가게'}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  {simplifyAddress(store.address) || '주소 정보 없음'}
                </p>
                <div className="flex items-center text-xs">
                  {/* 별점 */}
                  <span className="text-yellow-500 font-medium">
                    ★ {(store.avgRating || store.averageRating || 0).toFixed(1)}
                  </span>
                  {/* 할인 정보 */}
                  {((store.discount && store.discount !== '0%') ||
                    store.isDiscountOpen === true) && (
                    <span className="ml-2 bg-red-100 text-red-700 px-1.5 rounded-sm">
                      {store.discount || '할인중'}
                    </span>
                  )}
                </div>
              </div>

              {/* 우측 화살표 아이콘 */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <Header title="지도" />

      {/* 검색 영역 */}
      <div className="px-4 py-2 border-b">
        <SearchBar
          placeholder="가게 이름, 주소 검색"
          initialValue={searchQuery}
          onSearch={handleSearch}
        />
      </div>

      {/* 카테고리 필터 영역 */}
      <div className="px-4 py-3 border-b">
        <div className="flex justify-between">
          {categoryOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleCategorySelect(option.id)}
              className={`flex flex-col items-center justify-center ${
                categoryFilter === option.id
                  ? 'text-yellow-600'
                  : 'text-gray-600'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                  categoryFilter === option.id
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

      {/* 지도 영역 */}
      <div
        ref={mapContainerRef}
        className="flex-1 relative bg-gray-100 overflow-hidden"
        style={{ minHeight: '400px' }}
        onClick={handleMapClick}
      >
        {/* 로딩 표시 */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20">
            <div className="text-blue-500 font-bold flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              데이터 로딩 중...
            </div>
          </div>
        )}

        {/* 카카오 지도 */}
        {renderMap()}

        {/* 마감 할인 필터 */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <button
            className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
              showDiscountOnly
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 border'
            }`}
            onClick={() => setShowDiscountOnly(!showDiscountOnly)}
          >
            <span>마감 할인중만</span>
            {showDiscountOnly && <span>✓</span>}
          </button>
        </div>

        {/* 내 위치로 이동 버튼 위치 수정 */}
        <div className="absolute bottom-36 right-5 z-30">
          <MapController
            onMoveToCurrentLocation={handleMoveToCurrentLocation}
            onZoomIn={() => handleZoomChange(mapLevel - 1)}
            onZoomOut={() => handleZoomChange(mapLevel + 1)}
          />
        </div>

        {/* 가게 목록 */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white z-10 transition-transform duration-300 shadow-lg ${
            storeListExpanded ? 'h-2/3' : 'h-auto max-h-48'
          }`}
          style={{
            transform: storeListExpanded ? 'translateY(0)' : 'translateY(80%)',
            maxHeight: storeListExpanded ? '65%' : '140px',
          }}
        >
          <div
            className="p-2 flex justify-between items-center bg-gray-50 border-b cursor-pointer"
            onClick={() => setStoreListExpanded(!storeListExpanded)}
          >
            <span className="font-medium text-sm">
              {filteredStores.length}개의 가게
            </span>
            <button className="text-gray-500">
              {storeListExpanded ? (
                <svg 
                  width="20" 
                  height="20" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 15l7-7 7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>
          </div>
          {renderStoreList()}
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default MapPage
