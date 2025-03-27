import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import Header from '../components/layout/Header'
import { Map, MapMarker } from 'react-kakao-maps-sdk' //카카오맵 추가
import { getStoreById, increaseStoreShare } from '../api/storeApi'
import defaultImage from '../assets/images/luckeat-default.png'
import bakerDefaultImage from '../assets/images/제빵사디폴트이미지.png'
import ScrollTopButton from '../components/common/ScrollTopButton'

function StoreDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('map')
  const [store, setStore] = useState(null)
  const [showPhonePopup, setShowPhonePopup] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false) // 주소 복사 성공 상태 추가
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showScrollTopButton, setShowScrollTopButton] = useState(false)
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mainContainerRef = useRef(null)
  const mapRef = useRef(null)
  const productsRef = useRef(null)
  const storeInfoRef = useRef(null)
  const reviewsRef = useRef(null)
  
  // Google Maps 이미지 URL인지 확인하는 함수
  const isGoogleMapsImage = (url) => {
    return url && url.includes('maps.googleapis.com/maps/api/place/photo');
  }

  // 이미지 URL을 처리하는 함수
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return defaultImage;

    // 구글 이미지 URL인 경우 CORS 이슈가 있을 수 있으므로 특별히 처리
    if (isGoogleMapsImage(imageUrl)) {
      console.log('구글 맵스 이미지 URL 감지:', imageUrl);

      // 가게 이름이 있으면 그에 맞는 일반적인 이미지를 표시
      // 예: 베이커리 가게인 경우 베이커리 이미지
      if (store?.storeName?.includes('베이커리') ||
          store?.storeName?.includes('빵집') ||
          store?.storeName?.includes('빵') ||
          store?.storeName?.includes('Baguette') ||
          store?.storeName?.includes('베이글') ||
          store?.storeName?.includes('Bakery')) {
        return bakerDefaultImage;
      }

      // 그 외의 경우 기본 이미지 사용
      return defaultImage;
    }

    return imageUrl;
  }

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`가게 상세 정보 요청 - 가게 ID: ${id}`)

        const response = await getStoreById(id)
        console.log('가게 상세 정보 응답:', response)

        if (response.success) {
          const storeData = response.data;

          // 이미지 URL 확인 및 디버깅
          console.log('가게 이미지 URL:', storeData.storeImg);

          // 이미지 미리 로드 시도
          if (storeData.storeImg) {
            const img = new Image();
            img.onload = () => {
              console.log('이미지 미리 로드 성공:', storeData.storeImg);
            };
            img.onerror = () => {
              console.error('이미지 미리 로드 실패:', storeData.storeImg);
              // 이미지 로드 실패 시, 이미지 URL을 null로 설정해서 기본 이미지 표시
              storeData.storeImg = null;
            };
            img.src = storeData.storeImg;
          }

          // 구글 이미지인지 확인
          if (isGoogleMapsImage(storeData.storeImg)) {
            console.log('구글 맵스 이미지 URL 감지됨');
          }

          // JSON으로 응답 객체 로깅 (민감 정보 제외)
          const safeStoreData = { ...storeData };
          console.log('가게 데이터:', JSON.stringify(safeStoreData, null, 2));

          setStore(storeData)
          console.log('지도 정보:', storeData.latitude, storeData.longitude) // 디버깅용
          // 맵 로드 완료 처리
          setMapLoaded(true)
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

  // 카카오맵 스크립트 로드 확인
  useEffect(() => {
    if (!window.kakao?.maps) {
      console.log('카카오맵 API가 로드되지 않았습니다. 다시 로드합니다.')
      // 카카오맵 스크립트 로드
      const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY 
      const script = document.createElement('script')
      script.async = true
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false`
      document.head.appendChild(script)
      
      script.onload = () => {
        window.kakao.maps.load(() => {
          console.log('카카오맵 API 로드 완료')
          setMapLoaded(true)
        })
      }
    } else {
      console.log('카카오맵 API가 이미 로드되어 있습니다.')
      setMapLoaded(true)
    }
  }, [])

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

  // 공유 기능
  const handleShareClick = () => {
    setShowShareModal(true)
    // 공유 카운트 증가 API 호출
    try {
      increaseStoreShare(id)
        .then(() => {
          console.log('공유 카운트 증가 성공')
        })
        .catch((err) => {
          console.error('공유 카운트 증가 실패:', err)
        })
    } catch (error) {
      console.error('공유 카운트 증가 중 오류:', error)
    }
  }

  // 공유 링크 복사
  const handleCopyShareLink = () => {
    const shareUrl = store.storeUrl || `${window.location.origin}/store/${id}`
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
      .catch((err) => console.error('클립보드 복사 실패:', err))
  }

  // 스크롤 관련 함수
  const handleScroll = () => {
    // 스크롤 이벤트는 유지하되 맨 위로 버튼 관련 코드 제거
  }

  // 탭 클릭 시 해당 섹션으로 스크롤
  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setTimeout(() => {
      if (tab === 'map' && mapRef.current) {
        mapRef.current.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'products' && productsRef.current) {
        productsRef.current.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'storeInfo' && storeInfoRef.current) {
        storeInfoRef.current.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'reviews' && reviewsRef.current) {
        reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  // 리뷰 모달 표시 - 이제 탭으로 대체되므로 삭제 또는 수정 가능
  const handleReviewClick = () => {
    setActiveTab('reviews');
    setTimeout(() => {
      if (reviewsRef.current) {
        reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
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
    <div className="flex flex-col h-full relative">
      <Header title={store.storeName} />

      <div 
        className="flex-1 overflow-y-auto scroll-container" 
        ref={mainContainerRef}
        onScroll={handleScroll}
      >
        {/* 가게 이미지 */}
        <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
          {(store.storeImg || store.imageUrl) ? (
            <img
              src={store.storeImg ? store.storeImg : (store.imageUrl || defaultImage)}
              alt={store.storeName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.error('이미지 로드 오류:', store.storeImg);
                e.target.onerror = null; // 무한 루프 방지
                e.target.src = defaultImage;
              }}
            />
          ) : (
            <div className="text-4xl text-gray-400">🏪</div>
          )}
        </div>

        {/* 가게 이름 및 공유 버튼 */}
        <div className="px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-bold">{store.storeName}</h2>
          <button 
            className="p-2 bg-gray-100 rounded-full"
            onClick={handleShareClick}
          >
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </div>

        {/* 별점 표시 */}
        <div className="px-4 pb-2 flex items-center">
          <div className="flex items-center">
            <span className="font-bold text-base">
              {store.avgRatingGoogle?.toFixed(1) || "0.0"}
            </span>
            <div className="flex ml-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    (store.avgRatingGoogle || 0) >= star
                      ? 'text-yellow-500'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="ml-1 text-gray-500 text-sm">
              ({store.reviews ? store.reviews.length : 0})
            </span>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="sticky top-0 bg-white z-10 shadow-sm">
          <div className="flex border-b">
            {['map', 'products', 'storeInfo', 'reviews'].map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-2 text-center font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-yellow-500 text-yellow-500'
                    : 'text-gray-500'
                }`}
                onClick={() => handleTabClick(tab)}
              >
                {tab === 'map' && '지도'}
                {tab === 'products' && '상품 정보'}
                {tab === 'storeInfo' && '가게 정보'}
                {tab === 'reviews' && '리뷰'}
              </button>
            ))}
          </div>
        </div>

        {/* 지도 섹션 */}
        <div ref={mapRef} id="map-section" className="p-3 space-y-3">
          {/* 지도 추가 */}
          <div>
            <h3 className="font-bold mb-1">위치 정보</h3>
            <div 
              id="map-container" 
              className="w-full border rounded overflow-hidden"
              style={{ height: '180px', backgroundColor: '#f5f5f5' }}
            >
              {store?.latitude && store?.longitude && window.kakao?.maps ? (
                <Map
                  center={{ 
                    lat: parseFloat(store.latitude), 
                    lng: parseFloat(store.longitude) 
                  }}
                  style={{ width: '100%', height: '100%' }}
                  level={3}
                >
                  <MapMarker
                    position={{ 
                      lat: parseFloat(store.latitude), 
                      lng: parseFloat(store.longitude) 
                    }}
                    title={store.storeName}
                  />
                </Map>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <p className="text-gray-500">지도 정보를 불러오는 중...</p>
                </div>
              )}
            </div>
          </div>

          {/* 지도 아래에 주소 표시 및 복사 기능 추가 */}
          <div
            className="mt-2 text-center text-gray-700 cursor-pointer bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition"
            onClick={handleCopyClick}
          >
            {store.address || '주소 정보 없음'}
          </div>

          {/* 카카오맵으로 보기 및 길찾기 버튼 */}
          {store.latitude && store.longitude && (
            <div className="flex gap-2 mt-2">
              <a
                href={`https://map.kakao.com/link/map/${store.storeName},${store.latitude},${store.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-yellow-500 text-white font-bold rounded-lg text-center"
              >
                카카오맵으로 보기
              </a>
              <a
                href={`https://map.kakao.com/link/to/${store.storeName},${store.latitude},${store.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-blue-500 text-white font-bold rounded-lg text-center"
              >
                길찾기
              </a>
            </div>
          )}
        </div>

        {/* 상품 정보 섹션 */}
        <div ref={productsRef} id="products-section" className="p-3">
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
                      : bakerDefaultImage
                  }
                  alt={product.productName}
                  className="w-full h-full object-cover rounded-md"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.src = bakerDefaultImage
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
                          : bakerDefaultImage
                      }
                      alt={product.productName}
                      className="w-full h-full object-cover rounded-md"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.src = bakerDefaultImage
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

        {/* 구분선 추가 - 상품정보와 기본정보 사이 */}
        <div className="border-t border-gray-200 mx-4 my-3"></div>

        {/* 가게 정보 섹션 */}
        <div ref={storeInfoRef} id="storeInfo-section" className="p-3 space-y-3">
          <div className="border-b pb-3">
            <h3 className="font-bold mb-2 text-lg">기본 정보</h3>
            <p className="text-gray-600">📍 {store.storeName}</p>
            <p className="text-gray-600">
              📞 {store.contactNumber || '연락처 정보 없음'}
            </p>
            <p className="text-gray-600">
              🌐 {store.website ? (
                <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  {store.website}
                </a>
              ) : '웹사이트 정보 없음'}
            </p>
            <p className="text-gray-600">
              🏷️ 영업시간: {store.businessHours || '정보 없음'}
            </p>
            <p className="text-gray-600">
              🏪 사업자번호: {store.businessNumber || '정보 없음'}
            </p>

            {/* 공간 추가 */}
            <div className="mt-6"></div>

            {/* 구글 리뷰 평균 별점 */}
            <div className="bg-gray-100 rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm">구글 리뷰 평균 별점</h4>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-medium">{store.avgRatingGoogle?.toFixed(1) || "0.0"}</span>
                  <span className="text-gray-500 ml-1">/5</span>
                </div>
              </div>
            </div>
            
            {/* AI 후기 요약 영역 */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
              <h4 className="font-bold mb-1 flex items-center text-sm">
                <svg 
                  className="w-4 h-4 mr-1 text-blue-500" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                </svg>
                AI 후기 요약
              </h4>
              <p className="text-xs text-gray-700">
                {store.reviewSummary || '아직 리뷰 요약이 없습니다.'}
              </p>
            </div>

          </div>

          {/* 가게 소개 */}
          <div className="pb-2">
            <h3 className="font-bold mb-1">가게 소개</h3>
            <p className="text-gray-600">
              {store.description || '가게 소개 정보가 없습니다.'}
            </p>
          </div>

          {/* 복사 성공 메시지 */}
          {copySuccess && (
            <p className="text-sm text-green-500 text-center mt-1">
              복사되었습니다!
            </p>
          )}
        </div>

        {/* 연락하기 버튼 */}
        <div className="p-4">
          <button
            className="w-full py-3 bg-yellow-500 text-white font-bold rounded-lg"
            onClick={() => setShowPhonePopup(true)}
          >
            연락하기
          </button>
        </div>

        {/* 구분선 추가 - 연락하기 버튼과 리뷰 섹션 사이 */}
        <div className="border-t border-gray-200 mx-4 my-3"></div>

        {/* 리뷰 섹션 */}
        <div ref={reviewsRef} id="reviews-section" className="p-3 space-y-3">
          <h3 className="font-bold mb-2 text-lg">리뷰</h3>
          
          {store.reviews && store.reviews.length > 0 ? (
            <div>
              {/* 럭킷 리뷰 평점 */}
              <div className="mb-4">
                <p className="text-3xl font-bold text-center mb-2">
                  {store.avgRatingGoogle?.toFixed(1) || "0.0"}
                  <span className="text-lg text-gray-500">/5</span>
                </p>
                <p className="text-center text-sm text-gray-600 mb-2">구글 평점</p>
                
               
              </div>
              
              {/* 구분선 */}
              <div className="border-t border-gray-200 my-4"></div>
              
              {store.reviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="border rounded-lg p-3 mb-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center mr-2">
                        <span className="text-gray-500 text-xs">
                          {review.userId ? String(review.userId)[0] : '?'}
                        </span>
                      </div>
                      <span className="font-bold text-sm">
                        사용자 {review.userId || '알 수 없음'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="font-medium text-sm">{review.rating}</span>
                    </div>
                  </div>

                  {review.reviewImage && (
                    <div className="my-2">
                      <img
                        src={review.reviewImage}
                        alt="리뷰 이미지"
                        className="w-full h-36 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = defaultImage;
                          e.target.style.display = 'none'; // 이미지 로드 실패 시 완전히 숨김
                        }}
                      />
                    </div>
                  )}

                  <p className="text-sm text-gray-700 my-2">{review.reviewContent}</p>

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">
              아직 리뷰가 없습니다.
            </p>
          )}
        </div>
      </div>

      {/* 맨 위로 버튼 - div 외부에 배치하여 항상 보이도록 */}
      <ScrollTopButton scrollContainerRef={mainContainerRef} />

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

      {/* 공유 모달 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <h3 className="font-bold text-lg text-center mb-4">공유하기</h3>
            <div className="flex items-center justify-between border rounded-lg p-3 mb-4">
              <input
                type="text"
                value={store.storeUrl || `${window.location.origin}/store/${id}`}
                className="flex-1 pr-2 text-sm truncate"
                readOnly
              />
              <button onClick={handleCopyShareLink} className="text-blue-500">
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
              onClick={() => setShowShareModal(false)}
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
