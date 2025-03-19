import React from 'react'
import { MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'

function StoreMarker({ store, isSelected, onClick }) {
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
          <div className="bg-white p-2 rounded shadow-lg border">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src =
                      'https://via.placeholder.com/150/CCCCCC?text=이미지없음'
                  }}
                />
              </div>
              <div>
                <h4 className="font-bold text-sm">{store.name}</h4>
                <p className="text-xs">{store.discount} 할인</p>
              </div>
            </div>
          </div>
        </CustomOverlayMap>
      )}
    </React.Fragment>
  )
}

export default StoreMarker
