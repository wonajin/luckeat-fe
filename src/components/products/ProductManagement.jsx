import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getStoreProducts, createProduct, updateProduct, deleteProduct, updateProductStatus } from '../../api/productApi'
import { getStoreById } from '../../api/storeApi'

const ProductManagement = () => {
  const { storeId } = useParams()
  console.log('상품 관리 페이지 storeId:', storeId)
  const [storeName, setStoreName] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedProductId, setExpandedProductId] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [productImage, setProductImage] = useState(null)
  const [productImageUrl, setProductImageUrl] = useState('')
  const [formData, setFormData] = useState({
    productName: '',
    originalPrice: '',
    discountedPrice: ''
  })
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })

  // 상품 목록 로드
  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getStoreProducts(storeId)
      setProducts(data || [])
      
      // 가게 정보 로드
      const storeData = await getStoreById(storeId)
      if (storeData.success) {
        setStoreName(storeData.data.storeName)
      }
    } catch (error) {
      console.error('상품 목록 로드 실패:', error)
      showToast('상품 목록을 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [storeId])

  // 토스트 메시지 표시
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 3000)
  }

  // 카드 펼치기/접기
  const toggleCard = (productId) => {
    setExpandedProductId(expandedProductId === productId ? null : productId)
  }

  // 상품 수정 모달 열기
  const openEditModal = (product) => {
    setCurrentProduct(product)
    setFormData({
      productName: product.productName,
      originalPrice: product.originalPrice.toString(),
      discountedPrice: product.discountedPrice.toString()
    })
    setProductImage(null)
    setProductImageUrl(product.productImg || '')
    setEditMode(true)
    setIsModalVisible(true)
  }

  // 상품 추가 모달 열기
  const openAddModal = () => {
    setCurrentProduct(null)
    setFormData({
      productName: '',
      originalPrice: '',
      discountedPrice: ''
    })
    setProductImage(null)
    setProductImageUrl('')
    setEditMode(false)
    setIsModalVisible(true)
  }

  // 입력 필드 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 폼 유효성 검사
  const validateForm = () => {
    let isValid = true
    const newErrors = {}

    if (!formData.productName.trim()) {
      newErrors.productName = '상품명을 입력하세요'
      isValid = false
    }

    if (!formData.originalPrice) {
      newErrors.originalPrice = '원가를 입력하세요'
      isValid = false
    }

    if (!formData.discountedPrice) {
      newErrors.discountedPrice = '할인가를 입력하세요'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // 상품 추가 또는 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      if (editMode && currentProduct) {
        // 상품 수정
        const updatedFormData = {
          ...formData,
          originalPrice: parseInt(formData.originalPrice),
          discountedPrice: parseInt(formData.discountedPrice)
        };
        
        if (!productImage && currentProduct.productImg) {
          // 이미지가 선택되지 않았고 기존 이미지가 있는 경우
          // 이미지 URL을 폼 데이터에 포함시켜 기존 이미지를 유지
          updatedFormData.productImg = currentProduct.productImg;
        }
        
        await updateProduct(storeId, currentProduct.productId, updatedFormData, productImage)
        showToast('상품이 수정되었습니다.')
      } else {
        // 상품 등록 (API 요청 형식에 맞게 데이터 구성)
        const productRequestData = {
          productId: 0, // 신규 상품 등록 시 0으로 설정
          productName: formData.productName,
          originalPrice: parseInt(formData.originalPrice),
          discountedPrice: parseInt(formData.discountedPrice)
        };
        
        await createProduct(storeId, productRequestData, productImage)
        showToast('상품이 등록되었습니다.')
      }
      
      setIsModalVisible(false)
      loadProducts() // 상품 목록 새로고침
    } catch (error) {
      console.error('상품 저장 실패:', error)
      showToast('상품 저장에 실패했습니다.', 'error')
    }
  }

  // 상품 삭제 확인
  const confirmDelete = (product) => {
    setCurrentProduct(product)
    setConfirmModalVisible(true)
  }

  // 상품 삭제 실행
  const handleDelete = async () => {
    try {
      await deleteProduct(storeId, currentProduct.productId)
      showToast('상품이 삭제되었습니다.')
      setConfirmModalVisible(false)
      loadProducts() // 상품 목록 새로고침
    } catch (error) {
      console.error('상품 삭제 실패:', error)
      showToast('상품 삭제에 실패했습니다.', 'error')
    }
  }

  // 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProductImage(file)
      setProductImageUrl(URL.createObjectURL(file))
    }
  }

  // 상품 상태 변경 (스위치)
  const handleStatusChange = async (product) => {
    const newStatus = !product.isOpen
    try {
      // API 호출로 상태 변경
      await updateProductStatus(storeId, product.productId, newStatus)
      
      // UI 업데이트
      const updatedProducts = products.map((p) => 
        p.productId === product.productId ? {...p, isOpen: newStatus} : p
      )
      setProducts(updatedProducts)
      showToast(`상품이 ${newStatus ? '활성화' : '비활성화'} 되었습니다.`)
    } catch (error) {
      console.error('상품 상태 변경 실패:', error)
      showToast('상품 상태 변경에 실패했습니다.', 'error')
    }
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-5">{storeName || '상품 관리'}</h1>
      
      {/* 상품 카드 목록 */}
      <div className="mb-20">
        {products.length > 0 ? (
          products.map((product) => (
            <div 
              key={product.productId} 
              className="border rounded-lg mb-4 overflow-hidden shadow-sm bg-white"
            >
              <div 
                className="flex p-3 cursor-pointer"
                onClick={() => toggleCard(product.productId)}
              >
                <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                  <img
                    src={product.productImg || 'https://via.placeholder.com/150?text=상품이미지'}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; // 오류 핸들러 제거하여 무한 루프 방지
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZHk9Ii4zZW0iPuydtOuvuOyngOy8nDwvdGV4dD48L3N2Zz4='; // 로컬 SVG 데이터 URI 사용
                    }}
                  />
                </div>
                <div className="flex-1 ml-3">
                  <h3 className="font-bold">{product.productName}</h3>
                  <div className="flex flex-col text-sm text-gray-500">
                    <p className="mr-2">원가: {product.originalPrice.toLocaleString()}원</p>
                    <p className="mr-2">할인가: {product.discountedPrice.toLocaleString()}원</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div 
                    className={`relative inline-block w-10 h-5 ${product.isOpen ? 'bg-yellow-500' : 'bg-gray-300'} rounded-full cursor-pointer transition-colors ease-in-out duration-200`}
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 버블링 방지
                      handleStatusChange(product);
                    }}
                  >
                    <span 
                      className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${product.isOpen ? 'translate-x-5' : 'translate-x-1'}`} 
                    />
                  </div>
                </div>
              </div>
              
              {expandedProductId === product.productId && (
                <div className="p-3 pt-0 border-t">
                  {product.description && (
                    <div className="mb-3">
                      <span className="font-medium">설명:</span>
                      <p className="text-sm text-gray-700 mt-1">{product.description}</p>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      className="py-1.5 px-3 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(product)}
                      className="py-1.5 px-3 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <p>등록된 상품이 없습니다.</p>
          </div>
        )}
        
        {/* 상품 목록 끝에 상품 추가 버튼 */}
        <div 
          onClick={openAddModal}
          className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 transition-colors mb-10"
        >
          <div className="bg-yellow-500 rounded-full w-12 h-12 flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">상품 추가하기</p>
        </div>
        
        {/* 하단 고정 상품 추가 버튼 */}
        <div className="fixed bottom-20 right-4 z-10">
          <button
            onClick={openAddModal}
            className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 토스트 메시지 */}
      {toast.show && (
        <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-black bg-opacity-70'
        } text-white`}>
          {toast.message}
        </div>
      )}
      
      {/* 상품 추가/수정 모달 */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-11/12 max-w-sm mx-auto">
            <h3 className="font-bold text-lg mb-4">{editMode ? '상품 수정' : '상품 추가'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productName">
                  상품명
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${errors.productName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="상품명"
                />
                {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="originalPrice">
                    원가
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="originalPrice"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-lg ${errors.originalPrice ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="원가"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">원</span>
                  </div>
                  {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discountedPrice">
                    할인가
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="discountedPrice"
                      name="discountedPrice"
                      value={formData.discountedPrice}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-lg ${errors.discountedPrice ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="할인가"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">원</span>
                  </div>
                  {errors.discountedPrice && <p className="text-red-500 text-xs mt-1">{errors.discountedPrice}</p>}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  상품 이미지
                </label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-yellow-500"
                >
                  {productImageUrl ? (
                    <img
                      src={productImageUrl}
                      alt="상품 이미지"
                      className="h-32 mx-auto object-contain"
                    />
                  ) : (
                    <div className="py-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">이미지 업로드</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalVisible(false)}
                  className="py-2 px-4 bg-gray-300 hover:bg-gray-400 rounded-lg text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm"
                >
                  {editMode ? '수정하기' : '추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 삭제 확인 모달 */}
      {confirmModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-11/12 max-w-xs mx-auto">
            <h3 className="font-bold text-lg text-center mb-3">상품 삭제</h3>
            <p className="text-center mb-4 text-sm">정말로 "{currentProduct?.productName}" 상품을 삭제하시겠습니까?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setConfirmModalVisible(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg text-sm"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManagement 