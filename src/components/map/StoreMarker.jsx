import React from 'react'
import { MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'
import defaultImage from '../../assets/images/luckeat-default.png'

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
