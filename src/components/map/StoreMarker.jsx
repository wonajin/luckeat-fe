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

  // 마커 클릭 핸들러 - 이벤트 전파 완전 차단 및 즉시 호출
  const handleMarkerClick = (map, marker, event) => {
    console.log('마커 직접 클릭됨:', store.id) // 디버깅용
    
    try {
      // 중복 클릭 방지를 위한 전역 플래그 설정
      if (window._markerClickInProgress === true) {
        console.log('이전 마커 클릭 처리 중, 무시:', store.id)
        return false
      }
      
      // 플래그 설정: 마커 클릭 처리 중
      window._markerClickInProgress = true
      
      // 일정 시간 후 플래그 해제 - 연속 클릭 방지
      setTimeout(() => {
        window._markerClickInProgress = false
      }, 500)
      
      // 이벤트 전파 중단을 위한 처리 강화
      if (event) {
        // DOM 이벤트 중단
        if (event.domEvent) {
          // DOM 이벤트 완전 중단
          event.domEvent.stopPropagation()
          event.domEvent.preventDefault()
          event.domEvent.stopImmediatePropagation && event.domEvent.stopImmediatePropagation()
          
          // 카카오맵 내부 처리를 위한 플래그 (맵 클릭 핸들러에서 확인)
          event.domEvent._stopPropagation = true
          event.domEvent._handled = true
          event.domEvent._markerClicked = true
          event.domEvent._isMarkerClick = true // 추가 플래그
        }
        
        // 카카오맵 이벤트 중단
        if (typeof event.stopPropagation === 'function') {
          event.stopPropagation()
        }
        if (typeof event.preventDefault === 'function') {
          event.preventDefault()
        }
        if (typeof event.stopImmediatePropagation === 'function') {
          event.stopImmediatePropagation()
        }
        
        // 특수 플래그 설정 - 지도 컴포넌트에서 이 플래그로 식별
        event._stopPropagation = true
        event._markerClicked = true
        event._handled = true
        event._isMarkerClick = true // 추가 플래그
        
        // 원본 이벤트가 있다면 그것도 중단
        if (event.originalEvent) {
          event.originalEvent.stopPropagation && event.originalEvent.stopPropagation()
          event.originalEvent.preventDefault && event.originalEvent.preventDefault()
          event.originalEvent.stopImmediatePropagation && event.originalEvent.stopImmediatePropagation()
        }
      }
      
      // 맵 이벤트 중단을 위한 추가 로직
      if (map && map.getNode) {
        const mapNode = map.getNode();
        if (mapNode) {
          const lastClickTime = mapNode._lastMarkerClickTime || 0;
          const now = Date.now();
          mapNode._lastMarkerClickTime = now;
          mapNode._lastClickedMarkerId = store.id;
          
          // 마커 클릭 플래그 설정 - 이후 지도 클릭 이벤트 차단용
          mapNode._markerWasClicked = true;
          
          // 50ms 이내의 클릭은 중복으로 간주
          if (now - lastClickTime < 50) {
            console.log('중복 클릭 무시:', store.id);
            return false;
          }
          
          // 일정 시간 후에 지도 클릭 처리 다시 활성화
          setTimeout(() => {
            if (mapNode._lastClickedMarkerId === store.id) {
              mapNode._markerWasClicked = false;
            }
          }, 500);
        }
      }
    } catch (err) {
      console.error('마커 클릭 이벤트 처리 오류:', err);
      window._markerClickInProgress = false; // 오류 발생 시 플래그 초기화
    }
    
    // 싱글톤 패턴으로 중복 이벤트 방지
    const currentTime = Date.now();
    if (window._lastStoreMarkerClickTime && 
        currentTime - window._lastStoreMarkerClickTime < 300 &&
        window._lastClickedStoreId === store.id) {
      console.log('마커 중복 클릭 무시 (싱글톤):', store.id);
      return false;
    }
    
    window._lastStoreMarkerClickTime = currentTime;
    window._lastClickedStoreId = store.id;
    
    // 지도 클릭 이벤트 캡처 방지를 위한 타임아웃 처리
    setTimeout(() => {
      // 즉시 부모 컴포넌트에 알림 (약간의 지연으로 이벤트 충돌 방지)
      onClick(store);
    }, 10);
    
    // 이벤트 버블링 중단을 확실히 함
    return false;
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
