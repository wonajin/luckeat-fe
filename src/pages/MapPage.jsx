import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import Header from '../components/layout/Header'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import StoreMarker from '../components/map/StoreMarker'
import MapController from '../components/map/MapController'
import { getStores } from '../api/storeApi'
import { getCategories } from '../api/categoryApi'
import defaultImage from '../assets/images/luckeat-default.png'

function MapPage() {
  const navigate = useNavigate()
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

  // 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('사용자 위치:', latitude, longitude);
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('위치 정보를 가져오는데 실패했습니다:', error);
        }
      );
    } else {
      console.error('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
    }
  }, []);

  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // 카테고리 데이터 가져오기
        const categoriesData = await getCategories()
        console.log('카테고리 데이터:', categoriesData);
        
        const categoriesList = Array.isArray(categoriesData) 
          ? categoriesData 
          : (categoriesData?.data || []);
        
        // 전체 카테고리 추가
        const allCategories = [
          { id: 0, categoryName: '전체', icon: '🍽️' },
          ...categoriesList
        ];
        
        setCategories(allCategories)

        // 가게 데이터 가져오기
        const storesData = await getStores()
        console.log('가게 데이터:', storesData);
        
        const storesList = Array.isArray(storesData) 
          ? storesData 
          : (storesData?.data || []);
        
        console.log('가게 목록:', storesList);
        
        // 위도/경도 데이터가 없는 가게 필터링
        const validStores = storesList.filter(store => 
          store.lat && store.lng && 
          !isNaN(parseFloat(store.lat)) && !isNaN(parseFloat(store.lng))
        );
        
        console.log('유효한 위치 정보가 있는 가게:', validStores.length);
        
        setStores(validStores)
        setFilteredStores(validStores)
        setLoading(false)
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  // 할인 필터와 카테고리 변경 시 가게 목록 필터링
  useEffect(() => {
    if (stores.length === 0) return

    let result = [...stores]
    console.log('필터링 전 가게 수:', result.length);

    if (showDiscountOnly) {
      result = result.filter((store) => {
        const hasDiscountProducts = store.products && 
          Array.isArray(store.products) && 
          store.products.some((product) => !product.isSoldOut && product.discountRate > 0);
        
        // 원래 조건이 맞지 않으면 discount 필드로 확인
        return hasDiscountProducts || (store.discount && store.discount !== '0%');
      })
      console.log('할인 필터링 후 가게 수:', result.length);
    }

    if (selectedCategory && selectedCategory !== '전체') {
      result = result.filter((store) => {
        // categoryId 또는 category 필드 검사
        const storeCategory = store.categoryId || store.category || '';
        const categoryMatch = String(storeCategory).toLowerCase() === String(selectedCategory).toLowerCase();
        return categoryMatch;
      })
      console.log('카테고리 필터링 후 가게 수:', result.length);
    }

    setFilteredStores(result)
  }, [showDiscountOnly, selectedCategory, stores])

  // 마커 클릭 핸들러
  const handleMarkerClick = (storeId) => {
    setSelectedStoreId(storeId === selectedStoreId ? null : storeId)
  }

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
      '전체': '🍽️',
      '한식': '🍚',
      '중식': '🥢',
      '일식': '🍣',
      '양식': '🍝',
      '디저트': '🍰',
      '패스트푸드': '🍔',
      '분식': '🍜',
      '베이커리': '🥖',
      '카페': '☕',
      '퓨전음식': '🍲',
      '정육': '🥩',
      '수산': '🐟',
      '야채/과일': '🥬',
      '카페/디저트': '🍰',
      '기타': '🛒'
    }
    
    return iconMap[categoryName] || '🍽️'
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <Header title="지도" />

      {/* 카테고리 */}
      <div className="border-b overflow-x-auto whitespace-nowrap">
        <div className="inline-flex p-2">
          {categories.map((category) => {
            const categoryName = category.categoryName || category.name || '카테고리';
            return (
              <button
                key={category.id}
                className={`flex flex-col items-center px-3 ${
                  selectedCategory === categoryName
                    ? 'text-yellow-500'
                    : 'text-gray-700'
                }`}
                onClick={() => setSelectedCategory(categoryName)}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 ${
                    selectedCategory === categoryName
                      ? 'bg-yellow-100'
                      : 'bg-gray-200'
                  }`}
                >
                  <span className="text-2xl">{getCategoryIcon(categoryName)}</span>
                </div>
                <span className="text-xs">{categoryName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 검색바 */}
      <div className="px-4 py-2">
        <div className="relative">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="w-full p-2 pr-10 border rounded-lg"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </button>
        </div>
      </div>

      {/* 지도 영역 */}
      <div
        className="flex-1 relative bg-gray-100 overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {/* 카카오 지도 */}
        {mapLoaded ? (
          <Map
            center={mapCenter}
            level={mapLevel}
            style={{ width: '100%', height: '100%' }}
            ref={mapRef}
          >
            {/* 현재 위치 마커 */}
            <MapMarker
              position={mapCenter}
              image={{
                src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
                size: { width: 40, height: 44 },
                options: { offset: { x: 20, y: 44 } },
              }}
            />

            {/* 가게 마커 */}
            {filteredStores.map((store) => {
              // 위도/경도 확인 및 파싱
              const storeLat = parseFloat(store.lat);
              const storeLng = parseFloat(store.lng);
              
              // 유효한 위치 정보가 있는 경우에만 마커 렌더링
              if (isNaN(storeLat) || isNaN(storeLng)) {
                console.log(`유효하지 않은 위치 정보: ${store.name || store.storeName}, lat: ${store.lat}, lng: ${store.lng}`);
                return null;
              }
              
              return (
                <StoreMarker
                  key={store.id}
                  store={{
                    ...store,
                    lat: storeLat,
                    lng: storeLng,
                    name: store.storeName || store.name
                  }}
                  isSelected={selectedStoreId === store.id}
                  onClick={() => handleMarkerClick(store.id)}
                />
              );
            })}
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
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-700 border'
            }`}
            onClick={() => setShowDiscountOnly(!showDiscountOnly)}
          >
            <span>마감 할인중만</span>
            {showDiscountOnly && <span>✓</span>}
          </button>
        </div>

        {/* 확대/축소 버튼 */}
        <MapController onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

        {/* 가게 목록 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white rounded-t-2xl shadow-lg overflow-y-auto z-10 scroll-container">
          <div className="p-4">
            <h3 className="font-bold mb-2">
              주변 가게 ({filteredStores.length})
            </h3>
            <div className="space-y-3">
              {filteredStores.length > 0 ? (
                filteredStores.map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center p-2 border rounded-lg"
                    onClick={() => navigate(`/store/${store.id}`)}
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-md mr-3">
                      <img
                        src={defaultImage}
                        alt={store.name || store.storeName}
                        className="w-full h-full object-cover rounded-md"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = defaultImage
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{store.storeName || store.name}</h4>
                      <p className="text-xs text-gray-500">{store.address || '주소 정보 없음'}</p>
                      <p className="text-xs text-gray-700 font-bold">
                        {store.discount ? `${store.discount} 할인` : '할인 정보 없음'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {loading ? '가게 정보를 불러오는 중...' : '표시할 가게가 없습니다.'}
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
