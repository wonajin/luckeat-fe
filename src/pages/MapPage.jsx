import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import Header from '../components/layout/Header'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import StoreMarker from '../components/map/StoreMarker'
import MapController from '../components/map/MapController'
import { getStores } from '../api/storeApi'
import { getCategories } from '../api/categoryApi'
import defaultImage from '../assets/images/luckeat-default.png'
import storeDefaultImage from '../assets/images/제빵사디폴트이미지.png'
import myLocationMarker from '../assets/images/my_locatoin_maker.png'
import axios from 'axios'
import SearchBar from '../components/Search/SearchBar'

function MapPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedStoreId, setSelectedStoreId] = useState(null)
  const [mapCenter, setMapCenter] = useState({
    lat: 33.450705,
    lng: 126.570677,
  }) // 기본 위치(제주도 구름스퀘어)
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

  // 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          console.log('사용자 위치:', latitude, longitude)
          // 사용자 위치를 저장하지만, 지도 중심은 제주도 유지
          setUserLocation({ lat: latitude, lng: longitude })
          // 제주도 위치로 중심 설정 (위에서 이미 설정했으므로 주석 처리)
          // setMapCenter({ lat: 33.450705, lng: 126.570677 })
        },
        (error) => {
          console.error('위치 정보를 가져오는데 실패했습니다:', error)
        },
      )
    } else {
      console.error('이 브라우저에서는 위치 정보를 지원하지 않습니다.')
    }
  }, [])

  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 카테고리 데이터 가져오기
        const categoriesData = await getCategories()
        console.log('카테고리 데이터:', categoriesData)

        const categoriesList = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData?.data || []

        // 전체 카테고리 추가
        const allCategories = [
          { id: 0, name: '전체', icon: '🍽️' },
          ...categoriesList,
        ]

        setCategories(allCategories)

        // 가게 데이터 가져오기
        console.log('가게 정보 불러오는 중...')
        try {
          // 할인중인 가게만 보여주기 옵션이 선택된 경우 API 파라미터 추가
          let apiUrl = `${API_BASE_URL}/api/v1/stores`
          if (showDiscountOnly) {
            apiUrl += '?isDiscountOpen=true'
          }

          // 직접 axios로 API 호출
          const response = await axios.get(apiUrl)
          const storesData = response.data
          console.log('가게 데이터:', storesData)

          if (!storesData || storesData.length === 0) {
            console.log('가게 데이터가 없습니다.')
            setLoading(false)
            return
          }

          // 가게 목록에 있는 고유 카테고리 추출
          const uniqueCategories = new Set()
          storesData.forEach((store) => {
            if (store.category) {
              uniqueCategories.add(store.category)
            }
          })
          console.log('추출된 고유 카테고리:', Array.from(uniqueCategories))

          // 더미 카테고리 설정 (API에서 카테고리가 없을 경우)
          if (uniqueCategories.size === 0) {
            // 화면에 표시된 가게들의 이름을 기반으로 더미 카테고리 할당
            const dummyCategories = {
              김재훈고사리육개장: '한식',
              플베버거: '패스트푸드',
              철판요리: '중식',
              카페브브: '카페',
              맛있겠다: '일식',
              호식이두마리치킨: '치킨',
              농심가락: '편의점',
              맥도날드: '패스트푸드',
              롯데리아: '패스트푸드',
              스타벅스: '카페',
              와플대학: '디저트',
              아리랑: '한식',
            }

            console.log('더미 카테고리 할당 시작')

            // 유효한 위치 정보가 있는 매장만 처리
            const storesWithValidLocation = storesData.map((store) => {
              // 가게 이름으로 카테고리 매칭
              const storeName = store.name || store.storeName || ''
              let category = store.category

              if (!category) {
                // 카테고리가 없으면 더미 카테고리에서 찾거나 기본값 설정
                for (const [keyword, cat] of Object.entries(dummyCategories)) {
                  if (storeName.includes(keyword)) {
                    category = cat
                    break
                  }
                }

                // 여전히 없으면 가게 ID에 따라 랜덤 카테고리 할당
                if (!category) {
                  const availableCategories = [
                    '한식',
                    '중식',
                    '일식',
                    '양식',
                    '카페',
                    '디저트',
                    '패스트푸드',
                  ]
                  const index = store.id % availableCategories.length
                  category = availableCategories[index]
                }

                console.log(
                  `가게 [${store.id}] ${storeName}에 카테고리 할당: ${category}`,
                )
              }

              // lat, lng가 문자열이면 숫자로 변환
              let lat = store.lat ? parseFloat(store.lat) : null
              let lng = store.lng ? parseFloat(store.lng) : null

              // 제주도 구름스퀘어 좌표
              const JEJU_DEFAULT_LAT = 33.450705
              const JEJU_DEFAULT_LNG = 126.570677

              // 유효하지 않은 좌표인 경우 (null, NaN, 0)
              if (
                !lat ||
                isNaN(lat) ||
                !lng ||
                isNaN(lng) ||
                (lat === 0 && lng === 0)
              ) {
                // 제주도 좌표를 기준으로 랜덤한 위치 생성 (반경 500m 이내)
                console.log(
                  `매장 ${store.id}(${storeName}): 유효한 좌표 없음, 제주도 내 랜덤 위치 생성`,
                )
                const randomLat =
                  JEJU_DEFAULT_LAT + (Math.random() - 0.5) * 0.01 // 약 ±500m
                const randomLng =
                  JEJU_DEFAULT_LNG + (Math.random() - 0.5) * 0.01
                return {
                  ...store,
                  lat: randomLat,
                  lng: randomLng,
                  hasRandomLocation: true, // 랜덤 위치 표시
                  category: category, // 수정된 카테고리 적용
                }
              }

              // 위치가 제주도 근처가 아닌 경우 (위도 33도 경도 126도 근처가 아닌 경우)
              if (
                Math.abs(lat - JEJU_DEFAULT_LAT) > 0.5 ||
                Math.abs(lng - JEJU_DEFAULT_LNG) > 0.5
              ) {
                console.log(
                  `매장 ${store.id}(${storeName}): 제주도 밖 좌표 감지, 제주도 내로 보정`,
                )
                // 제주도 내 랜덤 위치로 조정
                const randomLat =
                  JEJU_DEFAULT_LAT + (Math.random() - 0.5) * 0.01 // 약 ±500m
                const randomLng =
                  JEJU_DEFAULT_LNG + (Math.random() - 0.5) * 0.01
                return {
                  ...store,
                  lat: randomLat,
                  lng: randomLng,
                  hasRandomLocation: true, // 랜덤 위치 표시
                  category: category, // 수정된 카테고리 적용
                }
              }

              console.log(
                `매장 ${store.id}(${storeName}): 좌표 확인 - 위도 ${lat}, 경도 ${lng}, 카테고리: ${category}`,
              )
              return {
                ...store,
                lat: lat,
                lng: lng,
                hasRandomLocation: false,
                category: category, // 수정된 카테고리 적용
              }
            })

            // 더미 카테고리 메뉴 항목 생성
            const availableCategories = [
              '한식',
              '중식',
              '일식',
              '양식',
              '카페',
              '디저트',
              '패스트푸드',
              '치킨',
              '편의점',
            ]
            const dummyCategoryList = availableCategories.map((cat, index) => ({
              id: index + 1,
              name: cat,
              icon: getCategoryIcon(cat),
            }))

            const allDummyCategories = [
              { id: 0, name: '전체', icon: '🍽️' },
              ...dummyCategoryList,
            ]

            setCategories(allDummyCategories)
            console.log('더미 카테고리 메뉴 생성:', allDummyCategories)

            console.log(
              `총 ${storesWithValidLocation.length}개 매장 정보 로드 완료`,
            )
            setStores(storesWithValidLocation)
            setFilteredStores(storesWithValidLocation)
          } else {
            // API에서 카테고리가 있는 경우 정상 처리
            const storesWithValidLocation = storesData.map((store) => {
              // lat, lng가 문자열이면 숫자로 변환
              let lat = store.lat ? parseFloat(store.lat) : null
              let lng = store.lng ? parseFloat(store.lng) : null

              // 제주도 구름스퀘어 좌표
              const JEJU_DEFAULT_LAT = 33.450705
              const JEJU_DEFAULT_LNG = 126.570677

              // 유효하지 않은 좌표인 경우 (null, NaN, 0)
              if (
                !lat ||
                isNaN(lat) ||
                !lng ||
                isNaN(lng) ||
                (lat === 0 && lng === 0)
              ) {
                // 제주도 좌표를 기준으로 랜덤한 위치 생성 (반경 500m 이내)
                console.log(
                  `매장 ${store.id}(${store.name || store.storeName}): 유효한 좌표 없음, 제주도 내 랜덤 위치 생성`,
                )
                const randomLat =
                  JEJU_DEFAULT_LAT + (Math.random() - 0.5) * 0.01 // 약 ±500m
                const randomLng =
                  JEJU_DEFAULT_LNG + (Math.random() - 0.5) * 0.01
                return {
                  ...store,
                  lat: randomLat,
                  lng: randomLng,
                  hasRandomLocation: true, // 랜덤 위치 표시
                }
              }

              // 위치가 제주도 근처가 아닌 경우 (위도 33도 경도 126도 근처가 아닌 경우)
              if (
                Math.abs(lat - JEJU_DEFAULT_LAT) > 0.5 ||
                Math.abs(lng - JEJU_DEFAULT_LNG) > 0.5
              ) {
                console.log(
                  `매장 ${store.id}(${store.name || store.storeName}): 제주도 밖 좌표 감지, 제주도 내로 보정`,
                )
                // 제주도 내 랜덤 위치로 조정
                const randomLat =
                  JEJU_DEFAULT_LAT + (Math.random() - 0.5) * 0.01 // 약 ±500m
                const randomLng =
                  JEJU_DEFAULT_LNG + (Math.random() - 0.5) * 0.01
                return {
                  ...store,
                  lat: randomLat,
                  lng: randomLng,
                  hasRandomLocation: true, // 랜덤 위치 표시
                }
              }

              console.log(
                `매장 ${store.id}(${store.name || store.storeName}): 좌표 확인 - 위도 ${lat}, 경도 ${lng}`,
              )
              return {
                ...store,
                lat: lat,
                lng: lng,
                hasRandomLocation: false,
              }
            })

            console.log(
              `총 ${storesWithValidLocation.length}개 매장 정보 로드 완료`,
            )
            setStores(storesWithValidLocation)
            setFilteredStores(storesWithValidLocation)
          }
        } catch (error) {
          console.error('가게 정보 로드 실패:', error)
          // 오류가 있으면 getStores 함수로 재시도
          try {
            const storesData = await getStores()
            console.log('getStores 함수로 재시도:', storesData)
            const storeList = Array.isArray(storesData)
              ? storesData
              : storesData?.data || []
            setStores(storeList)
            setFilteredStores(storeList)
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
        console.log('카카오맵 SDK를 로드합니다...')
        const script = document.createElement('script')

        // API 키 설정
        const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services,clusterer,drawing&autoload=false`
        script.async = true

        script.onload = () => {
          window.kakao.maps.load(() => {
            console.log('카카오맵 로드 완료')
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
    console.log('필터링 전 가게 수:', result.length)

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
      console.log('검색 필터링 후 가게 수:', result.length)
    }

    // 할인 필터링은 API에서 처리하므로 여기서는 제거
    // 이미 showDiscountOnly 변경 시 useEffect를 통해 API 요청이 다시 이루어짐

    // 카테고리 필터링
    if (selectedCategory && selectedCategory !== '전체') {
      result = result.filter((store) => {
        // categoryId 또는 category 필드 검사
        const storeCategory = store.category || store.categoryId || ''
        console.log(
          `가게 [${store.storeName || store.name}] 카테고리:`,
          storeCategory,
          '선택된 카테고리:',
          selectedCategory,
        )

        // 카테고리 이름으로 비교 (대소문자 구분 없이)
        if (typeof storeCategory === 'string') {
          return storeCategory.toLowerCase() === selectedCategory.toLowerCase()
        }

        // 카테고리 ID로 비교 (ID가 숫자인 경우)
        return String(storeCategory) === String(selectedCategory)
      })
      console.log('카테고리 필터링 후 가게 수:', result.length)
    }

    setFilteredStores(result)
  }, [searchQuery, selectedCategory, stores])

  // 마커 클릭 핸들러
  const handleMarkerClick = useCallback(
    (store) => {
      console.log('마커 클릭:', store.id, store.name || store.storeName)

      // 선택된 가게 ID 설정
      setSelectedStoreId(selectedStoreId === store.id ? null : store.id)

      // 선택된 가게로 지도 중심 이동
      if (selectedStoreId !== store.id) {
        setMapCenter({ lat: store.lat, lng: store.lng })
      }

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
    },
    [selectedStoreId],
  )

  // 지도 확대
  const handleZoomIn = () => {
    if (mapLevel > 1) {
      setMapLevel(mapLevel - 1)
    }
  }

  // 지도 축소
  const handleZoomOut = () => {
    if (mapLevel < 14) {
      setMapLevel(mapLevel + 1)
    }
  }

  // 카테고리 아이콘 매핑 함수
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      전체: '🍽️',
      한식: '🍚',
      중식: '🥢',
      일식: '🍣',
      양식: '🍝',
      디저트: '🍰',
      패스트푸드: '🍔',
      분식: '🍜',
      베이커리: '🥖',
      카페: '☕',
      퓨전음식: '🍲',
      정육: '🥩',
      수산: '🐟',
      '야채/과일': '🥬',
      '카페/디저트': '🍰',
      기타: '🛒',
    }

    return iconMap[categoryName] || '🍽️'
  }

  // 위치 이동 핸들러 추가
  const handleMoveToCurrentLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation)
      setMapLevel(3)
    } else {
      alert('현재 위치 정보를 불러올 수 없습니다. 위치 접근 권한을 확인해주세요.')
    }
  }

  // 지도 클릭 핸들러 추가
  const handleMapClick = () => {
    if (storeListExpanded) {
      setStoreListExpanded(false)
    }
  }

  // 가게 목록 스크롤 핸들러 추가
  const handleStoreListScroll = (e) => {
    if (!storeListExpanded) {
      setStoreListExpanded(true)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <Header title="지도" />

      {/* 검색 영역 */}
      <div className="p-4 border-b">
        <SearchBar 
          placeholder="가게 또는 메뉴 검색" 
          initialValue={searchQuery} 
          onSearch={(query) => {
            setSearchQuery(query);
            handleSearch(query);
          }}
        />
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
        {mapLoaded ? (
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
                  src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                  size: { width: 24, height: 35 },
                }}
                title="내 위치"
              />
            )}

            {/* 가게 마커 */}
            {filteredStores.map((store) => (
              <StoreMarker
                key={store.id}
                store={store}
                isSelected={selectedStoreId === store.id}
                onClick={() => handleMarkerClick(store)}
              />
            ))}
          </Map>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>지도를 로딩 중입니다...</p>
          </div>
        )}

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

        {/* 내 위치로 이동 버튼 추가 */}
        <div className="absolute bottom-4 right-4 z-10" style={{ bottom: storeListExpanded ? '60%' : '33%' }}>
          <button
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
            onClick={handleMoveToCurrentLocation}
          >
            <img src={myLocationMarker} alt="내 위치" className="w-6 h-6" />
          </button>
        </div>

        {/* 확대/축소 버튼 */}
        <MapController onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

        {/* 가게 목록 */}
        <div
          ref={storeListRef}
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg overflow-y-auto z-10 transition-all duration-300 ${
            storeListExpanded ? 'h-3/5' : 'h-1/3'
          }`}
          onScroll={handleStoreListScroll}
        >
          <div className="sticky top-0 w-full flex justify-center pt-2 pb-1 bg-white">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <div className="p-4">
            <h3 className="font-bold mb-2">
              주변 가게 ({filteredStores.length})
            </h3>
            <div className="space-y-3">
              {filteredStores.length > 0 ? (
                filteredStores.map((store) => (
                  <div
                    key={store.id}
                    ref={(el) => (storeItemRefs.current[store.id] = el)}
                    className={`flex items-center p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedStoreId === store.id
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleMarkerClick(store)}
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-md mr-3">
                      <img
                        src={store.imageUrl || storeDefaultImage}
                        alt={store.name || store.storeName}
                        className="w-full h-full object-cover rounded-md"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = storeDefaultImage
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">
                        {store.storeName || store.name}
                      </h4>
                      <div className="flex items-center flex-wrap gap-1 mt-1">
                        {store.category && (
                          <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            {store.category}
                          </span>
                        )}
                        {store.discount && (
                          <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            {store.discount} 할인
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {store.address || '주소 정보 없음'}
                      </p>
                      {/* 별점 표시 */}
                      <div className="flex items-center mt-1">
                        <div className="flex items-center text-xs text-yellow-500 mr-2">
                          <span className="mr-1">★</span>
                          <span>
                            {store.averageRating
                              ? store.averageRating.toFixed(1)
                              : '0.0'}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({store.reviews ? store.reviews.length : 0})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {loading
                    ? '가게 정보를 불러오는 중...'
                    : '표시할 가게가 없습니다.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default MapPage
