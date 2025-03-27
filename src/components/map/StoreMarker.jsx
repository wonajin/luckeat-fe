import React from 'react'
import { MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'
import defaultImage from '../../assets/images/luckeat-default.png'
import storeDefaultImage from '../../assets/images/제빵사디폴트이미지.png'

function StoreMarker({ store, isSelected, onClick, onDetail }) {
  // 콘솔 로그 간소화
  console.log('마커 생성:', store.id, store.name || store.storeName)

  const handleStoreClick = (e) => {
    e.stopPropagation()
    // 상세 페이지로 직접 이동 또는 onDetail 함수 호출
    if (onDetail) {
      onDetail(store.id)
    } else {
      window.location.href = `/store/${store.id}`
    }
  }

  // 마커 이미지 상수로 정의
  const BLUE_MARKER = 'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png'
  const STAR_MARKER = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
  const RED_MARKER = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'

  // 주소 간소화 함수 - "대한민국 제주특별자치도" 등 제거
  const simplifyAddress = (address) => {
    if (!address) return '주소 정보 없음'
    
    // "대한민국" 제거
    let simplified = address.replace(/^대한민국\s+/, '')
    
    // 특별시, 광역시, 특별자치도, 도 이름 뒤 부분만 추출
    const cityRegex = /(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주특별자치도|제주도)\s+(.+)/
    const match = simplified.match(cityRegex)
    
    if (match) {
      // 시/군/구 이후 표시
      simplified = match[2]
    }
    
    return simplified
  }

  return (
    <React.Fragment>
      {/* 가게 마커 - 항상 파란색 마커 사용 */}
      <MapMarker
        position={{ lat: store.lat, lng: store.lng }}
        image={{
          src: BLUE_MARKER, // 항상 파란색 마커 사용
          size: { width: 28, height: 40 },
        }}
        onClick={onClick}
        title={store.name || store.storeName}
      />

      {/* 마커 정보 오버레이 - 선택했을 때만 표시 */}
      {isSelected && (
        <CustomOverlayMap
          position={{ lat: store.lat, lng: store.lng }}
          yAnchor={1.3}
          xAnchor={0.5}
          zIndex={999}
        >
          <div 
            className="bg-white p-2 rounded-lg shadow-lg border relative" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '160px', // 크기 더 축소
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}
          >
            {/* 화살표 */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '8px solid white',
              }}
            />

            <div className="flex flex-col gap-1">
              <div className="font-bold text-xs text-center truncate">
                {store.name || store.storeName}
              </div>
              
              <div className="w-14 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0 mx-auto">
                <img
                  src={storeDefaultImage}
                  alt={store.name || store.storeName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {simplifyAddress(store.address)}
                </p>
                
                {/* 할인 정보 표시 */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {((store.discount && store.discount !== '0%') || store.isDiscountOpen === true) && (
                    <div className="bg-yellow-100 px-1 py-0.5 rounded text-xs font-medium text-yellow-800 inline-block">
                      {store.discount ? `${store.discount} 할인` : '할인중'}
                    </div>
                  )}
                  
                  {/* 위치 정보가 추정된 경우 표시 */}
                  {store.hasRandomLocation && (
                    <div className="bg-red-100 px-1 py-0.5 rounded text-xs font-medium text-red-800 inline-block">
                      위치 추정
                    </div>
                  )}
                </div>
                
                <button
                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-1 rounded-md transition-colors font-medium"
                  onClick={handleStoreClick}
                >
                  상세보기
                </button>
              </div>
            </div>
          </div>
        </CustomOverlayMap>
      )}
    </React.Fragment>
  )
}

export default StoreMarker
