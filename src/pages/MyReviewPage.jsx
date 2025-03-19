import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import { stores } from '../components/store/StoreList'

function MyReviewPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('writable')

  // 임시 사용자 데이터
  const myVisitedStores = [
    { storeId: 1, visitDate: '2024.03.21' },
    { storeId: 2, visitDate: '2024.03.20' },
    { storeId: 4, visitDate: '2024.03.19' },
  ]

  // 작성 가능한 리뷰 (아직 리뷰를 작성하지 않은 방문 가게)
  const writableReviews = myVisitedStores
    .map((visit) => ({
      ...visit,
      store: stores.find((store) => store.id === visit.storeId),
    }))
    .filter(
      (visit) =>
        !visit.store.reviewData.some((review) => review.user === '내닉네임'),
    )

  // 작성한 리뷰
  const writtenReviews = stores.flatMap((store) =>
    store.reviewData
      .filter((review) => review.user === '내닉네임')
      .map((review) => ({
        ...review,
        storeName: store.name,
        storeId: store.id,
      })),
  )

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('리뷰를 삭제하시겠습니까?')) {
      alert('리뷰가 삭제되었습니다.')
    }
  }

  const handleEditReview = (reviewId) => {
    alert('리뷰 수정 기능은 준비중입니다.')
  }

  const handleWriteReview = (storeId) => {
    alert('리뷰 작성 기능은 준비중입니다.')
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate(-1)} className="text-2xl mr-4">
          ←
        </button>
        <h1 className="text-xl font-semibold text-orange-500">나의 리뷰</h1>
      </div>

      {/* 탭 */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 text-center ${
            activeTab === 'writable'
              ? 'text-orange-500 border-b-2 border-orange-500 font-medium'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('writable')}
        >
          작성 가능한 리뷰
        </button>
        <button
          className={`flex-1 py-3 text-center ${
            activeTab === 'written'
              ? 'text-orange-500 border-b-2 border-orange-500 font-medium'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('written')}
        >
          작성한 리뷰
        </button>
      </div>

      {/* 리뷰 목록 */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'writable' ? (
          <div className="space-y-4">
            {writableReviews.map((review) => (
              <div key={review.storeId} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{review.store.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {review.visitDate} 방문
                    </p>
                  </div>
                  <button
                    onClick={() => handleWriteReview(review.storeId)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm"
                  >
                    리뷰쓰기
                  </button>
                </div>
              </div>
            ))}
            {writableReviews.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                작성 가능한 리뷰가 없습니다.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {writtenReviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{review.storeName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-lg">
                            {i < review.rating ? '⭐️' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReview(review.id)}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{review.content}</p>
                {review.images.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {review.images.map((image, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center"
                      >
                        {image}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {writtenReviews.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                작성한 리뷰가 없습니다.
              </p>
            )}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}

export default MyReviewPage
