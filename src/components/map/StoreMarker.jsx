import React, { useState, useEffect } from 'react'
import { MapMarker, InfoWindow } from 'react-kakao-maps-sdk'
import defaultImage from '../../assets/images/luckeat-default.png'
import storeDefaultImage from '../../assets/images/제빵사디폴트이미지.png'

function StoreMarker({ store, isSelected, onClick, onDetail }) {
  // 마커 클릭 핸들러
  const handleMarkerClick = () => {
    console.log('마커 클릭됨:', store.id, store.name || store.storeName);
    onClick(store);
  };

  // 인포윈도우 닫기 핸들러
  const handleInfoWindowClose = () => {
    console.log('인포윈도우 닫기:', store.id);
    onClick(store); // 토글 동작을 위해 다시 onClick 호출
  };

  // 상세 페이지로 이동 핸들러
  const handleDetailClick = (e) => {
    e.stopPropagation(); // 이벤트 전파 방지
    console.log('상세 페이지로 이동:', store.id);
    if (onDetail) {
      onDetail(store.id)
    } else {
      window.location.href = `/store/${store.id}`
    }
  };

  // 마커 이미지 상수로 정의
  const BLUE_MARKER = 'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png'

  // 주소 간소화 함수 - "대한민국 제주특별자치도" 등 제거
  const simplifyAddress = (address) => {
    if (!address) return '주소 정보 없음'
    
    // "대한민국" 제거
    let simplified = address.replace(/^대한민국\s+/, '')
    
    // "제주특별자치도" 제거
    simplified = simplified.replace(/제주특별자치도\s+/, '')
    
    return simplified
  }

  return (
    <>
      {/* 가게 마커 */}
      <MapMarker
        position={{ lat: store.lat, lng: store.lng }}
        image={{
          src: BLUE_MARKER,
          size: { width: 28, height: 40 },
        }}
        onClick={handleMarkerClick}
        title={store.name || store.storeName}
      />

      {/* InfoWindow - 선택했을 때만 표시 */}
      {isSelected && (
        <InfoWindow
          position={{ lat: store.lat, lng: store.lng }}
          removable={true}
          onClose={handleInfoWindowClose}
        >
          <div className="p-2" style={{ width: '180px' }}>
            {/* 가게 이름 */}
            <div className="text-center mb-2">
              <h3 className="font-bold text-xs truncate">{store.name || store.storeName}</h3>
            </div>
            
            {/* 가게 이미지 */}
            <div className="w-full h-[100px] bg-gray-100 rounded-md overflow-hidden mb-2">
              <img 
                src={store.image || storeDefaultImage} 
                alt={store.name || store.storeName}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* 할인 정보 */}
            <div className="mb-2 flex flex-wrap gap-1">
              {((store.discount && store.discount !== '0%') || store.isDiscountOpen === true) && (
                <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
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
            <p className="text-gray-500 text-xs mb-2">{simplifyAddress(store.address)}</p>
            
            {/* 상세보기 버튼 */}
            <button
              className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-all"
              onClick={handleDetailClick}
            >
              가게 상세페이지
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  )
}

export default StoreMarker
