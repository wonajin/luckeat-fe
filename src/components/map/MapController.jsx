import React from 'react'
import myLocationMarker from '../../assets/images/my_locatoin_maker.png'

/**
 * 지도 컨트롤러 컴포넌트
 */
const MapController = ({ onMoveToCurrentLocation, onZoomIn, onZoomOut }) => {
  // 확대/축소 버튼 클릭 시 이벤트 전파 방지 추가
  const handleZoomIn = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    onZoomIn();
  };
  
  const handleZoomOut = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    onZoomOut();
  };
  
  const handleLocationButton = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    onMoveToCurrentLocation();
  };
  
  return (
    <div className="flex flex-col space-y-2">
      {/* 내 위치로 이동 버튼 */}
      <button
        onClick={handleLocationButton}
        className="bg-white rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
        aria-label="내 위치로 이동"
      >
        <img src={myLocationMarker} alt="내 위치" className="w-6 h-6" />
      </button>

      {/* 확대 버튼 */}
      <button
        onClick={handleZoomIn}
        className="bg-white rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
        aria-label="지도 확대"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* 축소 버튼 */}
      <button
        onClick={handleZoomOut}
        className="bg-white rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
        aria-label="지도 축소"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
    </div>
  )
}

export default MapController
