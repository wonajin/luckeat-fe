import React, { useEffect, useState } from 'react'
import { MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'
import defaultImage from '../../assets/images/luckeat-default.png'
import storeDefaultImage from '../../assets/images/제빵사디폴트이미지.png'

function StoreMarker({ store, isSelected, onClick, onDetail }) {
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    const storeImage = store.image || store.imageUrl || store.storeImg
    if (storeImage) {
      const img = new Image()
      img.onload = () => setImageUrl(storeImage)
      img.onerror = () => setImageUrl(store.type === 'bakery' ? storeDefaultImage : defaultImage)
      img.src = storeImage
    } else {
      setImageUrl(store.type === 'bakery' ? storeDefaultImage : defaultImage)
    }
  }, [store])

  const handleMarkerClick = () => {
    onClick(store)
  }

  const handleOverlayClose = (e) => {
    e.stopPropagation()
    onClick(null)
  }

  const handleDetailClick = (e) => {
    e.stopPropagation()
    onDetail(store.id)
  }

  const markerImage = isSelected
    ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
    : 'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png'

  return (
    <>
      <MapMarker
        position={{ lat: store.lat, lng: store.lng }}
        image={{ src: markerImage, size: { width: 32, height: 48 } }}
        onClick={handleMarkerClick}
        title={store.name || store.storeName}
        zIndex={isSelected ? 10 : 1}
      />

      {isSelected && (
        <CustomOverlayMap
          position={{ lat: store.lat, lng: store.lng }}
          yAnchor={1.4}
          xAnchor={0.5}
          zIndex={999}
        >
          <div
            className="bg-white p-2 rounded-lg shadow-xl border relative"
            style={{ width: '180px', transform: 'translateY(-5px)' }}
            onClick={(e) => e.stopPropagation()}
          >
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
            <button
              className="absolute -top-2 -right-2 w-5 h-5 bg-white text-gray-600 hover:text-gray-900 rounded-full shadow-md hover:bg-gray-100 transition-all text-xs flex items-center justify-center"
              onClick={handleOverlayClose}
            >
              ✕
            </button>
            <div className="text-center mb-1">
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
