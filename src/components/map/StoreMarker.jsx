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

  // 현재 위치를 가져오기
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            resolve({ lat: latitude, lng: longitude })
          },
          (error) => {
            console.error('위치 정보를 가져오는데 실패했습니다:', error)
            reject(error)
          }
        )
      } else {
        const error = new Error('이 브라우저에서는 위치 정보를 지원하지 않습니다.')
        console.error(error.message)
        reject(error)
      }
    })
  }

  // 마커 클릭했을 때 즉시 로그 출력 및 선택 상태 변경
  const handleMarkerClick = () => {
    console.log('마커 클릭됨:', store.id, store.name || store.storeName)
    
    // 마커 클릭시 항상 정보를 표시하도록 변경
    if (!isSelected) {
      onClick(store)
    }
  }

  // 오버레이 닫기 핸들러
  const handleOverlayClose = (e) => {
    e.stopPropagation()
    console.log('오버레이 닫기:', store.id)
    onClick(store) // 선택 해제
  }

  // 상세 페이지로 이동 핸들러
  const handleDetailClick = (e) => {
    e.stopPropagation() // 이벤트 전파 방지
    console.log('상세 페이지로 이동:', store.id)
    if (onDetail) {
      onDetail(store.id)
    } else {
      window.location.href = `/store/${store.id}`
    }
  }

  // 길찾기 열기 - 현재 위치에서 선택한 가게까지
  const handleDirections = async (e) => {
    e.stopPropagation() // 이벤트 전파 방지
    
    try {
      // 현재 위치 정보가 없으면 현재 위치를 가져옴
      const startLocation = currentLocation || await getCurrentPosition()
      
      if (!startLocation) {
        alert('현재 위치를 확인할 수 없습니다. 위치 접근 권한을 확인해주세요.')
        return
      }
      
      const storeName = store.name || store.storeName || '선택한 가게'
      
      // 카카오맵 길찾기 URL 생성
      // 현재 위치에서 가게까지의 경로 안내
      // 형식: https://map.kakao.com/link/from,출발지명,출발위도,출발경도/to,도착지명,도착위도,도착경도
      const kakaoMapDirectUrl = `https://map.kakao.com/link/from/내 위치,${startLocation.lat},${startLocation.lng}/to/${storeName},${store.lat},${store.lng}`
      
      window.open(kakaoMapDirectUrl, '_blank')
      console.log('길찾기 URL:', kakaoMapDirectUrl)
      console.log('출발 위치:', startLocation)
      console.log('도착 위치:', { lat: store.lat, lng: store.lng })
    } catch (error) {
      console.error('길찾기 실행 중 오류 발생:', error)
      
      // 에러가 발생해도 기본 URL로 열기 (목적지만 지정)
      const kakaoMapUrl = `https://map.kakao.com/link/to/${store.name || store.storeName},${store.lat},${store.lng}`
      window.open(kakaoMapUrl, '_blank')
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
      {/* 가게 마커 - 선택된 마커는 다른 이미지 사용 */}
      <MapMarker
        position={{ lat: store.lat, lng: store.lng }}
        image={{
          src: isSelected ? SELECTED_MARKER : BLUE_MARKER,
          size: isSelected ? { width: 24, height: 35 } : { width: 28, height: 40 }
        }}
        onClick={handleMarkerClick}
        title={store.name || store.storeName}
        zIndex={isSelected ? 10 : 1}
      />

      {/* 커스텀 말풍선 오버레이 - 선택했을 때만 표시 */}
      {isSelected && (
        <CustomOverlayMap
          position={{ lat: store.lat, lng: store.lng }}
          yAnchor={1.3}
          xAnchor={0.5}
          zIndex={99} // 다른 요소보다 높은 z-index 값
        >
          <div className="bg-white p-3 rounded-lg shadow-lg border relative animate-dropIn" 
            style={{ 
              width: '220px', 
              boxShadow: '0 3px 10px rgba(0,0,0,0.3)'
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
              className="absolute -top-2 -right-2 w-6 h-6 bg-white flex items-center justify-center text-gray-600 hover:text-gray-900 rounded-full shadow-md hover:bg-gray-100 transition-all"
              onClick={handleOverlayClose}
            >
              ✕
            </button>
            
            {/* 가게 이름 */}
            <div className="text-center mb-2">
              <h3 className="font-semibold text-md truncate">{store.name || store.storeName}</h3>
            </div>
            
            {/* 별점 정보 */}
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center text-yellow-500">
                <span className="mr-1">★</span>
                <span className="text-sm">
                  {store.averageRating || store.avgRatingGoogle
                    ? (store.averageRating || store.avgRatingGoogle).toFixed(1)
                    : '0.0'}
                </span>
                <span className="text-gray-500 text-xs ml-1">
                  ({store.reviews ? store.reviews.length : (store.reviewCount || 0)})
                </span>
              </div>
            </div>
            
            {/* 할인 정보 */}
            <div className="mb-2 flex flex-wrap justify-center gap-1">
              {((store.discount && store.discount !== '0%') || store.isDiscountOpen === true) && (
                <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full animate-pulse">
                  {store.discount ? `${store.discount} 할인` : '할인중'}
                </span>
              )}
              {store.hasRandomLocation && (
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  위치 추정
                </span>
              )}
            </div>
            
            {/* 주소 정보 */}
            <p className="text-gray-500 text-xs mb-3 text-center">{simplifyAddress(store.address)}</p>
            
            {/* 버튼 영역 */}
            <div className="flex gap-2">
              {/* 상세보기 버튼 */}
              <button
                className="flex-1 px-2 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-all"
                onClick={handleDetailClick}
              >
                상세보기
              </button>
              
              {/* 길찾기 버튼 */}
              <button
                className="flex-1 px-2 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-all"
                onClick={handleDirections}
              >
                길찾기
              </button>
            </div>
          </div>
        </CustomOverlayMap>
      )}
    </>
  )
}

export default StoreMarker
