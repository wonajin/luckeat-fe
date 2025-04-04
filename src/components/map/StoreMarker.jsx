import React, { useEffect, useState, useRef } from 'react'
import { MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'
import defaultImage from '../../assets/images/luckeat-default.png'
import storeDefaultImage from '../../assets/images/제빵사디폴트이미지.png'

function StoreMarker({ store, isSelected, onClick, onDetail }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const markerRef = useRef(null)

  useEffect(() => {
    const storeImage = store.image || store.imageUrl || store.storeImg
    if (storeImage) {
      const img = new Image()
      img.onload = () => {
        setImageUrl(storeImage)
        setImageLoaded(true)
      }
      img.onerror = () => {
        setImageUrl(store.type === 'bakery' ? storeDefaultImage : defaultImage)
        setImageLoaded(true)
      }
      img.src = storeImage
    } else {
      setImageUrl(store.type === 'bakery' ? storeDefaultImage : defaultImage)
      setImageLoaded(true)
    }
  }, [store])

  const handleMarkerClick = (event) => {
    // 이벤트가 전파되지 않도록 철저하게 처리
    if (event) {
      // 기본 이벤트 취소
      if (event.preventDefault) event.preventDefault()
      if (event.stopPropagation) event.stopPropagation()
      
      // kakao maps에서 제공하는 domEvent 이벤트 전파 차단
      if (event.domEvent) {
        event.domEvent.stopPropagation()
        event.domEvent.preventDefault()
        // kakao maps 전용 전파 중단 플래그 명시적 설정
        event.domEvent._stopPropagation = true
      }
      
      // kakao maps 이벤트 전파 중단 플래그 설정
      event._stopPropagation = true
    }
    
    // 지연 없이 즉시 onClick 호출
    onClick(store)
    
    return false // 이벤트 전파 명시적 중단
  }

  const handleOverlayClose = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onClick(null)
  }

  const handleDetailClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onDetail(store.id)
  }

  const markerImage = {
    src: isSelected
      ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
      : 'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png',
    size: {
      width: 40,
      height: 52,
    },
  }

  return (
    <>
      <MapMarker
        ref={markerRef}
        position={{ lat: store.lat, lng: store.lng }}
        image={markerImage}
        onClick={handleMarkerClick}
        title={store.name || store.storeName}
        zIndex={isSelected ? 100 : 1} // 선택된 마커의 z-index 증가
        clickable={true}
      />

      {isSelected && (
        <CustomOverlayMap
          position={{ lat: store.lat, lng: store.lng }}
          yAnchor={1.4}
          xAnchor={0.5}
          zIndex={1000} // 다른 모든 요소보다 높은 z-index 값
        >
          <div
            className="bg-white p-3 rounded-lg shadow-xl border relative"
            style={{
              width: '220px',
              transform: 'translateY(-5px)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              pointerEvents: 'auto',
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            <div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
              style={{
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '10px solid white',
              }}
            />
            <button
              className="absolute -top-2 -right-2 w-6 h-6 bg-white text-gray-600 hover:text-gray-900 rounded-full shadow-md hover:bg-gray-100 transition-all text-xs flex items-center justify-center border border-gray-200"
              onClick={handleOverlayClose}
            >
              ✕
            </button>
            <div className="text-center mb-2">
              <h3 className="font-bold text-sm truncate">
                {store.name || store.storeName}
              </h3>
            </div>
            <div className="flex justify-center items-center gap-2 my-1 text-xs">
              {((store.discount && store.discount !== '0%') || store.isDiscountOpen) && (
                <span className="inline-block px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                  {store.discount || '할인중'}
                </span>
              )}
              <span className="text-yellow-500">
                ★ {(store.averageRating || store.avgRatingGoogle || 0).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-center mt-2">
              <button
                className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors font-medium"
                onClick={handleDetailClick}
              >
                상세보기
              </button>
            </div>
          </div>
        </CustomOverlayMap>
      )}
    </>
  )
}

export default StoreMarker
