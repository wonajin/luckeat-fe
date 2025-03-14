import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import { stores } from '../data/storeData'

function StoreDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('products')
  const [store, setStore] = useState(null)
  const [showPhonePopup, setShowPhonePopup] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    // 가게 ID로 가게 정보 찾기
    const foundStore = stores.find((s) => s.id === parseInt(id))
    if (foundStore) {
      setStore(foundStore)
    }
  }, [id])

  const handleCopyClick = () => {
    if (store && store.phone) {
      navigator.clipboard
        .writeText(store.phone)
        .then(() => {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        })
        .catch((err) => {
          console.error('클립보드 복사 실패:', err)
        })
    }
  }

  if (!store) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p>가게 정보를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate(-1)} className="text-2xl mr-4">
          ←
        </button>
        <h1 className="text-xl font-semibold text-yellow-500">Luckeat</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 가게 이미지 */}
        <div className="relative">
          <img
            src={store.image}
            alt={store.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
              <img
                src={store.image}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 가게 이름 */}
        <div className="text-center mt-2 mb-4">
          <h2 className="text-xl font-bold">{store.name}</h2>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-2 text-center font-medium ${activeTab === 'products' ? 'border-b-2 border-gray-700 text-gray-700' : 'text-gray-500'}`}
            onClick={() => setActiveTab('products')}
          >
            상품 정보
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${activeTab === 'storeInfo' ? 'border-b-2 border-gray-700 text-gray-700' : 'text-gray-500'}`}
            onClick={() => setActiveTab('storeInfo')}
          >
            가게 정보
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${activeTab === 'reviews' ? 'border-b-2 border-gray-700 text-gray-700' : 'text-gray-500'}`}
            onClick={() => setActiveTab('reviews')}
          >
            리뷰({store.reviews.length})
          </button>
        </div>

        {/* 상품 정보 탭 */}
        {activeTab === 'products' && (
          <div className="p-4">
            <h3 className="font-bold mb-2">
              마감 할인 {store.products.length}개
            </h3>

            {store.products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-3 mb-4 relative"
              >
                <div className="flex justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold">{product.name}</h4>
                    <div className="mt-1">
                      <p className="text-sm line-through text-gray-400">
                        {product.originalPrice.toLocaleString()}원
                      </p>
                      <div className="flex items-center">
                        <p className="text-gray-700 font-bold">
                          {product.discountPrice.toLocaleString()}원
                        </p>
                        <p className="ml-2 text-gray-700 font-bold">
                          {product.discountRate}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                    {product.isSoldOut && (
                      <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-md flex items-center justify-center">
                        <div className="text-xl font-bold text-white">품절</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 가게 정보 탭 */}
        {activeTab === 'storeInfo' && (
          <div className="p-4">
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-bold mb-1">기본 정보</h3>
                <div className="flex items-center mb-1">
                  <span className="text-gray-600 mr-2">📍</span>
                  <p className="text-gray-600">{store.name}</p>
                </div>
                <div className="flex items-center mb-1">
                  <span className="text-gray-600 mr-2">📞</span>
                  <p className="text-gray-600">{store.phone}</p>
                </div>
                <div className="flex items-center mb-1">
                  <span className="text-gray-600 mr-2">🏷️</span>
                  <p className="text-gray-600">카테고리: {store.category}</p>
                </div>
              </div>

              <div className="border-b pb-2">
                <h3 className="font-bold mb-1">가게 소개</h3>
                <p className="text-gray-600">
                  안녕하세요, {store.name}입니다.
                  <br />
                  저희 가게는 {store.category}으로 주로 평일 7시경에
                  <br />
                  마감상품으로 남은 {store.category}을 등록합니다.
                  <br />
                  5시 이후에 미리 전화를 주시면 예약 가능하십니다.
                  <br />그 외 문의 있으시면 연락주세요! ^^
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-1">위치 정보</h3>
                <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">지도가 표시되는 영역</p>
                </div>
                <div className="mt-2 text-center">
                  <button className="text-blue-500 text-sm">
                    🗺️ 카카오맵으로 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 리뷰 탭 */}
        {activeTab === 'reviews' && (
          <div className="p-4">
            <div className="mb-4 text-center">
              <h3 className="font-bold text-xl">리뷰 평균 별점</h3>
              <div className="text-4xl font-bold mt-2">
                {store.reviews.length > 0
                  ? (
                      store.reviews.reduce(
                        (sum, review) => sum + review.rating,
                        0,
                      ) / store.reviews.length
                    ).toFixed(1)
                  : '0.0'}
                <span className="text-xl text-gray-500">/5</span>
              </div>
            </div>

            {store.reviews.length > 0 ? (
              <div className="space-y-4">
                {store.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold">{review.userName}</div>
                      <div className="text-yellow-500 flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.floor(review.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">{review.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                아직 리뷰가 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 연락하기 버튼 */}
        <div className="p-4">
          <button
            className="w-full py-3 bg-yellow-500 text-white font-bold rounded-lg"
            onClick={() => setShowPhonePopup(true)}
          >
            연락하기
          </button>
        </div>
      </div>

      {/* 전화번호 팝업 */}
      {showPhonePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <h3 className="font-bold text-lg text-center mb-4">가게 연락처</h3>
            <div className="flex items-center justify-between border rounded-lg p-3 mb-4">
              <span className="text-lg">{store.phone}</span>
              <button onClick={handleCopyClick} className="text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            {copySuccess && (
              <p className="text-sm text-green-500 text-center mb-2">
                복사되었습니다!
              </p>
            )}
            <button
              className="w-full py-2 bg-yellow-500 text-white font-bold rounded-lg"
              onClick={() => setShowPhonePopup(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  )
}

export default StoreDetailPage
