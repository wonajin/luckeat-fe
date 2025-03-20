import React from 'react'
import { MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'
import defaultImage from '../../assets/images/luckeat-default.png'

function StoreMarker({ store, isSelected, onClick }) {
  // 카테고리에 따라 마커 색상 결정
  const getCategoryColor = (category) => {
    const categoryMap = {
      한식: '#FF5733',
      중식: '#C70039',
      일식: '#0066CC',
      양식: '#FFC300',
      디저트: '#FF99CC',
      패스트푸드: '#F4D03F',
      분식: '#FF6347',
      베이커리: '#D35400',
      카페: '#7D3C98',
      퓨전음식: '#8E44AD',
      정육: '#C0392B',
      수산: '#2980B9',
      '야채/과일': '#27AE60',
      '카페/디저트': '#FF69B4',
      기타: '#95A5A6',
    }

    return categoryMap[category] || '#1E88E5' // 기본 색상
  }

  const categoryColor = getCategoryColor(store.category || '기타')

  return (
    <React.Fragment>
      <MapMarker
        position={{ lat: store.lat, lng: store.lng }}
        onClick={onClick}
        image={{
          src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
          size: { width: 24, height: 35 },
        }}
      />

      {isSelected && (
        <CustomOverlayMap
          position={{ lat: store.lat, lng: store.lng }}
          yAnchor={1.2}
        >
          <div className="bg-white p-3 rounded-lg shadow-lg border max-w-xs">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                <img
                  src={defaultImage}
                  alt={store.name}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = defaultImage
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate">{store.name}</h4>
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
                  className="mt-2 w-full bg-yellow-500 text-white text-xs py-1 px-2 rounded"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = `/store/${store.id}`
                  }}
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
