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
    pickupTime: '',
    avgRating: 0,
    avgRatingGoogle: 0,
    googlePlaceId: '',
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [storeImageFile, setStoreImageFile] = useState(null)
  const [timeRange, setTimeRange] = useState({
    openTime: '09:00',
    closeTime: '18:00',
  })
  const [pickupTimeRange, setPickupTimeRange] = useState({
    startTime: '09:00',
    endTime: '17:30',
  })
  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false)
  const [errors, setErrors] = useState({
    storeName: '',
    address: '',
    businessNumber: '',
    contactNumber: '',
    description: '',
    pickupTime: ''
  })

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
            pickupTime: response.data.pickupTime || '',
            avgRating: response.data.avgRating || 0,
            avgRatingGoogle: response.data.avgRatingGoogle || 0,
            googlePlaceId: response.data.googlePlaceId || '',
          })
          setImagePreview(response.data.storeImg || '')
          if (response.data.businessHours) {
            const times = response.data.businessHours.split(' - ')
            if (times.length === 2) {
              setTimeRange({
                openTime: times[0],
                closeTime: times[1]
              })
            }
          }
          
          if (response.data.pickupTime) {
            const pickupTimes = response.data.pickupTime.split(' - ')
            if (pickupTimes.length === 2) {
              setPickupTimeRange({
                startTime: pickupTimes[0],
                endTime: pickupTimes[1]
              })
            }
          }
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

    // 이미지 파일 저장
    setStoreImageFile(file)
    
    // 이미지 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
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
    
    // 에러 초기화
    const newErrors = {}
    let hasError = false

    try {
      // 사업자 번호 유효성 검사
      const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/
      if (formData.businessNumber && !businessNumberRegex.test(formData.businessNumber)) {
        newErrors.businessNumber = '사업자 번호는 XXX-XX-XXXXX 형식으로 입력해주세요.'
        hasError = true
      }

      // 연락처 유효성 검사
      const phoneRegex = /^(0\d{1,2}-\d{3,4}-\d{4})$/
      if (formData.contactNumber && !phoneRegex.test(formData.contactNumber)) {
        newErrors.contactNumber = '연락처는 0XX-XXXX-XXXX 또는 0X-XXXX-XXXX 형식으로 입력해주세요.'
        hasError = true
      }

      // 가게 소개 길이 검사
      if (formData.description && formData.description.length > 1000) {
        newErrors.description = '가게 소개는 1000자 이하로 입력해주세요.'
        hasError = true
      }

      // 필수 입력 필드 검사
      if (!formData.storeName.trim()) {
        newErrors.storeName = '가게명은 필수 입력 항목입니다.'
        hasError = true
      } else if (formData.storeName.length > 255) {
        newErrors.storeName = '가게명은 255자 이하로 입력해주세요.'
        hasError = true
      }

      if (!formData.address.trim()) {
        newErrors.address = '주소는 필수 입력 항목입니다.'
        hasError = true
      } else if (formData.address.length < 5 || formData.address.length > 255) {
        newErrors.address = '주소는 5-255자 사이로 입력해주세요.'
        hasError = true
      }

      // 시간 유효성 검사
      const startTime = new Date(`2000-01-01T${pickupTimeRange.startTime}`)
      const endTime = new Date(`2000-01-01T${pickupTimeRange.endTime}`)
      
      if (startTime >= endTime) {
        newErrors.pickupTime = '픽업 시작 시간은 종료 시간보다 빨라야 합니다.'
        hasError = true
      }

      // 에러가 있으면 제출하지 않음
      if (hasError) {
        setErrors(newErrors)
        setLoading(false)
        return
      }

      // 모든 유효성 검사를 통과한 경우 데이터 제출
      const dataToSubmit = {
        ...formData,
        storeName: formData.storeName || store.storeName,
        address: formData.address || store.address,
        businessNumber: formData.businessNumber || store.businessNumber,
        categoryId: store.categoryId,
        businessHours: formData.businessHours || store.businessHours,
        description: formData.description === '' ? ' ' : formData.description,
        contactNumber: formData.contactNumber || store.contactNumber || '',
        pickupTime: `${pickupTimeRange.startTime} - ${pickupTimeRange.endTime}`,
        avgRating: store.avgRating || 0,
        avgRatingGoogle: store.avgRatingGoogle || 0,
        googlePlaceId: store.googlePlaceId || '',
      }

      const response = await updateStore(store.id, dataToSubmit, storeImageFile)
      if (response.success) {
        navigate('/business')
      } else {
        setError(response.message || '가게 정보 수정에 실패했습니다.')
        showToastMessage(response.message || '가게 정보 수정에 실패했습니다.')
      }
    } catch (error) {
      setError('가게 정보 수정 중 오류가 발생했습니다.')
      showToastMessage('가게 정보 수정 중 오류가 발생했습니다.')
      console.error('가게 정보 수정 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTimeChange = (e) => {
    const { name, value } = e.target
    setTimeRange((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // 업무 시간 형식을 "09:00 - 18:00" 형태로 formData에 저장
    const updatedBusinessHours = name === 'openTime'
      ? `${value} - ${timeRange.closeTime}`
      : `${timeRange.openTime} - ${value}`
      
    setFormData((prev) => ({
      ...prev,
      businessHours: updatedBusinessHours,
    }))
  }
  
  const handlePickupTimeChange = (e) => {
    const { name, value } = e.target
    setPickupTimeRange((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // 픽업 시간 형식을 "09:00 - 17:30" 형태로 formData에 저장
    const updatedPickupTime = name === 'startTime'
      ? `${value} - ${pickupTimeRange.endTime}`
      : `${pickupTimeRange.startTime} - ${value}`
      
    setFormData((prev) => ({
      ...prev,
      pickupTime: updatedPickupTime,
    }))
  }
  
  const togglePickupTimePicker = () => {
    setShowPickupTimePicker(!showPickupTimePicker)
  }

  // 시간 옵션 생성 (30분 간격)
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0')
        const formattedMinute = minute.toString().padStart(2, '0')
        options.push(`${formattedHour}:${formattedMinute}`)
      }
    }
    return options
  }
  
  const timeOptions = generateTimeOptions()

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
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F7B32B] focus:border-transparent ${
                      errors.storeName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={store?.storeName || '정보 없음'}
                  />
                  {errors.storeName && (
                    <p className="mt-1 text-sm text-red-500">{errors.storeName}</p>
                  )}
                </div>

                {/* 주소 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F7B32B] focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={store?.address || '정보 없음'}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                {/* 사업자번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사업자번호
                  </label>
                  <input
                    type="text"
                    name="businessNumber"
                    value={formData.businessNumber}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F7B32B] focus:border-transparent ${
                      errors.businessNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={store?.businessNumber || '정보 없음'}
                  />
                  {errors.businessNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.businessNumber}</p>
                  )}
                </div>

                {/* 운영시간 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    운영시간
                  </label>
                  <textarea
                    name="businessHours"
                    value={formData.businessHours}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F7B32B] focus:border-transparent"
                    rows="3"
                    placeholder={store?.businessHours || '운영시간을 입력해주세요'}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    예시) 09:00 - 18:00
                  </p>
                </div>

                {/* 픽업 시간 */}
                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-gray-700 font-medium">픽업 가능 시간</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      name="startTime"
                      value={pickupTimeRange.startTime}
                      onChange={handlePickupTimeChange}
                      className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 w-1/2"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="time"
                      name="endTime"
                      value={pickupTimeRange.endTime}
                      onChange={handlePickupTimeChange}
                      className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 w-1/2"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    현재 설정: {store?.pickupTime || '미설정'}
                  </p>
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
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F7B32B] focus:border-transparent ${
                      errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="연락처를 입력해주세요"
                  />
                  {errors.contactNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.contactNumber}</p>
                  )}
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