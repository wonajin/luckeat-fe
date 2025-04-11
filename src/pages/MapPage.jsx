import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import { Map, MapMarker, MarkerClusterer } from 'react-kakao-maps-sdk'
import StoreMarker from '../components/map/StoreMarker'
import MapController from '../components/map/MapController'
import { getStores } from '../api/storeApi'
import defaultImage from '../assets/images/luckeat_default_image.webp'
import storeDefaultImage from '../assets/images/luckeat_default_image.webp'
import myLocationMarker from '../assets/images/my_locatoin_maker.png'
import axios from 'axios'
import SearchBar from '../components/Search/SearchBar'
import { FixedSizeList as List } from 'react-window'
import { API_BASE_URL } from '../config/apiConfig'

// 가게 항목 렌더링 컴포넌트
const StoreItem = ({ data, index, style }) => {
  const {
    store: storeList,
    selectedStoreId,
    storeItemRefs,
    handleMarkerClick,
    handleStoreDetail,
    simplifyAddress,
  } = data

  const currentStore = storeList[index]

  // 스토어가 없는 경우 빈 컴포넌트 반환
  if (!currentStore) {
    return <div style={style} className="px-2 py-0.5"></div>
  }

  // 이미지 URL 또는 기본 이미지 선택
  const getStoreImage = () => {
    const storeImage =
      currentStore.image || currentStore.imageUrl || currentStore.storeImg
    return (
      storeImage ||
      (currentStore.type === 'bakery' ? storeDefaultImage : defaultImage)
    )
  }

  // 목록 항목 클릭 시 handleMarkerClick 호출하여 마커와 동일하게 처리
  const handleStoreItemClick = () => {
    handleMarkerClick(currentStore)
  }

  return (
    <div style={style} className="px-2 py-0.5">
      <div
        key={currentStore.id}
        ref={(el) => (storeItemRefs.current[currentStore.id] = el)}
        className={`store-item flex items-center p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
          selectedStoreId === currentStore.id
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 hover:bg-gray-50'
        }`}
        onClick={handleStoreItemClick}
        data-store-id={currentStore.id}
        id={`store-item-${currentStore.id}`}
      >
        <div className="w-16 h-16 bg-gray-200 rounded-md mr-3 overflow-hidden">
          <img
            src={getStoreImage()}
            alt={currentStore.name || currentStore.storeName || '가게 이미지'}
            className="w-full h-full object-cover rounded-md"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null
              e.target.src =
                currentStore.type === 'bakery'
                  ? storeDefaultImage
                  : defaultImage
            }}
          />
        </div>

        <div className="flex-1">
          <h4
            className="font-bold text-sm truncate"
            title={currentStore.storeName || currentStore.name || '가게명 없음'}
          >
            {(currentStore.storeName || currentStore.name || '가게명 없음')
              .length > 20
              ? (
                  currentStore.storeName ||
                  currentStore.name ||
                  '가게명 없음'
                ).substring(0, 20) + '...'
              : currentStore.storeName || currentStore.name || '가게명 없음'}
          </h4>

          <div className="flex items-center flex-wrap gap-1 mt-1">
            {((currentStore.discount && currentStore.discount !== '0%') ||
              currentStore.isDiscountOpen === true) && (
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
            {simplifyAddress(currentStore.address || '주소 정보 없음').length >
            20
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
                      currentStore.averageRating || currentStore.avgRatingGoogle
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
  const [visibleStores, setVisibleStores] = useState([]) // 현재 지도에 보이는 가게들
  const [selectedStoreId, setSelectedStoreId] = useState(null)
  const [mapCenter, setMapCenter] = useState({
    lat: 33.4996, //제주 구름스퀘어
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
            reject(error)
          },
          options,
        )
      } else {
        const error = new Error(
          '이 브라우저에서는 위치 정보를 지원하지 않습니다.',
        )
        reject(error)
      }
    })
  }

  // 사용자 위치 가져오기
  useEffect(() => {
    getUserLocation().catch((error) => {
      // 위치 정보 가져오기 실패 시 제주 구름스퀘어로 기본 위치 설정
      const defaultLocation = { lat: 33.4996, lng: 126.5302 }
      setUserLocation(defaultLocation)
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
          let apiUrl = `${API_BASE_URL}/stores`

          // URL 매개변수 객체 생성
          const params = new URLSearchParams()

          // 할인중인 가게만 필터링하는 경우
          if (showDiscountOnly) {
            params.append('isDiscountOpen', 'true')
          }

          // 전체 가게 데이터를 한 번에 가져오기 위한 큰 size 값 설정
          params.append('size', '10000')
          params.append('page', '0')

          // 매개변수가 있으면 URL에 추가
          if (params.toString()) {
            apiUrl += `?${params.toString()}`
          }

          // 직접 axios로 API 호출
          const response = await axios.get(apiUrl)
          const storesData = response.data?.content || response.data || []

          if (!storesData || storesData.length === 0) {
            setStores([])
            setFilteredStores([])
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
                  if (
                    mapLoaded &&
                    window.kakao &&
                    window.kakao.maps &&
                    window.kakao.maps.services
                  ) {
                    const coords = await getCoordinatesFromAddress(
                      store.address,
                    )

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
          const storesWithLocationPromises = storesData.map(
            processStoreWithLocation,
          )
          const storesWithValidLocation = await Promise.all(
            storesWithLocationPromises,
          )

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
                    const coords = await getCoordinatesFromAddress(
                      store.address,
                    )

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

            const storesWithLocationPromises = storeList.map(
              processStoreWithLocation,
            )
            const storesWithLocation = await Promise.all(
              storesWithLocationPromises,
            )

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
            alert(
              '지도 로딩에 실패했습니다. 카카오 개발자 센터에서 현재 도메인이 등록되어 있는지 확인해주세요.',
            )
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

  // 필터링 함수 업데이트 - 검색어, 카테고리, 할인 여부로 필터링
  const filterStores = useCallback(
    (query = '', category = '', discountOnly = false) => {
      if (!stores || !Array.isArray(stores)) {
        setFilteredStores([])
        return
      }

      let result = [...stores]

      // 검색어 필터링
      if (query && query.trim() !== '') {
        const lowerQuery = query.toLowerCase()
        result = result.filter((store) => {
          const storeName = (store.storeName || store.name || '').toLowerCase()
          const address = (store.address || '').toLowerCase()
          return storeName.includes(lowerQuery) || address.includes(lowerQuery)
        })
      }

      // 카테고리 필터링
      if (category) {
        result = result.filter((store) => {
          return (
            store.categoryId === category ||
            store.category === category ||
            store.categoryName === category
          )
        })
      }

      // 할인 상품만 보기 필터링
      if (discountOnly && !showDiscountOnly) {
        result = result.filter(
          (store) =>
            store.isDiscountOpen === true ||
            (store.discount && store.discount !== '0%'),
        )
      }

      // 유효하지 않은 좌표 필터링
      result = result.filter((store) => {
        return (
          store &&
          store.id && // ID가 있는지 확인
          store.lat &&
          store.lng && // 좌표가 있는지 확인
          !isNaN(store.lat) &&
          !isNaN(store.lng) && // 숫자인지 확인
          !(store.lat === 0 && store.lng === 0)
        ) // 0,0이 아닌지 확인
      })

      // 중복 ID 제거
      const uniqueStores = []
      const seenIds = new Set()
      for (const store of result) {
        if (!seenIds.has(store.id)) {
          seenIds.add(store.id)
          uniqueStores.push(store)
        }
      }

      setFilteredStores(uniqueStores)
      
      // 현재 지도 경계 내의 가게 필터링도 실행
      if (mapRef.current) {
        updateVisibleStores(uniqueStores)
      } else {
        setVisibleStores(uniqueStores)
      }
    },
    [stores, showDiscountOnly],
  )

  // 현재 지도 경계 내에 있는 가게만 필터링하는 함수 추가
  const updateVisibleStores = useCallback((stores) => {
    if (!mapRef.current || !stores || !Array.isArray(stores)) {
      setVisibleStores(stores || [])
      return
    }

    // 현재 지도 경계 가져오기
    const bounds = mapRef.current.getBounds()
    if (!bounds) {
      setVisibleStores(stores)
      return
    }

    // 남서쪽과 북동쪽 좌표 가져오기
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()

    // 경계 내에 있는 가게만 필터링
    const inBoundsStores = stores.filter((store) => {
      if (!store.lat || !store.lng) return false
      
      const lat = parseFloat(store.lat)
      const lng = parseFloat(store.lng)
      
      return (
        lat >= sw.getLat() && 
        lat <= ne.getLat() && 
        lng >= sw.getLng() && 
        lng <= ne.getLng()
      )
    })

    setVisibleStores(inBoundsStores)
  }, [])

  // 검색어, 카테고리, 할인 필터가 변경될 때 필터링 실행
  useEffect(() => {
    filterStores(searchQuery, categoryFilter, showDiscountOnly)
  }, [searchQuery, categoryFilter, showDiscountOnly, filterStores])

  // 지도 이동 완료 후 가게 목록 업데이트 핸들러
  const handleMapIdle = useCallback(() => {
    if (mapRef.current && filteredStores.length > 0) {
      updateVisibleStores(filteredStores)
    }
  }, [filteredStores, updateVisibleStores])

  // 가게 마커 클릭 핸들러 개선
  const handleMarkerClick = useCallback(
    (store) => {
      // store가 null이면 선택 해제
      if (!store) {
        setSelectedStoreId(null)
        return
      }

      // 이미 선택된 상태에서 같은 마커를 클릭한 경우에도 상태 업데이트
      // 리액트에서 같은 값으로 setState를 호출하면 렌더링이 발생하지 않으므로
      // 명시적으로 다른 값을 설정했다가 다시 원래 값으로 설정
      if (selectedStoreId === store.id) {
        setSelectedStoreId(null)

        // 약간의 지연 후 다시 선택 상태로 설정
        setTimeout(() => {
          setSelectedStoreId(store.id)
        }, 10)
      } else {
        // 다른 마커 선택
        setSelectedStoreId(store.id)
      }

      // 지도 중심 이동
      setTimeout(() => {
        setMapCenter({ lat: store.lat, lng: store.lng })
        setMapLevel(3) // 적절한 줌 레벨로 설정
      }, 50)
    },
    [selectedStoreId],
  )

  // 지도 클릭 핸들러 개선
  const handleMapClick = (map, mouseEvent) => {
    // 마커나 오버레이 클릭의 경우 전파 중단 확인
    if (mouseEvent && mouseEvent._stopPropagation === true) {
      return
    }

    // 글로벌 마커 클릭 플래그 확인
    if (window._markerClickInProgress === true) {
      return
    }

    // 마커 선택 해제
    if (selectedStoreId) {
      setSelectedStoreId(null)
    }

    // 가게 목록 축소
    if (storeListExpanded) {
      setStoreListExpanded(false)
    }
  }

  // 줌 레벨 변경 핸들러 추가
  const handleZoomChange = (newLevel) => {
    if (!mapRef.current) {
      return
    }

    // 최소 레벨 1, 최대 레벨 14로 제한
    const level = Math.max(1, Math.min(14, newLevel))

    // 현재 지도 중심 가져오기
    const currentCenter = mapRef.current.getCenter()
    const centerPosition = {
      lat: currentCenter.getLat(),
      lng: currentCenter.getLng(),
    }

    // 현재 중심을 유지하면서 줌 레벨만 변경
    setMapCenter(centerPosition)
    setMapLevel(level)
  }

  // 가게 상세 페이지로 이동
  const handleStoreDetail = (storeId) => {
    navigate(`/store/${storeId}`)
  }

  // 사용자 위치로 이동하는 핸들러 - 현재 위치 다시 가져오기
  const handleMoveToCurrentLocation = async () => {
    if (!mapRef.current) {
      alert('지도가 초기화되지 않았습니다. 페이지를 새로고침 해주세요.')
      return
    }

    try {
      // 로딩 시작
      setLoading(true)

      // navigator를 통해 위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            const currentPosition = { lat: latitude, lng: longitude }

            // 상태 업데이트
            setUserLocation(currentPosition)

            // 지도 중심 이동 및 줌 레벨 설정
            setMapCenter({ ...currentPosition })
            setMapLevel(3)

            // 로딩 종료
            setLoading(false)
          },
          (error) => {
            console.error('현재 위치를 가져오는데 실패했습니다:', error)
            alert(
              '현재 위치를 가져올 수 없습니다. 위치 접근 권한을 확인해주세요.',
            )
            setLoading(false)
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        )
      } else {
        alert('이 브라우저에서는 위치 정보 기능을 지원하지 않습니다.')
        setLoading(false)
      }
    } catch (error) {
      console.error('현재 위치로 이동 실패:', error)
      alert('현재 위치를 가져올 수 없습니다. 위치 접근 권한을 확인해주세요.')
      setLoading(false)
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
    // 필터링된 가게 목록 업데이트
    filterStores(query, categoryFilter, showDiscountOnly)
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

    // 중복 ID 체크 및 유효한 좌표 확인
    const validStores = visibleStores.filter((store, index, self) => {
      // ID가 없는 경우 제외
      if (!store.id) return false

      // 고유 ID만 포함 (중복 제거)
      const isUniqueId = index === self.findIndex((s) => s.id === store.id)

      // 유효한 좌표인지 확인
      const hasValidCoords =
        store.lat &&
        store.lng &&
        !isNaN(store.lat) &&
        !isNaN(store.lng) &&
        !(store.lat === 0 && store.lng === 0)

      return isUniqueId && hasValidCoords
    })

    return (
      <Map
        center={mapCenter}
        level={mapLevel}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        onClick={handleMapClick}
        disableDoubleClickZoom={true}
        onDragEnd={handleMapIdle}
        onZoomChanged={handleMapIdle}
      >
        {/* 사용자 위치 마커 - 빨간색 마커 사용 */}
        {userLocation && (
          <MapMarker
            position={userLocation}
            image={{
              src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', // 카카오 기본 빨간색 마커로 변경
              size: { width: 35, height: 35 }, // 크기 약간 키움
            }}
            zIndex={10}
            onClick={() => {
              // 지도 참조가 있는지 확인
              if (mapRef.current) {
                // 현재 사용자 위치를 기준으로 중심 설정
                const currentUserLocation = { ...userLocation }
                setMapCenter(currentUserLocation)
                setMapLevel(3)
              }
            }}
          />
        )}

        {/* 가게 마커 클러스터링 설정 */}
        <MarkerClusterer
          averageCenter={true}
          minLevel={5}
          calculator={[20, 50, 100]}
          disableClickZoom={false}
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
            },
          ]}
        >
          {/* 가게 마커 - 유효성 검증된 데이터만 사용 */}
          {validStores.map((store) => (
            <StoreMarker
              key={`store-marker-${store.id}`}
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
  const itemData = useMemo(
    () => ({
      store: visibleStores,
      selectedStoreId,
      storeItemRefs,
      handleMarkerClick,
      handleStoreDetail,
      simplifyAddress,
    }),
    [
      visibleStores,
      selectedStoreId,
      handleMarkerClick,
      handleStoreDetail,
      simplifyAddress,
    ],
  )

  // 가게 목록 부분 수정 - 슬라이딩 시트 스타일로 개선
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
            <h3 className="font-bold">주변 가게 ({visibleStores.length})</h3>
          </div>

          <div className="space-y-0.5">
            {visibleStores.length > 0 ? (
              <List
                className="StoreList"
                height={listHeight - 70} // 헤더 높이 등을 고려해 조정
                itemCount={visibleStores.length}
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
                  : '표시할 가게가 없습니다. 다른 위치로 이동해보세요.'}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="지도" />

      {/* 하이라이트 스타일 추가 */}
      <style>{`
        .highlight-store {
          animation: pulse 1.5s ease-in-out;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            background-color: rgba(219, 234, 254, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
            background-color: rgba(219, 234, 254, 0.9);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            background-color: rgba(219, 234, 254, 0.5);
          }
        }
      `}</style>

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
    </div>
  )
}

export default MapPage
