import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import { useAuth } from '../context/AuthContext'
import { getMyStore, updateStore } from '../api/storeApi'

function EditStorePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    storeName: '',
    storeImg: '',
    address: '',
    website: '',
    storeUrl: '',
    permissionUrl: '',
    latitude: 0,
    longitude: 0,
    contactNumber: '',
    description: '',
    businessNumber: '',
    businessHours: '',
    reviewSummary: '',
    avgRating: 0,
    avgRatingGoogle: 0,
    googlePlaceId: '',
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await getMyStore()
        if (response.success) {
          setStore(response.data)
          setFormData({
            storeName: response.data.storeName || '',
            storeImg: response.data.storeImg || '',
            address: response.data.address || '',
            website: response.data.website || '',
            storeUrl: response.data.storeUrl || '',
            permissionUrl: response.data.permissionUrl || '',
            latitude: response.data.latitude || 0,
            longitude: response.data.longitude || 0,
            contactNumber: response.data.contactNumber || '',
            description: response.data.description || '',
            businessNumber: response.data.businessNumber || '',
            businessHours: response.data.businessHours || '',
            reviewSummary: response.data.reviewSummary || '',
            avgRating: response.data.avgRating || 0,
            avgRatingGoogle: response.data.avgRatingGoogle || 0,
            googlePlaceId: response.data.googlePlaceId || '',
          })
          setImagePreview(response.data.storeImg || '')
        } else {
          setError('가게 정보를 불러오는데 실패했습니다.')
        }
      } catch (error) {
        setError('가게 정보를 불러오는데 실패했습니다.')
        console.error('가게 정보 로딩 중 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStoreData()
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 파일 유효성 검사
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert(
        '지원하지 않는 파일 형식입니다. JPG, JPEG, PNG, WEBP 형식만 가능합니다.',
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.')
      return
    }

    // 이미지 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      // base64 데이터는 미리보기용으로만 사용하고, 실제 데이터는 기존 URL 유지
      setFormData((prev) => ({
        ...prev,
        storeImg: store?.storeImg || '',
      }))
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 수정된 데이터를 서버에 전송
      const dataToSubmit = {
        ...formData,
        // 기존 데이터에서 가져와야 하는 값들
        storeName: store.storeName,
        address: store.address,
        businessNumber: store.businessNumber,
        reviewSummary: store.reviewSummary || '',
        avgRating: store.avgRating || 0,
        avgRatingGoogle: store.avgRatingGoogle || 0,
        googlePlaceId: store.googlePlaceId || '',
      }

      // 디버깅을 위해 전송 데이터 로깅
      console.log('수정 요청 데이터:', dataToSubmit)
      const response = await updateStore(store.id, dataToSubmit)
      if (response.success) {
        showToastMessage('가게 정보가 성공적으로 수정되었습니다.')
        setTimeout(() => {
          navigate('/business')
        }, 1500)
      } else {
        setError(response.message || '가게 정보 수정에 실패했습니다.')
      }
    } catch (error) {
      setError('가게 정보 수정 중 오류가 발생했습니다.')
      console.error('가게 정보 수정 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="가게 정보 수정" onBack={() => navigate('/business')} />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F7B32B]"></div>
        </div>
        <Navigation />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Header title="가게 정보 수정" onBack={() => navigate('/business')} />
        <div className="flex-1 flex justify-center items-center">
          <p className="text-red-500">{error}</p>
        </div>
        <Navigation />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <Header title="가게 정보 수정" onBack={() => navigate('/business')} />

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 안내 문구 */}
          <div className="bg-blue-50 border-b border-blue-100 p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-blue-400 mt-0.5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-blue-700">
                가게 정보는 구글 맵에서 가져오는 데이터입니다.
                <br />
                주소, 영업시간 등 기본 정보 변경이 필요하시다면 구글 맵에서 수정해 주세요.
              </p>
            </div>
          </div>

          {/* 가게 이미지 */}
          <div className="relative h-44 mx-4 mt-4">
            {imagePreview ? (
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="가게 이미지"
                  className="w-full h-full object-cover brightness-75"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <label
                    htmlFor="storeImg"
                    className="bg-white bg-opacity-90 rounded-lg px-4 py-2 shadow-lg cursor-pointer hover:bg-opacity-100 flex items-center space-x-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium">
                      배경사진 변경
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <label
                  htmlFor="storeImg"
                  className="flex flex-col items-center space-y-2 cursor-pointer"
                >
                  <svg
                    className="h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">배경사진 추가</span>
                </label>
                <input
                  id="storeImg"
                  name="storeImg"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                />
              </div>
            )}
            <input
              id="storeImg"
              name="storeImg"
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
            />
          </div>

          <div className="p-4 space-y-6">
            {/* 가게 정보 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">가게 정보</h2>
              </div>
              <div className="p-4 space-y-4">
                {/* 가게명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가게명
                  </label>
                  <input
                    type="text"
                    value={store?.storeName || '정보 없음'}
                    disabled
                    className="w-full p-3 bg-gray-50 border rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* 주소 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소
                  </label>
                  <input
                    type="text"
                    value={store?.address || '정보 없음'}
                    disabled
                    className="w-full p-3 bg-gray-50 border rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* 사업자번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사업자번호
                  </label>
                  <input
                    type="text"
                    value={store?.businessNumber || '정보 없음'}
                    disabled
                    className="w-full p-3 bg-gray-50 border rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* 리뷰 요약 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    리뷰 요약
                  </label>
                  <div className="bg-gray-50 p-4 border rounded-lg text-gray-700">
                    {store?.reviewSummary ? (
                      <p className="text-sm leading-relaxed">{store.reviewSummary}</p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        리뷰 요약 정보가 없습니다.
                      </p>
                    )}
                  </div>
                </div>

                {/* 영업시간 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    영업시간
                  </label>
                  <textarea
                    name="businessHours"
                    value={store?.businessHours || '정보 없음'}
                    disabled
                    className="w-full p-3 bg-gray-50 border rounded-lg text-gray-500 cursor-not-allowed"
                    rows="3"
                    placeholder="영업시간을 입력해주세요"
                  />
                </div>

                {/* 가게 소개 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가게 소개
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F7B32B] focus:border-transparent"
                    rows="4"
                    placeholder="가게 소개를 입력해주세요"
                    required
                  />
                </div>

                {/* 연락처 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F7B32B] focus:border-transparent"
                    placeholder="연락처를 입력해주세요"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-bold ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#F7B32B] hover:bg-[#E09D18] active:bg-[#D08D08]'
              } transition-colors`}
            >
              {loading ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </form>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      <Navigation />
    </div>
  )
}

export default EditStorePage 