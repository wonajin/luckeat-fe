import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import { stores } from '../components/store/StoreList'

function StoreDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('상품 정보')
  const [showContactModal, setShowContactModal] = useState(false)

  // 가게 데이터 찾기
  const storeData = stores.find((store) => store.id === Number(id))

  if (!storeData) {
    return <div>가게를 찾을 수 없습니다.</div>
  }

  // 평균 평점 계산
  const averageRating =
    storeData.reviewData.length > 0
      ? (
          storeData.reviewData.reduce((sum, review) => sum + review.rating, 0) /
          storeData.reviewData.length
        ).toFixed(1)
      : 0

  const handleCopyPhoneNumber = () => {
    navigator.clipboard.writeText('010-xxxx-xxxx')
    alert('전화번호가 복사되었습니다.')
    setShowContactModal(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate(-1)} className="text-2xl mr-4">
          ←
        </button>
        <h1 className="text-xl font-semibold">{storeData.name}</h1>
      </div>

      {/* 가게 이미지 */}
      <div className="relative h-64 bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center text-8xl">
          {storeData.image}
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex border-b">
        {['상품 정보', '가게 정보', `리뷰(${storeData.reviews})`].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 text-center ${
              activeTab === tab
                ? 'text-orange-500 border-b-2 border-orange-500 font-medium'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === '상품 정보' && (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-medium mb-2">
                마감 할인 {storeData.discountItems.length}개
              </h3>
              {/* 할인 상품 목록 */}
              <div className="space-y-4">
                {storeData.discountItems.map((item) => (
                  <div
                    key={item.name}
                    className="border rounded-lg p-4 relative"
                  >
                    {item.isSoldOut && (
                      <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center rounded-lg">
                        <span className="text-red-500 text-2xl font-bold">
                          품절
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-2xl font-medium mb-4">
                          {item.name}
                        </h4>
                        <div>
                          <div className="text-gray-400 line-through">
                            정상가 {item.originalPrice.toLocaleString()}원
                          </div>
                          <div className="flex items-center gap-2">
                            <span>
                              할인가 {item.discountPrice.toLocaleString()}원
                            </span>
                            <span className="text-red-500">
                              {item.discountRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
                        {item.image}
                      </div>
                    </div>
                  </div>
                ))}
                {storeData.discountItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    현재 마감 할인 상품이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === '가게 정보' && (
          <div className="p-4">
            <div className="border rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">📍</span>
                  <span>가게명: {storeData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>전화번호: 010-xxxx-xxxx</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏷️</span>
                  <span>카테고리: {storeData.category}</span>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">가게 소개</h3>
              <p className="text-gray-600">
                안녕하세요, {storeData.name}입니다.
                <br />
                저희 가게는 도넛점으로 주로 평일 7시정도에
                <br />
                마감상품으로 남은 도넛들을 등록합니다.
                <br />
                5시 이후에 미리 전화를 주시면 예약 가능하십니다.
                <br />1 외 문의 있으시다면 연락주세요! ^^
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-medium mb-2">🗺️ 카카오맵으로 보기</h3>
              <div className="h-64 bg-gray-200 rounded-lg">
                {/* 지도 컴포넌트 */}
              </div>
            </div>
          </div>
        )}

        {activeTab === `리뷰(${storeData.reviews})` && (
          <div className="p-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">리뷰 평균 별점</h2>
              <div className="text-4xl font-bold">
                {averageRating}
                <span className="text-gray-400">/5</span>
              </div>
            </div>
            <div className="space-y-4">
              {storeData.reviewData.map((review, index) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{review.user}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400">
                              {i < review.rating ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600">{review.content}</p>
                  {review.images.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {review.images.map((image, i) => (
                        <div
                          key={i}
                          className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center"
                        >
                          {image}
                        </div>
                      ))}
                    </div>
                  )}
                  {index < storeData.reviewData.length - 1 && (
                    <>
                      <div className="mt-4 text-sm text-gray-400">
                        세 번째 줄
                      </div>
                      <div className="text-sm text-gray-400">네 번째 줄</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="p-4 border-t">
        <button
          onClick={() => setShowContactModal(true)}
          className="w-full py-3 bg-orange-500 text-white rounded-lg"
        >
          연락하기
        </button>
      </div>

      {/* 연락하기 모달 */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[80%]">
            <h3 className="text-lg font-medium mb-4">연락하기</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span>010-xxxx-xxxx</span>
              <button
                onClick={handleCopyPhoneNumber}
                className="text-orange-500"
              >
                📋
              </button>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full mt-4 py-3 bg-gray-200 rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  )
}

export default StoreDetailPage
