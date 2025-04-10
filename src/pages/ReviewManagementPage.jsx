/* 신규 파일 생성: 리뷰 관리 페이지 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'
import { getStores } from '../api/storeApi'
import {
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../api/reviewApi'
import { getUserCompletedReservations } from '../api/reservationApi'
import { uploadImage } from '../api/uploadApi'

function ReviewManagementPage() {
  const navigate = useNavigate()
  const { user, checkCurrentAuthStatus } = useAuth()
  const [writableStores, setWritableStores] = useState([])
  const [writtenReviews, setWrittenReviews] = useState([])
  const [expandedStoreId, setExpandedStoreId] = useState(null)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newReview, setNewReview] = useState({
    rating: 5,
    content: '',
    image: null,
    imagePreview: null,
  })
  const [editReview, setEditReview] = useState({
    rating: 5,
    content: '',
    image: null,
    imagePreview: null,
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  // 작성 가능한 가게와 작성한 리뷰 초기화
  useEffect(() => {
    const verifyAuth = async () => {
      const isValid = await checkCurrentAuthStatus()
      if (!isValid) {
        navigate('/login')
        return
      }
      fetchData()
    }

    verifyAuth()
  }, [navigate, checkCurrentAuthStatus])

  useEffect(() => {
    const handleToast = (event) => {
      const { message, type } = event.detail
      setToastMessage(message)
      setToastType(type)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }

    window.addEventListener('showToast', handleToast)
    return () => window.removeEventListener('showToast', handleToast)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // 사용자가 작성한 리뷰 목록 가져오기
      const userReviewsResponse = await getMyReviews()

      if (userReviewsResponse && userReviewsResponse.data) {
        const reviewData = userReviewsResponse.data.reviews || []

        // API 응답에서 리뷰 데이터 형식 매핑
        const formattedReviews = reviewData.map((review) => ({
          id: review.reviewId,
          storeId: review.storeId,
          storeName: review.storeName || '가게 정보 없음',
          userName: user?.nickname || '사용자',
          rating: review.rating,
          content: review.reviewContent,
          image: review.reviewImage,
          productName: review.productName || '상품 정보 없음',
          totalPrice: review.totalPrice || 0,
          quantity: review.quantity || 1,
          date: new Date(review.createdAt)
            .toLocaleDateString('ko-KR', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\. /g, '.')
            .replace(/\.$/, ''),
        }))

        setWrittenReviews(formattedReviews)
        console.log('사용자 리뷰 데이터:', formattedReviews)
      } else {
        console.log('리뷰 데이터가 없습니다.')
        setWrittenReviews([])
      }

      // 완료된 예약 목록 가져오기
      const completedReservationsResponse = await getUserCompletedReservations()
      
      if (completedReservationsResponse.success) {
        const { completedOrders, confirmedOrders } = completedReservationsResponse.data
        
        // 완료된 예약과 확정된 예약을 합쳐서 리뷰 작성 가능한 가게 목록 구성
        const allOrders = [...completedOrders, ...confirmedOrders]
        const availableStores = allOrders
          .filter((order) => !order.isReviewed) // isReviewed가 false인 주문만 필터링
          .map((order) => ({
            id: `store-${order.storeId}-${order.id}-${Date.now()}`,
            storeId: order.storeId,
            name: order.storeName,
            orderDate: new Date(order.createdAt)
              .toLocaleDateString('ko-KR', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
              })
              .replace(/\. /g, '.')
              .replace(/\.$/, ''),
            orderId: order.id,
            orderItems: order.orderItems || [],
            totalPrice: order.totalPrice || 0,
            productName: order.productName,
            quantity: order.quantity,
          }))

        // 최신순으로 정렬
        const sortedStores = availableStores.sort((a, b) => 
          new Date(b.orderDate) - new Date(a.orderDate)
        )

        setWritableStores(sortedStores)
        console.log('리뷰 작성 가능한 가게:', sortedStores)
      }

      setLoading(false)
    } catch (err) {
      console.error('데이터 로딩 중 오류 발생:', err)
      setError('리뷰 데이터를 불러오는데 실패했습니다')
      setLoading(false)
    }
  }

  // 리뷰 작성 폼 토글
  const toggleReviewForm = (storeId, orderId) => {
    const uniqueId = `${storeId}-${orderId}`
    if (expandedStoreId === uniqueId) {
      // 이미 열려있는 폼을 닫으려고 할 때
      if (newReview.content || newReview.image) {
        // 작성 중인 내용이 있으면 경고 모달 표시
        setShowCancelModal(true)
      } else {
        // 작성 중인 내용이 없으면 바로 닫기
        setExpandedStoreId(null)
      }
    } else {
      // 새로운 폼 열기
      setExpandedStoreId(uniqueId)
      setNewReview({
        rating: 5,
        content: '',
        image: null,
        imagePreview: null,
      })
    }
  }

  // 리뷰 수정 모드 토글
  const toggleEditMode = (review) => {
    if (editingReviewId === review.id) {
      // 이미 수정 중인 리뷰를 취소하려고 할 때
      if (
        editReview.content !== review.content ||
        editReview.rating !== review.rating ||
        editReview.image !== review.image
      ) {
        // 변경된 내용이 있으면 경고 모달 표시
        setShowCancelModal(true)
      } else {
        // 변경된 내용이 없으면 바로 취소
        setEditingReviewId(null)
      }
    } else {
      // 새로운 수정 모드 시작
      setEditingReviewId(review.id)
      setEditReview({
        rating: review.rating,
        content: review.content,
        image: review.image,
        imagePreview: review.image,
      })
    }
  }

  // 이미지 처리 함수
  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0]
    if (!file) return

    // 파일 유효성 검사
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heif',
      'image/heic',
    ]
    if (!validTypes.includes(file.type)) {
      alert(
        '지원하지 않는 파일 형식입니다. JPG, JPEG, PNG, WEBP, HEIF, HEIC 형식만 가능합니다.',
      )
      return
    }

    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.')
      return
    }

    // 이미지 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      if (isEdit) {
        setEditReview((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }))
      } else {
        setNewReview((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  // 리뷰 내용 변경 처리
  const handleContentChange = (e, isEdit = false) => {
    const content = e.target.value
    if (content.length > 100) return // 100자 제한

    if (isEdit) {
      setEditReview((prev) => ({ ...prev, content }))
    } else {
      setNewReview((prev) => ({ ...prev, content }))
    }
  }

  // 별점 변경 처리
  const handleRatingChange = (rating, isEdit = false) => {
    if (isEdit) {
      setEditReview((prev) => ({ ...prev, rating }))
    } else {
      setNewReview((prev) => ({ ...prev, rating }))
    }
  }

  // 리뷰 작성 완료
  const handleSubmitReview = async (storeId, orderId) => {
    if (!newReview.content) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: '리뷰 내용을 입력해주세요.',
          type: 'error'
        }
      }))
      return
    }

    try {
      let imageUrl = null
      
      // 이미지가 있는 경우 먼저 업로드
      if (newReview.image) {
        try {
          // uploadImage 함수 호출하여 URL 받기 (프리사인드 URL 방식으로 변경됨)
          imageUrl = await uploadImage(newReview.image, 'reviews')
        } catch (error) {
          console.error('이미지 업로드 중 오류:', error)
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
              message: '이미지 업로드에 실패했습니다. 다시 시도해주세요.',
              type: 'error'
            }
          }))
          return
        }
      }

      // 리뷰 데이터 구성
      const reviewData = {
        storeId: storeId,
        reservationId: orderId,
        rating: newReview.rating,
        reviewContent: newReview.content,
        reviewImage: imageUrl,
      }

      // API로 리뷰 생성
      const response = await createReview(reviewData)

      if (response) {
        // 성공적으로 리뷰가 생성되면 리뷰 목록을 업데이트
        const store = writableStores.find((s) => s.storeId === storeId)

        const newReviewObj = {
          id: response.reviewId || Date.now(),
          storeId,
          storeName: store ? store.name : '가게 정보',
          userName: user?.nickname || '사용자',
          rating: newReview.rating,
          content: newReview.content,
          image: imageUrl,
          productName: store ? store.productName : '상품 정보 없음',
          totalPrice: store ? store.totalPrice : 0,
          quantity: store ? store.quantity : 1,
          date: new Date()
            .toLocaleDateString('ko-KR', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\. /g, '.')
            .replace(/\.$/, ''),
        }

        // 작성한 리뷰 목록에 추가
        setWrittenReviews((prev) => [newReviewObj, ...prev])

        // 작성 가능한 가게 목록에서 제거
        setWritableStores((prev) =>
          prev.filter((store) => store.storeId !== storeId),
        )

        // 폼 닫기
        setExpandedStoreId(null)

        // 리뷰 초기화
        setNewReview({
          rating: 5,
          content: '',
          image: null,
          imagePreview: null,
        })

        // 1초 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error('리뷰 작성 중 오류:', error)
    }
  }

  // 리뷰 수정 완료
  const handleUpdateReview = async (reviewId) => {
    if (!editReview.content) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: '리뷰 내용을 입력해주세요.',
          type: 'error'
        }
      }))
      return
    }

    try {
      let imageUrl = null
      
      // 이미지가 있고 변경된 경우에만 업로드
      if (editReview.image && typeof editReview.image !== 'string') {
        try {
          // uploadImage 함수 호출하여 URL 받기 (프리사인드 URL 방식으로 변경됨)
          imageUrl = await uploadImage(editReview.image, 'reviews')
        } catch (error) {
          console.error('이미지 업로드 중 오류:', error)
          // 이미지 업로드 실패 시 이전 이미지를 사용
          const existingReview = writtenReviews.find((review) => review.id === reviewId)
          imageUrl = existingReview?.image || null
        }
      } else {
        // 이미지가 변경되지 않았거나 없는 경우 이전 이미지 URL 사용
        const existingReview = writtenReviews.find((review) => review.id === reviewId)
        imageUrl = existingReview?.image || null
      }

      // 리뷰 데이터 구성
      const reviewData = {
        rating: editReview.rating,
        reviewContent: editReview.content,
        reviewImage: imageUrl,
      }

      // API로 리뷰 수정
      const response = await updateReview(reviewId, reviewData)

      if (response) {
        // 성공적으로 리뷰가 수정되면 리뷰 목록을 업데이트
        setWrittenReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  rating: editReview.rating,
                  content: editReview.content,
                  image: imageUrl,
                  productName: review.productName,
                  totalPrice: review.totalPrice,
                  quantity: review.quantity,
                }
              : review,
          ),
        )

        // 수정 모드 종료
        setEditingReviewId(null)

        // 1초 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error('리뷰 수정 중 오류:', error)
    }
  }

  // 리뷰 삭제 모달 표시
  const showDeleteConfirmation = (reviewId) => {
    setReviewToDelete(reviewId)
    setShowDeleteModal(true)
  }

  // 리뷰 삭제 처리
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return

    try {
      // API로 리뷰 삭제
      const response = await deleteReview(reviewToDelete)

      if (response === 204) {
        // 리뷰 목록에서 삭제된 리뷰 제거
        const deletedReview = writtenReviews.find(
          (r) => r.id === reviewToDelete,
        )

        setWrittenReviews((prev) =>
          prev.filter((review) => review.id !== reviewToDelete),
        )

        // 리뷰가 삭제된 가게를 작성 가능한 가게 목록에 다시 추가
        if (deletedReview) {
          const storeToAdd = writableStores.find(
            (s) => s.storeId === deletedReview.storeId,
          )
          if (storeToAdd) {
            setWritableStores((prev) => [...prev, storeToAdd])
          }
        }

        setShowDeleteModal(false)
        setReviewToDelete(null)

        // 1초 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error('리뷰 삭제 중 오류:', error)
    } finally {
      setShowDeleteModal(false)
    }
  }

  // 뒤로가기 버튼 핸들러
  const handleBack = () => {
    if (editingReviewId || expandedStoreId) {
      // 작성 중인 리뷰가 있으면 경고
      setShowCancelModal(true)
    } else {
      navigate('/mypage')
    }
  }

  // 별점 렌더링 함수
  const renderStars = (
    rating,
    isInteractive = false,
    isEdit = false,
    maxRating = 5,
  ) => {
    return Array.from({ length: maxRating }, (_, i) => (
      <span
        key={i}
        className={`text-2xl cursor-${isInteractive ? 'pointer' : 'default'}`}
        onClick={() => isInteractive && handleRatingChange(i + 1, isEdit)}
      >
        {i < rating ? '★' : '☆'}
      </span>
    ))
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="리뷰 관리" onBack={handleBack} />
      
      {/* 토스트 메시지 */}
      {showToast && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toastMessage}
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">나의 리뷰</h2>

        {/* 작성 가능한 리뷰 섹션 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">작성 가능한 리뷰</h3>
          {writableStores.length === 0 ? (
            <div className="border rounded p-4 text-center text-gray-500">
              작성 가능한 리뷰가 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {writableStores.map((store) => (
                <div key={`store-${store.storeId}-${store.orderId}`} className="border rounded overflow-hidden">
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleReviewForm(store.storeId, store.orderId)}
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{store.name}</p>
                      <p className="text-sm text-gray-500">
                        {store.orderDate} 주문
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {store.productName} {store.quantity}개
                      </p>
                      {/* 주문 상세 정보 */}
                      <div className="mt-2 text-sm">
                        {store.orderItems && store.orderItems.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.name}</span>
                            <span className="ml-2">
                              {item.quantity}개 × {item.price.toLocaleString()}원
                            </span>
                          </div>
                        ))}
                        <div className="mt-1 font-medium">
                          주문 금액: {store.totalPrice.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-700 flex items-center ml-4">
                      리뷰쓰기
                      <span 
                        className={`ml-1 transform transition-transform ${
                          expandedStoreId === `${store.storeId}-${store.orderId}` ? 'rotate-180' : ''
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                  </div>

                  {/* 리뷰 작성 폼 */}
                  {expandedStoreId === `${store.storeId}-${store.orderId}` && (
                    <div className="p-4 border-t">
                      <div className="mb-3">
                        <div className="flex text-[#F7B32B] mb-2">
                          {renderStars(newReview.rating, true)}
                        </div>
                      </div>

                      <div className="mb-3">
                        <textarea
                          className="w-full border rounded p-2"
                          placeholder="리뷰 내용을 작성해주세요. (최대 100자)"
                          value={newReview.content}
                          onChange={(e) => handleContentChange(e)}
                          maxLength={100}
                          rows={4}
                        />
                        <div className="text-right text-sm text-gray-500">
                          {newReview.content.length}/100
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          사진 첨부 파일
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/heif,image/heic"
                          onChange={(e) => handleImageChange(e)}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded file:border-0
                            file:text-sm file:font-semibold
                            file:bg-gray-50 file:text-gray-700
                            hover:file:bg-gray-100"
                        />
                        {newReview.imagePreview && (
                          <div className="mt-2">
                            <img
                              src={newReview.imagePreview}
                              alt="미리보기"
                              className="h-24 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        className="w-full py-2 bg-[#F7B32B] hover:bg-[#E09D18] text-white rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSubmitReview(store.storeId, store.orderId)
                        }}
                      >
                        작성 완료
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 작성한 리뷰 섹션 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">작성한 리뷰</h3>
          {writtenReviews.length === 0 ? (
            <div className="border rounded p-4 text-center text-gray-500">
              작성하신 리뷰가 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {writtenReviews.map((review) => (
                <div key={review.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{review.storeName}</p>
                      <p className="text-sm text-gray-500">
                        {review.date}
                      </p>
                      <div className="text-[#F7B32B] my-1">
                        {editingReviewId === review.id
                          ? renderStars(editReview.rating, true, true)
                          : renderStars(review.rating)}
                      </div>
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{review.productName}</span>
                          <span className="mx-2">·</span>
                          <span>{review.quantity}개</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">주문 금액</span>
                          <span className="ml-2">{review.totalPrice.toLocaleString()}원</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {editingReviewId === review.id ? (
                        <>
                          <button
                            className="px-3 py-1 bg-[#F7B32B] text-white rounded hover:bg-[#E09D18] transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdateReview(review.id)
                            }}
                          >
                            수정완료
                          </button>
                          <button
                            className="px-3 py-1 border rounded"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingReviewId(null)
                            }}
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="px-3 py-1 border rounded"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleEditMode(review)
                            }}
                          >
                            수정
                          </button>
                          <button
                            className="px-3 py-1 border rounded"
                            onClick={(e) => {
                              e.stopPropagation()
                              showDeleteConfirmation(review.id)
                            }}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 리뷰 내용 및 이미지 */}
                  {editingReviewId === review.id ? (
                    <>
                      <div className="mb-3">
                        <textarea
                          className="w-full border rounded p-2"
                          placeholder="리뷰 내용을 작성해주세요. (최대 100자)"
                          value={editReview.content}
                          onChange={(e) => handleContentChange(e, true)}
                          maxLength={100}
                          rows={4}
                        />
                        <div className="text-right text-sm text-gray-500">
                          {editReview.content.length}/100
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          사진 첨부 파일
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/heif,image/heic"
                          onChange={(e) => handleImageChange(e, true)}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded file:border-0
                            file:text-sm file:font-semibold
                            file:bg-gray-50 file:text-gray-700
                            hover:file:bg-gray-100"
                        />
                        {editReview.imagePreview && (
                          <div className="mt-2">
                            <img
                              src={editReview.imagePreview}
                              alt="미리보기"
                              className="h-24 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {review.image && (
                        <div className="mb-2">
                          <img
                            src={review.image}
                            alt="리뷰 이미지"
                            className="h-32 object-cover rounded"
                          />
                        </div>
                      )}
                      <p className="text-gray-700">{review.content}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <h3 className="font-bold text-lg text-center mb-4">
              리뷰를 삭제하시겠습니까?
            </h3>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-[#F7B32B] text-white rounded hover:bg-[#E09D18] transition-colors"
                onClick={handleDeleteReview}
              >
                확인
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <h3 className="font-bold text-lg text-center mb-4">
              작성중인 내용은 사라집니다. 뒤로 가시겠습니까?
            </h3>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-[#F7B32B] text-white rounded hover:bg-[#E09D18] transition-colors"
                onClick={() => {
                  setShowCancelModal(false)
                  setExpandedStoreId(null)
                  setEditingReviewId(null)
                }}
              >
                확인
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowCancelModal(false)}
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

export default ReviewManagementPage
