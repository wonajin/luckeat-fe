import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import { Map, MapMarker } from 'react-kakao-maps-sdk' //카카오맵 추가
import { getStoreById, getProductById } from '../api/storeApi'
import { createReservation } from '../api/reservationApi' // 예약 API 추가
import defaultImage from '../assets/images/luckeat-default.png'
import bakerDefaultImage from '../assets/images/luckeat_default_image.webp'
import ScrollTopButton from '../components/common/ScrollTopButton'
import { API_DIRECT_URL } from '../config/apiConfig'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

function StoreDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()
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
  const [userLocation, setUserLocation] = useState(null) // 사용자 위치 상태 추가
  const mainContainerRef = useRef(null)
  const mapRef = useRef(null)
  const productsRef = useRef(null)
  const storeInfoRef = useRef(null)
  const reviewsRef = useRef(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [productInfo, setProductInfo] = useState(null)
  const [productLoading, setProductLoading] = useState(false)
  const [productError, setProductError] = useState(null)
  const [quantity, setQuantity] = useState(1) // 수량 상태 추가
  const [isZerowaste, setIsZerowaste] = useState(false) // 제로웨이스트 상태 추가
  const [reservationLoading, setReservationLoading] = useState(false) // 예약 진행 상태 추가
  const [showSuccessModal, setShowSuccessModal] = useState(false) // 성공 모달 상태 추가
  const [reservationResult, setReservationResult] = useState(null) // 예약 결과 정보 저장
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSellerModal, setShowSellerModal] = useState(false) // 사업자 안내 모달 상태 추가
  const [modalQuantity, setModalQuantity] = useState(1)
  const [stockError, setStockError] = useState('')
  const [isScrolling, setIsScrolling] = useState(false)

  // Google Maps 이미지 URL인지 확인하는 함수
  const isGoogleMapsImage = (url) => {
    return url && url.includes('maps.googleapis.com/maps/api/place/photo')
  }

  // 이미지 URL을 처리하는 함수
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return defaultImage

    // 구글 이미지 URL인 경우 CORS 이슈가 있을 수 있으므로 특별히 처리
    if (isGoogleMapsImage(imageUrl)) {
      // console.log('구글 맵스 이미지 URL 감지:', imageUrl)

      // 가게 이름이 있으면 그에 맞는 일반적인 이미지를 표시
      // 예: 베이커리 가게인 경우 베이커리 이미지
      if (
        store?.storeName?.includes('베이커리') ||
        store?.storeName?.includes('빵집') ||
        store?.storeName?.includes('빵') ||
        store?.storeName?.includes('Baguette') ||
        store?.storeName?.includes('베이글') ||
        store?.storeName?.includes('Bakery')
      ) {
        return bakerDefaultImage
      }

      // 그 외의 경우 기본 이미지 사용
      return defaultImage
    }

    return imageUrl
  }

  // 현재 위치를 가져오기
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            const location = { lat: latitude, lng: longitude }
            setUserLocation(location)
            resolve(location)
          },
          (error) => {
            console.error('위치 정보를 가져오는데 실패했습니다:', error)
            reject(error)
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
        )
      } else {
        const error = new Error(
          '이 브라우저에서는 위치 정보를 지원하지 않습니다.',
        )
        console.error(error.message)
        reject(error)
      }
    })
  }

  // 페이지 로드 시 사용자 위치 가져오기 시도
  useEffect(() => {
    getCurrentPosition().catch((err) => {
      console.warn('현재 위치를 가져오지 못했습니다:', err.message)
    })
  }, [])

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true)
        setError(null)
        // console.log(`가게 상세 정보 요청 - 가게 ID: ${id}`)

        const response = await getStoreById(id)
        // console.log('가게 상세 정보 응답:', response)

        if (response.success) {
          const storeData = response.data

          // 이미지 URL 확인 및 디버깅
          // console.log('가게 이미지 URL:', storeData.storeImg)

          // 이미지 미리 로드 시도
          if (storeData.storeImg) {
            const img = new Image()
            img.onload = () => {
              // console.log('이미지 미리 로드 성공:', storeData.storeImg)
            }
            img.onerror = () => {
              console.error('이미지 미리 로드 실패:', storeData.storeImg)
              // 이미지 로드 실패 시, 이미지 URL을 null로 설정해서 기본 이미지 표시
              storeData.storeImg = null
            }
            img.src = storeData.storeImg
          }

          // 구글 이미지인지 확인
          if (isGoogleMapsImage(storeData.storeImg)) {
            // console.log('구글 맵스 이미지 URL 감지됨')
          }

          // JSON으로 응답 객체 로깅 (민감 정보 제외)
          const safeStoreData = { ...storeData }
          // console.log('가게 데이터:', JSON.stringify(safeStoreData, null, 2))

          setStore(storeData)
          // console.log('지도 정보:', storeData.latitude, storeData.longitude) // 디버깅용
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

  // 상품 정보 가져오기
  useEffect(() => {
    const fetchProductData = async () => {
      if (!store?.products?.[0]?.id) return

      try {
        setProductLoading(true)
        setProductError(null)
        const productData = await getProductById(id, store.products[0].id)
        setProductInfo(productData)
      } catch (error) {
        console.error('상품 정보 가져오기 실패:', error)
        setProductError('상품 정보를 불러오는데 실패했습니다')
      } finally {
        setProductLoading(false)
      }
    }

    fetchProductData()
  }, [id, store])

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
          // console.log('카카오맵 API 로드 완료')
          setMapLoaded(true)
        })
      }
    } else {
      // console.log('카카오맵 API가 이미 로드되어 있습니다.')
      setMapLoaded(true)
    }
  }, [])

  // 주소에서 '대한민국' 제거하는 함수 추가
  const removeCountryFromAddress = (address) => {
    if (!address) return '주소 정보 없음'
    return address.replace(/^대한민국\s+/, '')
  }

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
  }

  // 공유 링크 복사
  const handleCopyShareLink = () => {
    const shareUrl = store.storeUrl
      ? `${API_DIRECT_URL}/s/${store.storeUrl}`
      : `${API_DIRECT_URL}/store/${id}`

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
    if (!mainContainerRef.current || isScrolling) return

    const container = mainContainerRef.current
    const scrollTop = container.scrollTop
    const containerHeight = container.clientHeight
    const offset = 100 // 탭 전환 위치 조정을 위한 오프셋

    // 각 섹션의 위치 계산
    const sections = {
      map: mapRef.current?.getBoundingClientRect().top,
      products: productsRef.current?.getBoundingClientRect().top,
      storeInfo: storeInfoRef.current?.getBoundingClientRect().top,
      reviews: reviewsRef.current?.getBoundingClientRect().top
    }

    // 현재 보이는 섹션 찾기
    const currentSection = Object.entries(sections).reduce((visible, [key, value]) => {
      if (value && value <= containerHeight * 0.3) {
        return key
      }
      return visible
    }, 'map')

    // activeTab이 현재 섹션과 다를 때만 업데이트
    if (!isScrolling && activeTab !== currentSection) {
      setActiveTab(currentSection)
    }
  }

  // 탭 클릭 시 해당 섹션으로 스크롤
  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setIsScrolling(true)
    setTimeout(() => {
      const container = mainContainerRef.current
      const offset = 100 // 상단 여백 추가

      if (tab === 'map' && mapRef.current) {
        const elementTop = mapRef.current.offsetTop - offset
        container.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        })
      } else if (tab === 'products' && productsRef.current) {
        const elementTop = productsRef.current.offsetTop - offset
        container.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        })
      } else if (tab === 'storeInfo' && storeInfoRef.current) {
        const elementTop = storeInfoRef.current.offsetTop - offset
        container.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        })
      } else if (tab === 'reviews' && reviewsRef.current) {
        const elementTop = reviewsRef.current.offsetTop - offset
        container.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        })
      }
      // 스크롤 애니메이션이 끝난 후 isScrolling 상태 해제
      setTimeout(() => {
        setIsScrolling(false)
      }, 500)
    }, 100)
  }

  // 리뷰 모달 표시 - 이제 탭으로 대체되므로 삭제 또는 수정 가능
  const handleReviewClick = () => {
    setActiveTab('reviews')
    setTimeout(() => {
      if (reviewsRef.current) {
        reviewsRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  // 카카오맵 길찾기 핸들러
  const handleDirections = async (e) => {
    e.preventDefault()

    if (!store || !store.latitude || !store.longitude) {
      alert('가게 위치 정보가 없습니다.')
      return
    }

    try {
      // 현재 위치가 없으면 다시 가져오기 시도
      const startLocation = userLocation || (await getCurrentPosition())

      if (!startLocation) {
        alert('현재 위치를 확인할 수 없습니다. 위치 접근 권한을 확인해주세요.')
        return
      }

      // console.log('출발 위치:', startLocation)
      // console.log('도착 위치:', { lat: store.latitude, lng: store.longitude })

      // 카카오맵 길찾기 URL 생성 (출발지->목적지)
      const kakaoMapDirectUrl = `https://map.kakao.com/link/from/내 위치,${startLocation.lat},${startLocation.lng}/to/${store.storeName},${store.latitude},${store.longitude}`

      // 새 창에서 카카오맵 열기
      window.open(kakaoMapDirectUrl, '_blank')
      console.log('길찾기 URL:', kakaoMapDirectUrl)
    } catch (error) {
      console.error('길찾기 실행 중 오류 발생:', error)

      // 에러가 발생해도 기본 URL로 열기 (목적지만 지정)
      const kakaoMapUrl = `https://map.kakao.com/link/to/${store.storeName},${store.latitude},${store.longitude}`
      window.open(kakaoMapUrl, '_blank')
    }
  }

  // 수량 증가 함수
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  // 수량 감소 함수
  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  // 제로웨이스트 토글 함수
  const toggleZerowaste = () => {
    setIsZerowaste((prev) => !prev)
  }

  // 예약 처리 함수
  const handleMakeReservation = async () => {
    // 상품 ID가 없거나 상품이 매진됐으면 예약 불가
    if (!productInfo?.id || !productInfo?.isOpen) {
      toast.error('예약할 수 없는 상품입니다.')
      return
    }

    // 재고 체크
    if (modalQuantity > productInfo.productCount) {
      setStockError(`재고가 부족합니다. (현재 재고: ${productInfo.productCount}개)`)
      return
    }

    try {
      setReservationLoading(true)
      setStockError('')
      
      // 예약 데이터 구성
      const reservationData = {
        productId: productInfo.id,
        quantity: modalQuantity,
        isZerowaste: isZerowaste
      }
      
      // console.log('예약 요청 데이터:', reservationData)
      
      // 예약 API 호출
      const result = await createReservation(id, reservationData)
      
      if (result.success) {
        // 페이지 이동 대신 성공 모달 표시
        toast.success('예약이 완료되었습니다!')
        setShowPhonePopup(false)
        
        // 예약 결과 정보 저장
        setReservationResult({
          storeId: id,
          storeName: store.storeName,
          productId: productInfo.id,
          productName: productInfo.productName,
          productPrice: productInfo.discountedPrice,
          quantity: modalQuantity,
          isZerowaste: isZerowaste,
          reservationId: result.data.reservationId || 'success',
        })
        
        // 성공 모달 표시
        setShowSuccessModal(true)
      } else {
        toast.error(result.message || '예약에 실패했습니다.')
      }
    } catch (error) {
      console.error('예약 처리 중 오류:', error)
      toast.error('예약 처리 중 오류가 발생했습니다.')
    } finally {
      setReservationLoading(false)
    }
  }

  // 예약 완료 후 마이페이지로 이동
  const goToMyPage = () => {
    navigate('/mypage')
    setShowSuccessModal(false)
  }

  // 예약하기 버튼 클릭 핸들러
  const handleReservationClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }

    // 사업자 예약 제한
    if (user && user.role === 'SELLER') {
      setShowSellerModal(true)
      return
    }

    setShowPhonePopup(true)
  }

  // 로그인 페이지로 이동
  const handleLoginClick = () => {
    navigate('/login')
    setShowLoginModal(false)
  }

  // 모달이 열릴 때마다 수량을 1로 초기화
  useEffect(() => {
    if (showPhonePopup) {
      setModalQuantity(1)
    }
  }, [showPhonePopup])

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

      <div
        className="flex-1 overflow-y-auto scroll-container"
        ref={mainContainerRef}
        onScroll={handleScroll}
      >
        {/* 가게 이미지 */}
        <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
          {store.storeImg || store.imageUrl ? (
            <img
              src={
                store.storeImg ? store.storeImg : store.imageUrl || defaultImage
              }
              alt={store.storeName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.error('이미지 로드 오류:', store.storeImg)
                e.target.onerror = null // 무한 루프 방지
                e.target.src = defaultImage
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
              {store.avgRatingGoogle?.toFixed(1) || '0.0'}
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
                {tab === 'products' && '럭키트 정보'}
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
                    lng: parseFloat(store.longitude),
                  }}
                  style={{ width: '100%', height: '100%' }}
                  level={3}
                >
                  <MapMarker
                    position={{
                      lat: parseFloat(store.latitude),
                      lng: parseFloat(store.longitude),
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
          <div className="mt-2 flex items-center justify-between bg-gray-100 p-2 rounded-md">
            <span className="text-gray-700">{removeCountryFromAddress(store.address)}</span>
            <button
              onClick={handleCopyClick}
              className="ml-2 flex items-center text-blue-500 hover:text-blue-600 transition-colors"
              title="주소 복사하기"
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>

          {/* 복사 성공 메시지 */}
          {copySuccess && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg z-50">
              복사되었습니다!
            </div>
          )}

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
              <button
                onClick={handleDirections}
                className="flex-1 py-2 bg-blue-500 text-white font-bold rounded-lg text-center"
              >
                길찾기
              </button>
            </div>
          )}
        </div>

        {/* 상품 정보 섹션 */}
        <div ref={productsRef} id="products-section" className="p-3">
          <h3 className="font-bold mb-2 text-lg">럭키트 정보</h3>
          <div className="border rounded-lg p-3 mb-4 relative">
            {productLoading ? (
              <div className="text-center py-4">상품 정보를 불러오는 중...</div>
            ) : productError ? (
              <div className="text-center py-4 text-red-500">
                {productError}
              </div>
            ) : productInfo ? (
              <>
                <div>
                  <div className="flex items-center mb-2">
                    <h4 className="font-bold">{productInfo.productName}</h4>
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      럭키트
                    </span>
                  </div>

                  <div className="p-2 bg-gray-50 rounded-md mb-3">
                    <p className="text-sm text-gray-700">
                      {productInfo.description}
                    </p>
                  </div>

                  <div className="flex items-center mb-3">
                    <span className="text-sm text-gray-600">
                      {!productInfo.isOpen || productInfo.productCount === 0 ? (
                        ''
                      ) : (
                        <>남은 수량: <span className="font-bold text-yellow-600">{productInfo.productCount || 0}개</span></>
                      )}
                    </span>
                  </div>

                  <div className="flex">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <p className="text-sm line-through text-gray-400">
                            {productInfo.originalPrice.toLocaleString()}원
                          </p>
                          <p className="text-lg font-bold">
                            {productInfo.discountedPrice.toLocaleString()}원
                          </p>
                        </div>
                        <span className="text-red-500 font-bold">
                          {Math.min(
                            Math.round(
                              (1 -
                                productInfo.discountedPrice /
                                  productInfo.originalPrice) *
                              100,
                            ),
                            99
                          )}
                           % 할인
                        </span>
                      </div>
                    </div>

                    <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0 relative">
                      <img
                        src={productInfo.productImg || bakerDefaultImage}
                        alt={productInfo.productName}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = bakerDefaultImage
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  className={`w-full py-3 font-bold rounded-lg mt-4 ${
                    !productInfo.isOpen || productInfo.productCount === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                  onClick={handleReservationClick}
                  disabled={!productInfo.isOpen || productInfo.productCount === 0}
                >
                  {!productInfo.isOpen || productInfo.productCount === 0 ? '매진되었습니다' : '럭키트 예약하기'}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                현재 예약 가능한 럭키트가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 구분선 추가 - 상품정보와 기본정보 사이 */}
        <div className="border-t border-gray-200 mx-4 my-3"></div>

        {/* 가게 정보 섹션 */}
        <div
          ref={storeInfoRef}
          id="storeInfo-section"
          className="p-3 space-y-3"
        >
          <div className="border-b pb-3">
            <h3 className="font-bold mb-4 text-lg">기본 정보</h3>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">🏪</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">가게명</p>
                  <p className="font-medium">{store.storeName}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">📞</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="font-medium">{store.contactNumber || '연락처 정보 없음'}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xl">⏰</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">영업시간</p>
                  </div>
                </div>
                <div className="ml-13">
                  {store.businessHours ? (
                    <div className="py-1 whitespace-pre-line text-gray-700">
                      {store.businessHours.replace(/\\n/g, '\n')}
                    </div>
                  ) : (
                    <p className="py-1 text-gray-500">영업시간 정보가 없습니다.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 공간 추가 */}
            <div className="mt-6"></div>

            {/* 구글 리뷰 평균 별점 */}
            <div className="bg-gray-100 rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm">구글 리뷰 평균 별점</h4>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-medium">
                    {store.avgRatingGoogle?.toFixed(1) || '0.0'}
                  </span>
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

        {/* 구분선 추가 - 정보와 리뷰 섹션 사이 */}
        <div className="border-t border-gray-200 mx-4 my-3"></div>

        {/* 리뷰 섹션 */}
        <div ref={reviewsRef} id="reviews-section" className="p-3 space-y-3">
          <h3 className="font-bold mb-2 text-lg">리뷰</h3>

          {store.reviews && store.reviews.length > 0 ? (
            <div>
              {/* 리뷰 평점 */}
              <div className="mb-4">
                <p className="text-3xl font-bold text-center mb-2 flex items-center justify-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  {(
                    store.reviews.reduce((acc, review) => acc + review.rating, 0) /
                    store.reviews.length
                  ).toFixed(1)}
                  <span className="text-lg text-gray-500">/5</span>
                </p>
                <p className="text-center text-sm text-gray-600 mb-2">
                  리뷰 평점
                </p>
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
                          {review.userNickname ? review.userNickname[0] : '?'}
                        </span>
                      </div>
                      <span className="font-bold text-sm">
                        {review.userNickname || '알 수 없음'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="font-medium text-sm">
                        {review.rating}
                      </span>
                    </div>
                  </div>



                  {review.reviewImage && (
                    <div className="my-2">
                      <img
                        src={review.reviewImage}
                        alt="리뷰 이미지"
                        className="w-full h-36 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = defaultImage
                          e.target.style.display = 'none' // 이미지 로드 실패 시 완전히 숨김
                        }}
                      />
                    </div>
                  )}

                  <p className="text-sm text-gray-700 my-2">
                    {review.reviewContent}
                  </p>

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

      {/* 전화번호 팝업을 럭키트 픽업 시간 선택 모달로 변경 */}
      {showPhonePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">{store.storeName}</h3>
              <button
                onClick={() => setShowPhonePopup(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mb-3">
              이 가게의 픽업 가능 시간은 {store.pickupTime || '설정되지 않았습니다'}
            </p>

            <div className="flex items-center justify-center space-x-4 mb-3">
              <button 
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center focus:outline-none"
                onClick={() => setModalQuantity(prev => prev - 1)}
                disabled={modalQuantity <= 1}
              >
                -
              </button>
              <div className="text-xl font-bold">{modalQuantity}</div>
              <button 
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center focus:outline-none"
                onClick={() => setModalQuantity(prev => prev + 1)}
                disabled={modalQuantity >= productInfo?.productCount}
              >
                +
              </button>
            </div>

            {stockError && (
              <p className="text-red-500 text-sm text-center mb-3">{stockError}</p>
            )}

            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="bring-container"
                checked={isZerowaste}
                onChange={() => setIsZerowaste(!isZerowaste)}
                className="w-4 h-4 text-yellow-500 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
              />
              <label
                htmlFor="bring-container"
                className="ml-2 text-sm font-medium text-gray-600"
              >
                제로웨이스트를 위해 포장용기 지참할게요
              </label>
            </div>

            <p className="text-center text-xs text-gray-500 mb-3">
              픽업 시간 외 방문 시 매너 픽업에 불이익이 있을 수 있습니다
            </p>

            <button
              className="w-full py-3 bg-yellow-500 text-white font-bold rounded-lg mb-2"
              onClick={handleMakeReservation}
              disabled={reservationLoading}
            >
              {reservationLoading ? '예약 처리 중...' : '픽업시간 확인했습니다'}
            </button>

            <button
              className="w-full py-2 text-gray-600 font-medium"
              onClick={() => setShowPhonePopup(false)}
            >
              닫기
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
                value={
                  store.storeUrl
                    ? `${API_DIRECT_URL}/s/${store.storeUrl}`
                    : `${API_DIRECT_URL}/store/${id}`
                }
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

      {/* 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">예약 완료</h3>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2">예약이 완료되었습니다!</h4>
              <p className="text-gray-600 mb-3">
                {reservationResult?.storeName}에서 {reservationResult?.quantity}개의 럭키트가 예약되었습니다.
              </p>
              <p className="text-sm text-gray-500 mb-1">
                {reservationResult?.isZerowaste && '제로웨이스트 지참 예정'}
              </p>
              <p className="text-sm text-gray-500">
                픽업 시간: {store.pickupTime || '오후 4:30 ~ 5:00'}
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                className="w-full py-3 bg-yellow-500 text-white font-bold rounded-lg"
                onClick={goToMyPage}
              >
                마이페이지로 이동
              </button>
              <button
                className="w-full py-2 text-gray-600 font-medium"
                onClick={() => {
                  setShowSuccessModal(false)
                  window.location.reload()
                }}
              >
                계속 둘러보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 로그인 필요 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">로그인 필요</h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-gray-600">
                예약하기는 로그인이 필요한 서비스입니다.
                <br />
                로그인하시겠습니까?
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                className="w-full py-3 bg-yellow-500 text-white font-bold rounded-lg"
                onClick={handleLoginClick}
              >
                로그인하기
              </button>
              <button
                className="w-full py-2 text-gray-600 font-medium"
                onClick={() => setShowLoginModal(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사업자 안내 모달 */}
      {showSellerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">사업자 안내</h3>
              <button
                onClick={() => setShowSellerModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-gray-600">
                사업자 계정으로는 예약이 불가능합니다.
                <br />
                일반 사용자 계정으로 로그인해주세요.
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                className="w-full py-3 bg-yellow-500 text-white font-bold rounded-lg"
                onClick={async () => {
                  await logout()
                  setShowSellerModal(false)
                  navigate('/login')
                }}
              >
                로그인하기
              </button>
              <button
                className="w-full py-2 text-gray-600 font-medium"
                onClick={() => setShowSellerModal(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreDetailPage