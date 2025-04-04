import React, { useEffect, useState, useRef } from 'react'
import { MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'
import defaultImage from '../../assets/images/luckeat-default.png'
import storeDefaultImage from '../../assets/images/제빵사디폴트이미지.png'

// 카카오맵 API에 따른 StoreMarker 컴포넌트 - 이벤트 처리 강화
function StoreMarker({ store, isSelected, onClick, onDetail }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const markerRef = useRef(null)
  const overlayRef = useRef(null)
  
  // 선택 상태가 변경될 때마다 콘솔에 기록
  useEffect(() => {
    if (isSelected) {
      console.log(`마커 선택됨: ${store.id} (${store.name || store.storeName})`)
    }
  }, [isSelected, store])

  // 가게 이미지 로드
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

  // 마커 클릭 이벤트 처리기
  const handleMarkerClick = (e) => {
    // 전역 플래그 설정 - 중복 클릭 방지
    if (window._markerClickInProgress === true) {
      // 제거된 콘솔 로그
      return
    }
    
    // 플래그 설정
    window._markerClickInProgress = true
    
    // 5초 후 플래그 초기화 (보통 클릭 이벤트는 몇 백 ms 내에 처리됨)
    setTimeout(() => {
      window._markerClickInProgress = false
    }, 500)

    // 클릭 싱글톤 패턴 - 같은 마커에 대한 중복 클릭 방지
    const now = Date.now()
    const lastClickTime = window._lastMarkerClickTime || 0
    
    // 300ms 내 중복 클릭 방지
    if (now - lastClickTime < 300) {
      // 제거된 콘솔 로그
      return
    }
    
    window._lastMarkerClickTime = now
    window._lastClickedMarkerId = store.id

    // 이벤트 전파 중지를 위한 플래그 설정
    if (e) {
      // DOM 이벤트
      if (e.domEvent) {
        e.domEvent._markerClicked = true
        e.domEvent._stopPropagation = true
        e.domEvent._handled = true
        
        if (e.domEvent.stopPropagation) {
          e.domEvent.stopPropagation()
        }
      }
      
      // 원본 이벤트
      e._markerClicked = true
      e._stopPropagation = true
      e._handled = true
      
      if (e.stopPropagation) {
        e.stopPropagation()
      }
      
      // preventDefault 호출 시도
      if (e.preventDefault) {
        e.preventDefault()
      }
    }
    
    // 상위 컴포넌트에 클릭 알림
    // 약간의 지연을 두어 이벤트 충돌 최소화
    setTimeout(() => {
      if (onClick) {
        onClick(store)
      }
    }, 10)
  }

  // 인포윈도우 닫기 버튼 클릭 핸들러
  const handleOverlayClose = (e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    onClick(null)
  }

  // 상세보기 버튼 클릭 핸들러
  const handleDetailClick = (e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    onDetail(store.id)
  }

  // 마커 이미지 설정
  const markerImage = {
    src: isSelected
      ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
      : 'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png',
    size: {
      width: 24,
      height: 35,
    },
  }

  return (
    <>
      {/* 카카오맵 마커 */}
      <MapMarker
        ref={markerRef}
        position={{ lat: store.lat, lng: store.lng }}
        image={markerImage}
        onClick={handleMarkerClick}
        title={store.name || store.storeName}
        zIndex={isSelected ? 100 : 1}
        clickable={true}
      />

      {/* 선택된 마커에만 인포윈도우 표시 */}
      {isSelected && (
        <CustomOverlayMap
          ref={overlayRef}
          position={{ lat: store.lat, lng: store.lng }}
          yAnchor={1.4}
          xAnchor={0.5}
          zIndex={99999}
          clickable={true}
        >
          <div
            className="info-window bg-white p-3 rounded-lg shadow-xl border"
            style={{
              width: '220px',
              maxWidth: '250px',
              transform: 'translateY(-5px)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 15px rgba(0, 0, 0, 0.1)',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 99999
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            {/* 인포윈도우 화살표 */}
            <div
              className="info-window-arrow"
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid white',
                zIndex: 99999
              }}
            />
            
            {/* 닫기 버튼 */}
            <button
              className="close-button absolute -top-2 -right-2 w-6 h-6 bg-white text-gray-600 hover:text-gray-900 rounded-full shadow-md hover:bg-gray-100 transition-all text-xs flex items-center justify-center border border-gray-200"
              onClick={handleOverlayClose}
              aria-label="인포윈도우 닫기"
            >
              ✕
            </button>
            
            {/* 가게 이름 */}
            <div className="text-center mb-2">
              <h3 className="font-bold text-sm truncate">
                {store.name || store.storeName}
              </h3>
            </div>
            
            {/* 할인 및 평점 정보 */}
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
            
            {/* 상세보기 버튼 */}
            <div className="flex justify-center mt-2">
              <button
                className="detail-button w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors font-medium"
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
