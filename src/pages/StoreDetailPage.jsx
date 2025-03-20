import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import Header from '../components/layout/Header'
import { Map, MapMarker } from 'react-kakao-maps-sdk' //카카오맵 추가
import { getStoreById } from '../api/storeApi'
import defaultImage from '../assets/images/luckeat-default.png'

function StoreDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('products')
  const [store, setStore] = useState(null)
  const [showPhonePopup, setShowPhonePopup] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false) // 주소 복사 성공 상태 추가
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`가게 상세 정보 요청 - 가게 ID: ${id}`)

        const response = await getStoreById(id)
        console.log('가게 상세 정보 응답:', response)

        if (response.success) {
          setStore(response.data)
        } else {
          console.error('가게 정보 불러오기 실패:', response.message)
          setError(response.message || '가게 정보를 불러오는데 실패했습니다')
        }
      } catch (err) {
        console.error('가게 정보 불러오기 중 예외 발생:', err)
        setError('가게 정보를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchStoreData()
  }, [id])

  // 주소 복사 기능 추가
  const handleCopyClick = () => {
    if (!store?.address) return
    navigator.clipboard
      .writeText(store.address)
      .then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
      .catch((err) => console.error('클립보드 복사 실패:', err))
  }

  // 전화번호 복사 기능
  const handlePhoneNumberCopy = () => {
    if (!store?.contactNumber) return
    navigator.clipboard
      .writeText(store.contactNumber)
      .then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
      .catch((err) => console.error('클립보드 복사 실패:', err))
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p>가게 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p>가게 정보를 찾을 수 없습니다</p>
      </div>
    )
  }

  // 할인 중인 상품만 필터링
  const openProducts = store.products?.filter((product) => product.isOpen) || []
  const closedProducts =
    store.products?.filter((product) => !product.isOpen) || []

  return (
    <div className="flex flex-col h-full">
      <Header title={store.storeName} />

      <div className="flex-1 overflow-y-auto scroll-container">
        {/* 가게 이미지 */}
        <img
          src={store.storeImg || defaultImage}
          alt={store.storeName}
          className="w-full h-48 object-cover"
          crossOrigin="anonymous"
          onError={(e) => {
            e.target.src = defaultImage
          }}
        />

        {/* 가게 이름 */}
        <h2 className="text-xl font-bold text-center mt-2 mb-4">
          {store.storeName}
        </h2>

        {/* 탭 메뉴 */}
        <div className="flex border-b">
          {['products', 'storeInfo', 'reviews'].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 text-center font-medium ${
                activeTab === tab
                  ? 'border-b-2 border-gray-700 text-gray-700'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'products' && '상품 정보'}
              {tab === 'storeInfo' && '가게 정보'}
              {tab === 'reviews' && '리뷰'}
            </button>
          ))}
        </div>

        {/* 상품 정보 탭 */}
        {activeTab === 'products' && (
          <div className="p-4">
            {/* 판매 중인 상품 */}
            <h3 className="font-bold mb-2">
              판매중인 상품 {openProducts.length}개
            </h3>
            {openProducts.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-3 mb-4 relative flex"
              >
                <div className="flex-1">
                  <h4 className="font-bold">{product.productName}</h4>
                  <p className="text-sm line-through text-gray-400">
                    {product.originalPrice.toLocaleString()}원
                  </p>
                  <p className="text-gray-700 font-bold">
                    {product.discountedPrice.toLocaleString()}원
                    <span className="text-red-500 ml-1">
                      (
                      {Math.floor(
                        (1 - product.discountedPrice / product.originalPrice) *
                          100,
                      )}
                      %)
                    </span>
                  </p>
                </div>
                <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center relative">
                  <img
                    src={
                      product.productImg
                        ? `https://dxflvza4ey8e9.cloudfront.net/product/${product.productImg}`
                        : defaultImage
                    }
                    alt={product.productName}
                    className="w-full h-full object-cover rounded-md"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.src = defaultImage
                    }}
                  />
                </div>
              </div>
            ))}

            {/* 판매 종료 상품 */}
            {closedProducts.length > 0 && (
              <>
                <h3 className="font-bold mb-2 mt-6">
                  판매 종료 상품 {closedProducts.length}개
                </h3>
                {closedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-3 mb-4 relative flex"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold">{product.productName}</h4>
                      <p className="text-sm line-through text-gray-400">
                        {product.originalPrice.toLocaleString()}원
                      </p>
                      <p className="text-gray-700 font-bold">
                        {product.discountedPrice.toLocaleString()}원
                        <span className="text-red-500 ml-1">
                          (
                          {Math.floor(
                            (1 -
                              product.discountedPrice / product.originalPrice) *
                              100,
                          )}
                          %)
                        </span>
                      </p>
                    </div>
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center relative">
                      <img
                        src={
                          product.productImg
                            ? `https://dxflvza4ey8e9.cloudfront.net/product/${product.productImg}`
                            : defaultImage
                        }
                        alt={product.productName}
                        className="w-full h-full object-cover rounded-md"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.src = defaultImage
                        }}
                      />
                      <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          품절
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* 가게 정보 탭 */}
        {activeTab === 'storeInfo' && (
          <div className="p-4 space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-bold mb-1">기본 정보</h3>
              <p className="text-gray-600">📍 {store.storeName}</p>
              <p className="text-gray-600">
                📞 {store.contactNumber || '연락처 정보 없음'}
              </p>
              <p className="text-gray-600">
                🏷️ 영업시간: 평일 ~{store.weekdayCloseTime || '정보 없음'}
              </p>
              <p className="text-gray-600 ml-10">
                주말 ~{store.weekendCloseTime || '정보 없음'}
              </p>
              <p className="text-gray-600">
                🏪 사업자번호: {store.businessNumber || '정보 없음'}
              </p>
            </div>

            {/* 가게 소개 */}
            <div className="border-b pb-2">
              <h3 className="font-bold mb-1">가게 소개</h3>
              <p className="text-gray-600">
                {store.description || '가게 소개 정보가 없습니다.'}
              </p>
            </div>

            {/* 지도 추가 */}
            <div>
              <h3 className="font-bold mb-1">위치 정보</h3>
              <Map
                center={{ lat: store.latitude, lng: store.longitude }}
                style={{ width: '100%', height: '250px' }}
                level={3}
              >
                <MapMarker
                  position={{ lat: store.latitude, lng: store.longitude }}
                  title={store.storeName}
                />
              </Map>
            </div>

            {/* 지도 아래에 주소 표시 및 복사 기능 추가 */}
            <div
              className="mt-2 text-center text-gray-700 cursor-pointer bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition"
              onClick={handleCopyClick}
            >
              {store.address || '주소 정보 없음'}
            </div>

            {/* 복사 성공 메시지 */}
            {copySuccess && (
              <p className="text-sm text-green-500 text-center mt-1">
                복사되었습니다!
              </p>
            )}
          </div>
        )}

        {/* 리뷰 탭 */}
        {activeTab === 'reviews' && (
          <div className="p-4">
            <h3 className="font-bold text-xl text-center mb-4">리뷰</h3>

            {store.reviews && store.reviews.length > 0 ? (
              <div>
                <p className="text-4xl font-bold text-center mb-6">
                  {(
                    store.reviews.reduce(
                      (sum, review) => sum + review.rating,
                      0,
                    ) / store.reviews.length
                  ).toFixed(1)}
                  <span className="text-xl text-gray-500">/5</span>
                </p>

                {store.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-3 mb-4">
                    <p className="font-bold">{review.userName}</p>
                    <p className="text-gray-600">{review.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">
                아직 리뷰가 없습니다.
              </p>
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
              <span className="text-lg">
                {store.contactNumber || '연락처 정보 없음'}
              </span>
              <button onClick={handlePhoneNumberCopy} className="text-blue-500">
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
