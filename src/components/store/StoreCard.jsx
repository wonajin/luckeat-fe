import React from 'react'
import { Link } from 'react-router-dom'

function StoreCard({ store }) {
  if (!store) return null

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm mb-4">
      <div className="relative">
        {/* 가게 이미지 */}
        <div className="h-40 bg-gray-200 flex items-center justify-center">
          {store.storeImg ? (
            <img 
              src={store.storeImg} 
              alt={store.storeName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl">🏪</div>
          )}
        </div>
        
        {/* 할인 상태 표시 */}
        {store.isDiscountOpen && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
            마감 할인중
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* 가게 정보 */}
        <h3 className="font-bold text-lg mb-1">{store.storeName}</h3>
        
        <div className="text-sm text-gray-600 mb-2">
          <p>{store.storeAddress}</p>
          {store.telephone && <p>전화번호: {store.telephone}</p>}
        </div>
        
        {/* 통계 정보 */}
        <div className="flex gap-2 text-sm text-gray-500 mt-2">
          <span>리뷰 {store.reviewCount || 0}</span>
          <span>•</span>
          <span>공유 {store.shareCount || 0}</span>
        </div>
        
        {/* 가게 상세 페이지로 이동 버튼 */}
        <Link 
          to={`/stores/${store.storeId}`}
          className="block w-full mt-3 py-2 bg-[#F7B32B] hover:bg-[#E09D18] text-white text-center font-bold rounded transition-colors"
        >
          가게 상세 보기
        </Link>
      </div>
    </div>
  )
}

export default StoreCard 