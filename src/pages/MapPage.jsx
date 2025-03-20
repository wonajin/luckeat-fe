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
import axios from 'axios'

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
  }) // 기본 위치(제주도)
  const [mapLevel, setMapLevel] = useState(3)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const mapRef = useRef(null)
  const storeListRef = useRef(null)

  const storeItemRefs = useRef({})

  const API_BASE_URL = 'http://3.34.255.222:8080'

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          console.log('사용자 위치:', latitude, longitude)
          setUserLocation({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.error('위치 정보를 가져오는데 실패했습니다:', error)
        },
      )
    } else {
      console.error('이 브라우저에서는 위치 정보를 지원하지 않습니다.')
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const categoriesData = await getCategories()
        console.log('카테고리 데이터:', categoriesData)

        const categoriesList = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData?.data || []

        const allCategories = [
          { id: 0, name: '전체', icon: '🍽️' },
          ...categoriesList,
        ]

        setCategories(allCategories)

        console.log('가게 정보 불러오는 중...')
        try {
          let apiUrl = `${API_BASE_URL}/api/v1/stores`
          if (showDiscountOnly) {
            apiUrl += '?isDiscountOpen=true'
          }

          const response = await axios.get(apiUrl)
          const storesData = response.data
          console.log('가게 데이터:', storesData)

          if (!storesData || storesData.length === 0) {
            console.log('가게 데이터가 없습니다.')
            setLoading(false)
            return
          }

          const storesWithValidLocation = storesData.map((store) => {
            let lat = store.lat ? parseFloat(store.lat) : null
            let lng = store.lng ? parseFloat(store.lng) : null

            const JEJU_DEFAULT_LAT = 33.450705
            const JEJU_DEFAULT_LNG = 126.570677

            if (!lat || isNaN(lat) || !lng || isNaN(lng) || (lat === 0 && lng === 0)) {
              console.log(`매장 ${store.id}(${store.name}): 유효한 좌표 없음, 랜덤 위치 생성`)
              const randomLat = JEJU_DEFAULT_LAT + (Math.random() - 0.5) * 0.01
              const randomLng = JEJU_DEFAULT_LNG + (Math.random() - 0.5) * 0.01
              return { ...store, lat: randomLat, lng: randomLng, hasRandomLocation: true }
            }

            return { ...store, lat: lat, lng: lng, hasRandomLocation: false }
          })

          console.log(`총 ${storesWithValidLocation.length}개 매장 정보 로드 완료`)
          setStores(storesWithValidLocation)
          setFilteredStores(storesWithValidLocation)
        } catch (error) {
          console.error('가게 정보 로드 실패:', error)
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

  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        setMapLoaded(true)
      } else {
        console.log('카카오맵 SDK를 로드합니다...')
        const script = document.createElement('script')

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
          alert('지도 로딩에 실패했습니다. 카카오 개발자 센터에서 현재 도메인이 등록되어 있는지 확인해주세요.')
        }

        document.head.appendChild(script)
      }
    }

    loadKakaoMap()
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Header title="지도" />

      <div className="flex-1 relative">
        {mapLoaded ? (
          <Map center={mapCenter} level={mapLevel} style={{ width: '100%', height: '100%' }} ref={mapRef}>
            {userLocation && (
              <MapMarker position={userLocation} title="내 위치" />
            )}
            {filteredStores.map((store) => (
              <StoreMarker key={store.id} store={store} isSelected={selectedStoreId === store.id} />
            ))}
          </Map>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>지도를 로딩 중입니다...</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white rounded-t-2xl shadow-lg overflow-y-auto z-10">
        <div className="p-4">
          <h3 className="font-bold mb-2">주변 가게 ({filteredStores.length})</h3>
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <div key={store.id} className="p-2 border rounded-lg cursor-pointer">
                <p>{store.storeName || store.name}</p>
                <p>{store.address || '주소 정보 없음'}</p>
              </div>
            ))
          ) : (
            <p>표시할 가게가 없습니다.</p>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default MapPage
