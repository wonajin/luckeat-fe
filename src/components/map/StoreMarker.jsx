import React, { useState, useEffect } from 'react'
import { MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'
import defaultImage from '../../assets/images/luckeat-default.png'
import storeDefaultImage from '../../assets/images/제빵사디폴트이미지.png'

function StoreMarker({ store, isSelected, onClick, onDetail, userLocation }) {
  // 사용자 위치 정보 상태
  const [currentLocation, setCurrentLocation] = useState(userLocation)

  // 사용자 위치가 변경되면 업데이트
  useEffect(() => {
    setCurrentLocation(userLocation)
  }, [userLocation])

  // 마커 클릭했을 때 즉시 로그 출력 및 선택 상태 변경
  const handleMarkerClick = () => {
    // 항상 인포윈도우가 표시되도록 변경 (이미 선택된 상태여도 다시 onClick 호출)
    onClick(store)
  }

  // 오버레이 닫기 핸들러
  const handleOverlayClose = (e) => {
    e.stopPropagation()
    onClick(null) // 선택 해제 - null을 전달하여 선택 상태 해제
  }

  // 상세 페이지로 이동 핸들러
  const handleDetailClick = (e) => {
    e.stopPropagation() // 이벤트 전파 방지
    if (onDetail) {
      onDetail(store.id)
    } else {
      window.location.href = `/store/${store.id}`
    }
  }

  // 마커 이미지 상수로 정의
  const BLUE_MARKER = 'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png'
  const SELECTED_MARKER = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'

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

  return (
    <>
      {/* 가게 마커 */}
      <MapMarker
        position={{ lat: store.lat, lng: store.lng }}
        image={{
          src: BLUE_MARKER,
          size: { width: 28, height: 40 }
        }}
        onClick={handleMarkerClick}
        title={store.name || store.storeName}
        zIndex={isSelected ? 10 : 1}
      />

      {/* 커스텀 말풍선 오버레이 - 선택했을 때만 표시 */}
      {isSelected && (
        <CustomOverlayMap
          position={{ lat: store.lat, lng: store.lng }}
          yAnchor={1.4}
          xAnchor={0.5}
          zIndex={999}
        >
          <div
            className="bg-white p-2 rounded-lg shadow-xl border relative"
            style={{
              width: '200px',
              height: 'auto',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
              transform: 'translateY(-5px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 화살표 (말풍선 꼬리) */}
            <div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid white'
              }}
            />

            {/* 닫기 버튼 */}
            <button
              className="absolute -top-2 -right-2 w-5 h-5 bg-white flex items-center justify-center text-gray-600 hover:text-gray-900 rounded-full shadow-md hover:bg-gray-100 transition-all text-xs"
              onClick={handleOverlayClose}
            >
              ✕
            </button>
            
            {/* 가게 이름 */}
            <div className="text-center">
              <h3 className="font-bold text-sm truncate">
                {store.name || store.storeName}
              </h3>
            </div>
            
            {/* 할인 정보와 별점을 한 줄에 표시 */}
            <div className="flex justify-center items-center gap-2 my-1 text-xs">
              {((store.discount && store.discount !== '0%') || 
                store.isDiscountOpen === true) && (
                <span className="inline-block px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                  {store.discount ? `${store.discount}` : '할인중'}
                </span>
              )}
              <span className="text-yellow-500">★ {(store.averageRating || store.avgRatingGoogle || 0).toFixed(1)}</span>
            </div>
            
            {/* 버튼 영역 */}
            <div className="flex justify-center mt-1">
              <button
                className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-all font-medium"
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
