import React from 'react'
import { MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'
import defaultImage from '../../assets/images/luckeat-default.png'
import storeDefaultImage from '../../assets/images/제빵사디폴트이미지.png'

function StoreMarker({ store, isSelected, onClick }) {
  // 콘솔 로그 간소화
  console.log('마커 생성:', store.id, store.name || store.storeName)

  const handleStoreClick = (e) => {
    e.stopPropagation()
    window.location.href = `/store/${store.id}`
  }

  return (
    <React.Fragment>
      {/* 가게 마커 - 파란색 마커 사용 */}
      <MapMarker
        position={{ lat: store.lat, lng: store.lng }}
        image={{
          src: isSelected
            ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png' // 선택 시 노란 별표 마커
            : 'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png', // 기본 파란색 마커
          size: isSelected
            ? { width: 24, height: 35 }
            : { width: 28, height: 40 },
        }}
        onClick={onClick}
        title={store.name || store.storeName}
      />

      {/* 마커 정보 오버레이 - 선택했을 때만 표시 */}
      {isSelected && (
        <CustomOverlayMap
          position={{ lat: store.lat, lng: store.lng }}
          yAnchor={1.2}
          zIndex={20}
        >
          <div className="bg-white p-3 rounded-lg shadow-lg border max-w-xs relative">
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

            <div className="flex items-start gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                <img
                  src={store.storeImg ? store.storeImg : (store.imageUrl || storeDefaultImage)}
                  alt={store.name || store.storeName}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = storeDefaultImage
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate">
                  {store.name || store.storeName}
                </h4>
                <div
                  className="text-xs mt-1 px-2 py-1 rounded inline-block"
                  style={{ backgroundColor: '#E3F2FD', color: '#1E88E5' }}
                >
                  {store.category || '기타'}
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {store.address || '주소 정보 없음'}
                </p>
                {store.discount && (
                  <div className="mt-1 bg-yellow-100 px-2 py-1 rounded text-xs font-medium text-yellow-800 inline-block">
                    {store.discount} 할인
                  </div>
                )}
                {store.products && store.products.length > 0 && (
                  <p className="text-xs text-gray-700 mt-1">
                    상품 {store.products.length}개
                  </p>
                )}
                <button
                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors"
                  onClick={handleStoreClick}
                >
                  가게 상세보기
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
