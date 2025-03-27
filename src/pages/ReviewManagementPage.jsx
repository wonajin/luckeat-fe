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

function ReviewManagementPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
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

  // 작성 가능한 가게와 작성한 리뷰 초기화
  useEffect(() => {
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

        // 리뷰 작성 가능한 가게 목록 가져오기
        try {
          const storesResponse = await getStores()
          if (storesResponse && storesResponse.data) {
            // 이미 리뷰를 작성한 가게 ID 목록
            const reviewedStoreIds = new Set(
              writtenReviews.map((review) => review.storeId),
            )

            // 아직 리뷰를 작성하지 않은 가게만 필터링
            const availableStores = storesResponse.data.stores
              ? storesResponse.data.stores.filter(
                  (store) => !reviewedStoreIds.has(store.id),
                )
              : []

            setWritableStores(availableStores)
            console.log('리뷰 작성 가능한 가게:', availableStores)
          }
        } catch (storeError) {
          console.error('가게 정보 로딩 실패:', storeError)
        }

        setLoading(false)
      } catch (err) {
        console.error('데이터 로딩 중 오류 발생:', err)
        setError('리뷰 데이터를 불러오는데 실패했습니다')
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    } else {
      // 로그인되어 있지 않은 경우 로그인 페이지로 리다이렉트
      navigate('/login')
    }
  }, [user, navigate])

  // 리뷰 작성 폼 토글
  const toggleReviewForm = (storeId) => {
    if (expandedStoreId === storeId) {
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
      setExpandedStoreId(storeId)
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

    if (file.size > 20 * 1024 * 1024) {
      alert('파일 크기는 20MB를 초과할 수 없습니다.')
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
  const handleSubmitReview = async (storeId) => {
    if (!newReview.content) {
      alert('리뷰 내용을 입력해주세요.')
      return
    }

    try {
      // 리뷰 데이터 구성
      const reviewData = {
        storeId: storeId,
        rating: newReview.rating,
        reviewContent: newReview.content,
        reviewImage: newReview.image || null,
      }

      // API로 리뷰 생성
      const response = await createReview(reviewData)

      if (response && response.message === '리뷰 작성 성공') {
        // 성공적으로 리뷰가 생성되면 리뷰 목록을 업데이트
        const store = writableStores.find((s) => s.id === storeId)

        const newReviewObj = {
          id: response.reviewId || Date.now(), // API에서 반환된 ID 또는 임시 ID
          storeId,
          storeName: store ? store.storeName || store.name : '가게 정보',
          userName: user?.nickname || '사용자',
          rating: newReview.rating,
          content: newReview.content,
          image: newReview.imagePreview,
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
          prev.filter((store) => store.id !== storeId),
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

        alert('리뷰가 성공적으로 작성되었습니다.')
      } else {
        alert(
          '리뷰 작성에 실패했습니다: ' +
            (response.message || '알 수 없는 오류'),
        )
      }
    } catch (error) {
      console.error('리뷰 작성 중 오류:', error)
      alert('리뷰 작성 중 오류가 발생했습니다.')
    }
  }

  // 리뷰 수정 완료
  const handleUpdateReview = async (reviewId) => {
    if (!editReview.content) {
      alert('리뷰 내용을 입력해주세요.')
      return
    }

    try {
      // 리뷰 데이터 구성
      const reviewData = {
        rating: editReview.rating,
        reviewContent: editReview.content,
        reviewImage: editReview.image || null,
      }

      // API로 리뷰 수정
      const response = await updateReview(reviewId, reviewData)

      if (response && response.message === '리뷰 수정 성공') {
        // 성공적으로 리뷰가 수정되면 리뷰 목록을 업데이트
        setWrittenReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  rating: editReview.rating,
                  content: editReview.content,
                  image: editReview.imagePreview,
                }
              : review,
          ),
        )

        // 수정 모드 종료
        setEditingReviewId(null)

        alert('리뷰가 성공적으로 수정되었습니다.')
      } else {
        alert(
          '리뷰 수정에 실패했습니다: ' +
            (response.message || '알 수 없는 오류'),
        )
      }
    } catch (error) {
      console.error('리뷰 수정 중 오류:', error)
      alert('리뷰 수정 중 오류가 발생했습니다.')
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

      if (response && response.message === '리뷰 삭제 성공') {
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
            (s) => s.id === deletedReview.storeId,
          )
          if (storeToAdd) {
            setWritableStores((prev) => [...prev, storeToAdd])
          }
        }

        setShowDeleteModal(false)
        setReviewToDelete(null)

        alert('리뷰가 성공적으로 삭제되었습니다.')
      } else {
        alert(
          '리뷰 삭제에 실패했습니다: ' +
            (response.message || '알 수 없는 오류'),
        )
      }
    } catch (error) {
      console.error('리뷰 삭제 중 오류:', error)
      alert('리뷰 삭제 중 오류가 발생했습니다.')
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
                <div key={store.id} className="border rounded overflow-hidden">
                  <div
                    className="p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleReviewForm(store.id)}
                  >
                    <div>
                      <p className="font-semibold">{store.name}</p>
                      <p className="text-sm text-gray-500">
                        {store.orderDate} 주문
                      </p>
                    </div>
                    <button className="text-gray-700 flex items-center">
                      리뷰쓰기
                      <span
                        className={`ml-1 transform transition-transform ${expandedStoreId === store.id ? 'rotate-180' : ''}`}
                      >
                        ▼
                      </span>
                    </button>
                  </div>

                  {/* 리뷰 작성 폼 */}
                  {expandedStoreId === store.id && (
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
                        onClick={() => handleSubmitReview(store.id)}
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
                        {review.orderDate} 주문
                      </p>
                      <div className="text-[#F7B32B] my-1">
                        {editingReviewId === review.id
                          ? renderStars(editReview.rating, true, true)
                          : renderStars(review.rating)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {editingReviewId === review.id ? (
                        <>
                          <button
                            className="px-3 py-1 bg-[#F7B32B] text-white rounded hover:bg-[#E09D18] transition-colors"
                            onClick={() => handleUpdateReview(review.id)}
                          >
                            수정완료
                          </button>
                          <button
                            className="px-3 py-1 border rounded"
                            onClick={() => setEditingReviewId(null)}
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="px-3 py-1 border rounded"
                            onClick={() => toggleEditMode(review)}
                          >
                            수정
                          </button>
                          <button
                            className="px-3 py-1 border rounded"
                            onClick={() => showDeleteConfirmation(review.id)}
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

      <Navigation />
    </div>
  )
}

export default ReviewManagementPage
