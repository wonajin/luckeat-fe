import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
import { FixedSizeList as List } from 'react-window'

// 가게 항목 렌더링 컴포넌트
const StoreItem = ({ data, index, style }) => {
  const { 
    store, 
    selectedStoreId, 
    storeItemRefs, 
    handleMarkerClick, 
    handleStoreDetail, 
    simplifyAddress 
  } = data
  
  // index가 유효하지 않거나 store가 배열이 아니거나 해당 인덱스에 항목이 없는 경우 처리
  if (!Array.isArray(store) || !store[index]) {
    return (
      <div style={style} className="px-2 py-0.5">
        <div className="flex items-center p-2 border rounded-lg border-gray-200">
          <p className="text-sm text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }
  
  const currentStore = store[index]
  
  // 가게 이미지 처리 로직
  const getStoreImage = () => {
    const storeImage = currentStore.image || currentStore.imageUrl || currentStore.storeImg;
    return storeImage || (currentStore.type === 'bakery' ? storeDefaultImage : defaultImage);
  };

  return (
    <div style={style} className="px-2 py-0.5">
      <div
        key={currentStore.id}
        ref={(el) => (storeItemRefs.current[currentStore.id] = el)}
        className={`flex items-center p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
          selectedStoreId === currentStore.id
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => handleMarkerClick(currentStore)}
      >
        <div className="w-16 h-16 bg-gray-200 rounded-md mr-3 overflow-hidden">
          <img
            src={getStoreImage()}
            alt={currentStore.name || currentStore.storeName || '가게 이미지'}
            className="w-full h-full object-cover rounded-md"
            loading="lazy"
            onError={(e) => {
              console.log(`[MapPage] 가게(${currentStore.id}) 이미지 로드 실패, 기본 이미지 사용`);
              e.target.onerror = null;
              e.target.src = currentStore.type === 'bakery' ? storeDefaultImage : defaultImage;
            }}
          />
        </div>

        <div className="flex-1">
          <h4 
            className="font-bold text-sm truncate"
            title={currentStore.storeName || currentStore.name || '가게명 없음'}
          >
            {(currentStore.storeName || currentStore.name || '가게명 없음').length > 20
              ? (
                currentStore.storeName || 
                currentStore.name || 
                '가게명 없음'
              ).substring(0, 20) + '...'
              : currentStore.storeName || currentStore.name || '가게명 없음'}
          </h4>

          <div className="flex items-center flex-wrap gap-1 mt-1">
            {((currentStore.discount && currentStore.discount !== '0%') || currentStore.isDiscountOpen === true) && (
              <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                {currentStore.discount 
                  ? `${currentStore.discount} 할인` 
                  : '마감 할인중'}
              </span>
            )}

            {currentStore.hasRandomLocation && (
              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                위치 추정
              </span>
            )}
            
            {currentStore.isGeocodedLocation && (
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                주소기반 위치
              </span>
            )}
          </div>

          <p 
            className="text-xs text-gray-500 mt-1 truncate"
            title={currentStore.address || '주소 정보 없음'}
          >
            {simplifyAddress(currentStore.address || '주소 정보 없음').length > 20
              ? simplifyAddress(
                  currentStore.address || '주소 정보 없음',
                ).substring(0, 20) + '...'
              : simplifyAddress(currentStore.address || '주소 정보 없음')}
          </p>

          <div className="flex items-center mt-1">
            <div className="flex items-center text-xs text-yellow-500 mr-2">
              <span className="mr-1">★</span>
              <span>
                {currentStore.averageRating || currentStore.avgRatingGoogle
                  ? (
                      currentStore.averageRating || 
                      currentStore.avgRatingGoogle
                    ).toFixed(1)
                  : '0.0'}
              </span>
              <span className="text-gray-500 ml-1">
                {currentStore.reviews 
                  ? Array.isArray(currentStore.reviews)
                    ? currentStore.reviews.length
                    : 0
                  : currentStore.reviewCount || 0}
              </span>
            </div>
            <button
              className="ml-auto text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full hover:bg-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleStoreDetail(currentStore.id)
              }}
            >
              상세보기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MapPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [selectedStoreId, setSelectedStoreId] = useState(null)
  const [mapCenter, setMapCenter] = useState({
    lat: 33.4996, //제주 구름스퀘어
    lng: 126.5302,
  })
  const [mapLevel, setMapLevel] = useState(3)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)
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
    { id: 4, name: '일식', icon: '🍱' },
    { id: 2, name: '중식', icon: '🥢' },
    { id: 3, name: '양식', icon: '🍝' },
    { id: 5, name: '카페/베이커리', icon: '🍞' },
    { id: 6, name: '샐러드/청과', icon: '🥗' },
  ]

  // 카테고리 선택 핸들러 추가
  const handleCategorySelect = (categoryId) => {
    // 이미 선택된 카테고리를 다시 선택하면 필터 해제
    if (categoryFilter === categoryId) {
      setCategoryFilter('')
    } else {
      setCategoryFilter(categoryId)
    }

    // 필터링된 가게 목록 업데이트
    filterStores(searchQuery, categoryId, showDiscountOnly)
  }

  // 사용자 위치 가져오기 함수 개선
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
            // 개발용 로그 주석 처리
            // console.log('사용자 위치 가져오기 성공:', location)
            setUserLocation(location)
            setMapCenter(location)
            setLocationPermissionDenied(false)
            resolve(location)
          },
          (error) => {
            console.error('위치 정보 가져오기 오류:', error.code, error.message)
            // 위치 권한 거부된 경우 플래그 설정
            if (error.code === 1) { // PERMISSION_DENIED
              setLocationPermissionDenied(true)
            }
            
            // 서울 중심부를 기본 위치로 사용
            const defaultLocation = { lat: 37.5665, lng: 126.9780 }
            setUserLocation(defaultLocation)
            setMapCenter(defaultLocation)
            reject(error)
          },
          options,
        )
      } else {
        const error = new Error('이 브라우저에서는 위치 정보를 지원하지 않습니다.')
        console.error(error.message)
        
        // 서울 중심부를 기본 위치로 사용
        const defaultLocation = { lat: 37.5665, lng: 126.9780 }
        setUserLocation(defaultLocation)
        setMapCenter(defaultLocation)
        reject(error)
      }
    })
  }

  // 사용자 위치 가져오기 - 컴포넌트 마운트 시 즉시 실행
  useEffect(() => {
    getUserLocation().catch((error) => {
      // 개발용 로그 주석 처리
      // console.log('위치 정보 가져오기 실패, 서울 중심부 위치 사용')
      // 이미 getUserLocation 내에서 기본 위치를 설정하므로 여기서는 추가 작업 필요 없음
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

          // 가게 목록 처리 - 실제 주소 위치 사용
          const processStoreWithLocation = async (store) => {
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

            // 좌표가 유효하지 않은 경우 (null, NaN, 0)
            if (
              !lat ||
              isNaN(lat) ||
              !lng ||
              isNaN(lng) ||
              (lat === 0 && lng === 0)
            ) {
              // 주소가 있는 경우, 지오코딩 API를 사용하여 좌표 가져오기 시도
              if (store.address && store.address.trim() !== '') {
                try {
                  // 맵이 로드된 후에만 지오코딩 수행
                  if (mapLoaded && window.kakao && window.kakao.maps && window.kakao.maps.services) {
                    const coords = await getCoordinatesFromAddress(store.address)
                    
                    if (coords) {
                      return {
                        ...store,
                        lat: coords.lat,
                        lng: coords.lng,
                        hasRandomLocation: false,
                        isGeocodedLocation: true,
                      }
                    }
                  }
                } catch (geoError) {
                  // 지오코딩 실패 - 무시
                }
              }
              
              // 지오코딩 실패 또는 주소 없음 - 랜덤 위치 생성
              // 현재 위치 중심으로 랜덤한 위치 생성 (반경 500m 이내)
              const centerLat = userLocation ? userLocation.lat : 37.5665
              const centerLng = userLocation ? userLocation.lng : 126.978
              
              const randomLat = centerLat + (Math.random() - 0.5) * 0.01 // 약 ±500m
              const randomLng = centerLng + (Math.random() - 0.5) * 0.01
              
              return {
                ...store,
                lat: randomLat,
                lng: randomLng,
                hasRandomLocation: true, // 랜덤 위치 표시
              }
            }

            return {
              ...store,
              lat: lat,
              lng: lng,
              hasRandomLocation: false,
            }
          }

          // 모든 가게 정보 비동기 처리
          const storesWithLocationPromises = storesData.map(processStoreWithLocation)
          const storesWithValidLocation = await Promise.all(storesWithLocationPromises)

          setStores(storesWithValidLocation)
          setFilteredStores(storesWithValidLocation)
        } catch (error) {
          // 오류가 있으면 getStores 함수로 재시도
          try {
            const storesData = await getStores()
            const storeList = Array.isArray(storesData)
              ? storesData
              : storesData?.data || []
            
            // 모든 가게 정보 비동기 처리 - 재시도 경우
            const processStoreWithLocation = async (store) => {
              // 위도와 경도 데이터 처리
              let lat = store.latitude ? parseFloat(store.latitude) : null
              let lng = store.longitude ? parseFloat(store.longitude) : null
              
              // latitude, longitude가 없으면 lat, lng 필드 확인
              if (!lat || isNaN(lat)) {
                lat = store.lat ? parseFloat(store.lat) : null
              }
              if (!lng || isNaN(lng)) {
                lng = store.lng ? parseFloat(store.lng) : null
              }
              
              // 좌표가 유효하지 않은 경우 (null, NaN, 0)
              if (
                !lat ||
                isNaN(lat) ||
                !lng ||
                isNaN(lng) ||
                (lat === 0 && lng === 0)
              ) {
                // 주소가 있는 경우, 지오코딩 시도
                if (store.address && store.address.trim() !== '' && mapLoaded) {
                  try {
                    const coords = await getCoordinatesFromAddress(store.address)
                    
                    if (coords) {
                      return {
                        ...store,
                        lat: coords.lat,
                        lng: coords.lng,
                        hasRandomLocation: false,
                        isGeocodedLocation: true,
                      }
                    }
                  } catch (geoError) {
                    // 지오코딩 실패 - 무시
                  }
                }
                
                // 지오코딩 실패 - 랜덤 위치
                const centerLat = userLocation ? userLocation.lat : 37.5665
                const centerLng = userLocation ? userLocation.lng : 126.978
                
                const randomLat = centerLat + (Math.random() - 0.5) * 0.01
                const randomLng = centerLng + (Math.random() - 0.5) * 0.01
                
                return {
                  ...store,
                  lat: randomLat,
                  lng: randomLng,
                  hasRandomLocation: true,
                }
              }
              
              return {
                ...store,
                lat: lat,
                lng: lng,
                hasRandomLocation: false,
              }
            }
            
            const storesWithLocationPromises = storeList.map(processStoreWithLocation)
            const storesWithLocation = await Promise.all(storesWithLocationPromises)
            
            setStores(storesWithLocation)
            setFilteredStores(storesWithLocation)
          } catch (retryError) {
            // 재시도 실패 - 무시
          }
        }

        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }

    // 맵이 로드된 후에만 데이터 가져오기 시작
    if (mapLoaded) {
      fetchData()
    }
  }, [userLocation, showDiscountOnly, mapLoaded])

  // 카카오맵 로드 확인
  useEffect(() => {
    // 카카오맵 SDK 로더 함수 - 더 체계적인 방식으로 개선
    const loadKakaoMap = async () => {
      // 이미 로드된 경우 바로 반환
      if (window.kakao && window.kakao.maps) {
        setMapLoaded(true)
        return
      }

      try {
        // API 키 설정
        const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY
        
        // 스크립트가 이미 존재하는지 확인
        const existingScript = document.getElementById('kakao-maps-sdk')
        if (existingScript) {
          return new Promise((resolve) => {
            existingScript.onload = () => {
              if (!window.kakao.maps) {
                window.kakao.maps.load(() => {
                  setMapLoaded(true)
                  resolve()
                })
              } else {
                setMapLoaded(true)
                resolve()
              }
            }
          })
        }
        
        // 스크립트 생성 및 로드
        return new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.id = 'kakao-maps-sdk'
          script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services,clusterer,drawing&autoload=false`
          script.async = true
          script.defer = true
          
          script.onload = () => {
            window.kakao.maps.load(() => {
              setMapLoaded(true)
              resolve()
            })
          }
          
          script.onerror = (error) => {
            alert('지도 로딩에 실패했습니다. 카카오 개발자 센터에서 현재 도메인이 등록되어 있는지 확인해주세요.')
            reject(error)
          }
          
          document.head.appendChild(script)
        })
      } catch (error) {
        alert('지도 로딩 중 오류가 발생했습니다.')
      }
    }

    loadKakaoMap()
  }, [])

  // 주소를 기반으로 좌표를 얻는 지오코딩 함수 추가
  const getCoordinatesFromAddress = async (address) => {
    if (!address || address.trim() === '') {
      return null
    }
    
    return new Promise((resolve, reject) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        reject(new Error('카카오맵 서비스가 로드되지 않았습니다.'))
        return
      }
      
      // 지오코딩 서비스 객체 생성
      const geocoder = new window.kakao.maps.services.Geocoder()
      
      // 주소로 좌표 검색
      geocoder.addressSearch(address, (result, status) => {
        // 정상적으로 검색이 완료됐으면
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = {
            lat: parseFloat(result[0].y),
            lng: parseFloat(result[0].x),
          }
          resolve(coords)
        } else {
          reject(new Error(`지오코딩 실패: ${status}`))
        }
      })
    })
  }

  // 검색어, 카테고리, 할인 필터가 변경될 때 가게 목록 필터링
  const filterStores = useCallback((query, category, discountOnly) => {
    if (stores.length === 0) return
    
    let result = [...stores]

    // 검색어 필터링
    if (query && query.trim() !== '') {
      const lowerQuery = query.toLowerCase()
      result = result.filter((store) => {
        const storeName = (store.name || store.storeName || '').toLowerCase()
        const storeAddress = (store.address || '').toLowerCase()
        return storeName.includes(lowerQuery) || storeAddress.includes(lowerQuery)
      })
    }

    // 카테고리 필터링
    if (category && category !== 'all') {
      result = result.filter((store) => store.categoryId === category)
    }

    // 할인 매장만 필터링
    if (discountOnly) {
      result = result.filter((store) => 
        store.isDiscountOpen === true || 
        (store.discount && store.discount !== '0%')
      )
    }

    // 유효하지 않은 좌표 필터링
    result = result.filter(store => {
      return store && 
             store.id && // ID가 있는지 확인
             store.lat && store.lng && // 좌표가 있는지 확인
             !isNaN(store.lat) && !isNaN(store.lng) && // 숫자인지 확인
             !(store.lat === 0 && store.lng === 0); // 0,0이 아닌지 확인
    });

    // 중복 ID 제거
    const uniqueStores = [];
    const seenIds = new Set();
    for (const store of result) {
      if (!seenIds.has(store.id)) {
        seenIds.add(store.id);
        uniqueStores.push(store);
      }
    }

    setFilteredStores(uniqueStores)
  }, [stores])

  // 검색어, 카테고리, 할인 필터가 변경될 때 필터링 실행
  useEffect(() => {
    filterStores(searchQuery, categoryFilter, showDiscountOnly)
  }, [searchQuery, categoryFilter, showDiscountOnly, filterStores])

  // 가게 마커 클릭 핸들러 - 항상 가게 목록에 표시되도록 개선
  const handleMarkerClick = useCallback((store) => {
    // store가 null이면 선택 해제
    if (!store) {
      setSelectedStoreId(null)
      return
    }
    
    // 선택된 가게 ID 설정
    setSelectedStoreId(store.id)
    
    // 가게 목록 확장 - 항상 목록이 보이도록 설정
    setStoreListExpanded(true)
    
    // 약간의 지연 후 스크롤 위치 조정 (렌더링 완료 후 스크롤하기 위함)
    setTimeout(() => {
      if (storeItemRefs.current[store.id] && storeListRef.current) {
        try {
          storeItemRefs.current[store.id]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        } catch (err) {
          console.error('스크롤 오류:', err)
        }
      }
    }, 100)
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

  // 지도 클릭 핸들러 - 명확한 예외 처리
  const handleMapClick = (map, mouseEvent) => {
    // 마커나 오버레이에서 이벤트 전파 중단된 경우 처리하지 않음
    if (mouseEvent && 
        (mouseEvent._stopPropagation === true || 
         (mouseEvent.domEvent && mouseEvent.domEvent._stopPropagation === true))) {
      return
    }
    
    // 마커 선택 해제
    if (selectedStoreId) {
      setSelectedStoreId(null)
    }
    
    // 가게 목록은 축소하지 않음 - 항상 목록이 보이도록 유지
    // 사용자가 직접 접었다 펼쳤다 할 수 있게 함
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
    // 필터링된 가게 목록 업데이트
    filterStores(query, categoryFilter, showDiscountOnly)
  }

  // 주소 간소화 및 글자수 제한 함수
  const simplifyAddress = (address) => {
    if (!address) return '주소 정보 없음'
    // "대한민국" 제거
    let simplified = address.replace(/^대한민국\s+/, '')
    // "제주특별자치도" 등 긴 도/시 이름 줄이기
    simplified = simplified.replace(/제주특별자치도\s+/, '제주 ')
    simplified = simplified.replace(/세종특별자치시\s+/, '세종 ')
    simplified = simplified.replace(/서울특별시\s+/, '서울 ')
    simplified = simplified.replace(/인천광역시\s+/, '인천 ')
    simplified = simplified.replace(/대전광역시\s+/, '대전 ')
    simplified = simplified.replace(/부산광역시\s+/, '부산 ')
    simplified = simplified.replace(/대구광역시\s+/, '대구 ')
    simplified = simplified.replace(/울산광역시\s+/, '울산 ')
    simplified = simplified.replace(/광주광역시\s+/, '광주 ')
    
    // 20자 제한 (20자가 넘으면 "..." 표시)
    if (simplified.length > 20) {
      simplified = simplified.substring(0, 20) + '...'
    }
    return simplified
  }

  // 지도 렌더링 함수 개선
  const renderMap = () => {
    if (!mapLoaded) {
      return (
        <div className="flex items-center justify-center h-full">
          <p>지도를 로딩 중입니다...</p>
        </div>
      )
    }
    
    // 유효한 가게 목록 필터링
    const validStores = filteredStores.filter((store) => {
      // ID가 없는 경우 제외
      if (!store.id) return false
      
      // 유효한 좌표인지 확인
      return store.lat && 
             store.lng && 
             !isNaN(store.lat) && 
             !isNaN(store.lng) &&
             !(store.lat === 0 && store.lng === 0)
    })

    return (
      <Map
        center={mapCenter}
        level={mapLevel}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        onClick={handleMapClick}
      >
        {/* 사용자 위치 마커 */}
        {userLocation && (
          <MapMarker
            position={userLocation}
            image={{
              src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
              size: { width: 32, height: 34 },
            }}
            zIndex={10}
            onClick={() => {
              // 현재 위치로 지도 중심 이동
              setMapCenter(userLocation)
              setMapLevel(3)
            }}
          />
        )}

        {/* 가게 마커 클러스터링 */}
        <MarkerClusterer
          averageCenter={true}
          minLevel={6}
          disableClickZoom={false}
          calculator={[20, 50, 100]}
          gridSize={60}
          styles={[
            {
              width: '50px',
              height: '50px',
              background: 'rgba(51, 153, 255, .8)',
              borderRadius: '25px',
              color: '#fff',
              textAlign: 'center',
              fontWeight: 'bold',
              lineHeight: '50px',
            },
            {
              width: '55px',
              height: '55px',
              background: 'rgba(0, 102, 204, .8)',
              borderRadius: '28px',
              color: '#fff',
              textAlign: 'center',
              fontWeight: 'bold',
              lineHeight: '55px',
            },
            {
              width: '60px',
              height: '60px',
              background: 'rgba(0, 51, 153, .8)',
              borderRadius: '30px',
              color: '#fff',
              textAlign: 'center',
              fontWeight: 'bold',
              lineHeight: '60px',
            }
          ]}
        >
          {/* 가게 마커 */}
          {validStores.map((store) => (
            <StoreMarker
              key={store.id}
              store={store}
              isSelected={selectedStoreId === store.id}
              onClick={handleMarkerClick}
              onDetail={handleStoreDetail}
            />
          ))}
        </MarkerClusterer>
      </Map>
    )
  }

  // 가상화된 목록을 위한 메모이제이션된 아이템 데이터
  const itemData = useMemo(() => ({
    store: filteredStores,
    selectedStoreId,
    storeItemRefs,
    handleMarkerClick,
    handleStoreDetail,
    simplifyAddress,
  }), [
    filteredStores,
    selectedStoreId,
    handleMarkerClick,
    handleStoreDetail,
    simplifyAddress,
  ]);
  
  // 가게 목록 렌더링 함수 개선 - 클릭 항상 허용
  const renderStoreList = () => {
    // 상태에 따른 목록 높이 계산
    const listHeight = storeListExpanded
      ? window.innerHeight * 0.6
      : window.innerHeight * 0.25
    
    return (
      <div
        ref={storeListRef}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg overflow-hidden z-10 transition-all duration-300 ${
          storeListExpanded ? 'h-3/5' : 'h-1/4'
        }`}
        onScroll={handleStoreListScroll}
        onClick={() => !storeListExpanded && setStoreListExpanded(true)}
      >
        <div className="sticky top-0 w-full flex justify-center pt-2 pb-1 bg-white z-10">
          <div 
            className="w-12 h-1 bg-gray-300 rounded-full cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation()
              setStoreListExpanded(!storeListExpanded)
            }}
          ></div>
        </div>

        <div className="p-3 pb-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">
              {selectedStoreId 
                ? '선택된 가게' 
                : `주변 가게 (${filteredStores.length})`}
            </h3>
          </div>

          <div className="space-y-0.5">
            {filteredStores.length > 0 ? (
              <List
                className="StoreList"
                height={listHeight - 70} // 헤더 높이 등을 고려해 조정
                itemCount={filteredStores.length}
                itemSize={90} // 각 아이템의 높이 축소
                width="100%"
                itemData={itemData}
              >
                {StoreItem}
              </List>
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
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <Header title="지도" />

      {/* 검색 영역을 홈페이지 스타일로 수정 */}
      <div className="px-4 py-3 border-b">
        <SearchBar
          placeholder="가게 이름 검색"
          initialValue={searchQuery}
          onSearch={handleSearch}
        />
      </div>

      {/* 카테고리 필터 영역 */}
      <div className="px-4 py-3 border-b overflow-x-auto">
        <div className="flex justify-between min-w-max">
          {categoryOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleCategorySelect(option.id)}
              className={`flex flex-col items-center justify-center mx-1 ${
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
        {renderStoreList()}
      </div>

      <Navigation />
    </div>
  )
}

export default MapPage
