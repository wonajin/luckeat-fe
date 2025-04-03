import React, { useEffect, useState, useRef } from 'react'
import { MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'
import defaultImage from '../../assets/images/luckeat-default.png'
import storeDefaultImage from '../../assets/images/제빵사디폴트이미지.png'

function StoreMarker({ store, isSelected, onClick, onDetail, userLocation }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [showInfoWindow, setShowInfoWindow] = useState(false)
  const prevSelectedRef = useRef(isSelected)

  // 가게 이미지 설정
  useEffect(() => {
    const storeImage = store.image || store.imageUrl || store.storeImg
    
    if (storeImage) {
      const img = new Image()
      
      img.onload = () => {
        setImageUrl(storeImage)
      }
      
      img.onerror = () => {
        setImageUrl(store.type === 'bakery' ? storeDefaultImage : defaultImage)
      }
      
      img.src = storeImage
    } else {
      setImageUrl(store.type === 'bakery' ? storeDefaultImage : defaultImage)
    }
  }, [store])

  // isSelected 상태가 변경될 때 showInfoWindow 상태 업데이트
  useEffect(() => {
    if (isSelected !== prevSelectedRef.current) {
      // 선택 상태가 true로 변경되면 인포윈도우 표시
      if (isSelected === true) {
        setShowInfoWindow(true)
      }
      
      // 선택 상태가 false로 변경되면 인포윈도우 닫기
      if (prevSelectedRef.current === true && isSelected === false) {
        setShowInfoWindow(false)
      }
      
      prevSelectedRef.current = isSelected
    }
  }, [isSelected])

  // 마커 클릭 시 실행되는 함수
  const handleMarkerClick = () => {
    // 인포윈도우 표시 상태 설정 (항상 열림)
    setShowInfoWindow(true)
    
    // 부모 컴포넌트에 알림
    onClick(store)
  }

  // 오버레이 닫기 버튼 클릭 시 실행되는 함수
  const handleOverlayClose = (e) => {
    e.stopPropagation()
    
    // 인포윈도우 닫기
    setShowInfoWindow(false)
    
    // 부모 컴포넌트에 선택 해제 알림
    onClick(null)
  }

  // 상세 페이지로 이동하는 함수
  const handleDetailClick = (e) => {
    e.stopPropagation()
    
    if (onDetail) {
      onDetail(store.id)
    }
  }

  // 주소 간소화 함수
  const simplifyAddress = (address) => {
    if (!address) return '주소 정보 없음'
    let simplified = address.replace(/^대한민국\s+/, '')
    simplified = simplified.replace(/제주특별자치도\s+/, '')
    return simplified.length > 20 
      ? simplified.substring(0, 20) + '...' 
      : simplified
  }

  // 마커 이미지 설정 (선택 여부에 따라 다른 이미지 사용)
  const markerImage = isSelected || showInfoWindow
    ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
    : 'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png'

  return (
    <>
      {/* 가게 마커 */}
      <MapMarker
        position={{ lat: store.lat, lng: store.lng }}
        image={{ 
          src: markerImage, 
          size: { 
            width: isSelected || showInfoWindow ? 35 : 28, 
            height: isSelected || showInfoWindow ? 50 : 40 
          } 
        }}
        onClick={handleMarkerClick}
        title={store.name || store.storeName}
        zIndex={isSelected || showInfoWindow ? 10 : 1}
      />

      {/* 커스텀 오버레이 (인포윈도우) */}
      {showInfoWindow && (
        <CustomOverlayMap
          position={{ lat: store.lat, lng: store.lng }}
          yAnchor={1.4}
          xAnchor={0.5}
          zIndex={999}
        >
          <div
            className="bg-white p-2 rounded-lg shadow-xl border relative"
            style={{
              width: '180px',
              transform: 'translateY(-5px)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 말풍선 화살표 */}
            <div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid white',
              }}
            />
            {/* 닫기 버튼 */}
            <button
              className="absolute -top-2 -right-2 w-5 h-5 bg-white text-gray-600 hover:text-gray-900 rounded-full shadow-md hover:bg-gray-100 transition-all text-xs flex items-center justify-center"
              onClick={handleOverlayClose}
            >
              ✕
            </button>
            {/* 가게 이름 */}
            <div className="text-center mb-1">
              <h3 className="font-bold text-sm truncate">
                {store.name || store.storeName}
              </h3>
            </div>
            {/* 할인 정보와 별점 */}
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
            <div className="flex justify-center mt-1">
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
