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
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [formData, setFormData] = useState({
    productName: '',
    originalPrice: '',
    discountedPrice: '',
    description: '',
    stock: 1,
  })
  const [errors, setErrors] = useState({})
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

  // 상품 수정 모달 열기
  const openEditModal = (product) => {
    setCurrentProduct(product)
    setFormData({
      productName: product.productName,
      originalPrice: product.originalPrice.toString(),
      discountedPrice: product.discountedPrice.toString(),
      description: product.description || '',
      stock: product.productCount || 1,
    })
    setEditMode(true)
    setIsModalVisible(true)
  }

  // 상품 추가 모달 열기
  const openAddModal = () => {
    setCurrentProduct(null)
    setFormData({
      productName: '',
      originalPrice: '',
      discountedPrice: '',
      description: '',
      stock: 1,
    })
    setEditMode(false)
    setIsModalVisible(true)
  }

  // 입력 필드 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // 가격 필드인 경우 숫자만 입력되도록 유효성 검사 추가
    if (name === 'originalPrice' || name === 'discountedPrice') {
      if (!/^\d*$/.test(value)) {
        setErrors({
          ...errors,
          [name]: '숫자만 입력해주세요',
        })
      } else {
        // 에러 제거
        const updatedErrors = { ...errors }
        delete updatedErrors[name]
        setErrors(updatedErrors)
      }
    }
  }

  // 재고 증가 처리
  const increaseStock = () => {
    setFormData(prev => ({
      ...prev,
      stock: Number(prev.stock) + 1
    }))
  }

  // 재고 감소 처리
  const decreaseStock = () => {
    if (formData.stock > 1) {
      setFormData(prev => ({
        ...prev,
        stock: Number(prev.stock) - 1
      }))
    }
  }

  // 폼 유효성 검사
  const validateForm = () => {
    let isValid = true
    const newErrors = {}

    if (!formData.productName.trim()) {
      newErrors.productName = '패키지명을 입력하세요'
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

    if (!formData.description) {
      newErrors.description = '패키지 설명을 입력하세요'
      isValid = false
    } else if (formData.description.length < 10) {
      newErrors.description = '패키지 설명은 10글자 이상 입력해주세요'
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
        const updatedFormData = {
          ...formData,
          originalPrice: parseInt(formData.originalPrice),
          discountedPrice: parseInt(formData.discountedPrice),
          description: formData.description,
          stock: parseInt(formData.stock)
        }
        
        await updateProduct(storeId, currentProduct.id, updatedFormData)
        showToast('럭키트가 수정되었습니다.')
      } else {
        if (products.length > 0) {
          showToast('럭키트는 한 개만 등록 가능합니다. 기존 럭키트를 수정하세요.', 'error')
          return
        }
        
        const productRequestData = {
          productName: formData.productName,
          originalPrice: parseInt(formData.originalPrice),
          discountedPrice: parseInt(formData.discountedPrice),
          description: formData.description,
          stock: parseInt(formData.stock),
          isOpen: true // 기본값 추가
        }
        
        await createProduct(storeId, productRequestData)
        showToast('럭키트가 등록되었습니다.')
      }
      
      setIsModalVisible(false)
      loadProducts()
    } catch (error) {
      console.error('럭키트 저장 실패:', error)
      showToast('럭키트 저장에 실패했습니다.', 'error')
    }
  }

  // 삭제 확인 모달 표시
  const openDeleteConfirm = (product) => {
    setCurrentProduct(product)
    setConfirmModalVisible(true)
  }

  // 상품 삭제 처리
  const handleDeleteProduct = async () => {
    try {
      if (!currentProduct) return
      
      await deleteProduct(storeId, currentProduct.id)
      showToast('럭키트가 삭제되었습니다.')
      setConfirmModalVisible(false)
      loadProducts() // 상품 목록 새로고침
    } catch (error) {
      console.error('럭키트 삭제 실패:', error)
      showToast('럭키트 삭제에 실패했습니다.', 'error')
    }
  }

  // 상품 상태 토글 (활성화/비활성화)
  const toggleProductStatus = async (product) => {
    try {
      const newStatus = !product.isOpen
      const response = await updateProductStatus(storeId, product.id, newStatus)
      
      // response가 직접 상품 데이터를 반환하므로 이를 사용하여 상태 업데이트
      if (response) {
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.id === product.id ? response : p
          )
        )
        showToast(`럭키트가 ${response.isOpen ? '활성화' : '비활성화'} 되었습니다.`)
      } else {
        showToast('럭키트 상태 변경에 실패했습니다.', 'error')
      }
    } catch (error) {
      console.error('럭키트 상태 변경 실패:', error)
      showToast('럭키트 상태 변경에 실패했습니다.', 'error')
    }
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-6">럭키트 관리</h1>
      
      {/* 럭키트 설명 추가 */}
      <div className="mb-6 bg-[#FFF8E8] p-4 rounded-lg border border-[#F7B32B] text-sm">
        <h3 className="font-bold text-[#F7B32B] mb-2">💡 럭키트란?</h3>
        <p className="text-gray-700 mb-2">
          하루 영업이 끝나고 남은 음식들을 랜덤으로 한 봉투에 담아 할인된 가격에 판매하는 상품입니다.
        </p>
        <p className="text-gray-700 font-medium">
          ⚠️ 럭키트는 한 가게당 하나만 등록할 수 있습니다.
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F7B32B]"></div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2">가게 정보</h2>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-700">
                <span className="font-medium">가게명:</span> {storeName}
              </p>
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 mb-4">등록된 럭키트가 없습니다.</p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-[#F7B32B] hover:bg-[#E09D18] text-white font-medium rounded-lg transition-colors"
              >
                럭키트 등록하기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.productId}
                  className={`bg-white rounded-lg shadow-md overflow-hidden ${
                    !product.isOpen ? 'opacity-60' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className={`text-white text-xs font-medium px-2 py-1 rounded mr-2 ${
                          product.isOpen ? 'bg-[#F7B32B]' : 'bg-gray-400'
                        }`}>
                          럭키트
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {product.productName}
                        </h3>
                      </div>
                      <div>
                        <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          product.isOpen 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          재고: {product.productCount || 1}개
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-baseline">
                        <span className="text-lg font-bold text-red-600">
                          {product.discountedPrice.toLocaleString()}원
                        </span>
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          {product.originalPrice.toLocaleString()}원
                        </span>
                        <span className="ml-2 text-xs text-blue-600">
                          {Math.round((1 - product.discountedPrice / product.originalPrice) * 100)}% 할인
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => toggleProductStatus(product)}
                        className={`text-xs px-3 py-1 rounded ${
                          product.isOpen
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                        }`}
                      >
                        {product.isOpen ? '활성화' : '비활성화'}
                      </button>
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(product)}
                        className="text-xs px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* 상품 추가/수정 모달 */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-md mx-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editMode ? '럭키트 수정' : '럭키트 등록'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                {/* 패키지명 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    패키지명
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="럭키트 이름을 입력하세요"
                  />
                  {errors.productName && (
                    <p className="text-red-500 text-xs mt-1">{errors.productName}</p>
                  )}
                </div>
                  
                
                {/* 가격 정보 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      원가
                    </label>
                    <input
                      type="text"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="원가 (원)"
                    />
                    {errors.originalPrice && (
                      <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      할인가
                    </label>
                    <input
                      type="text"
                      name="discountedPrice"
                      value={formData.discountedPrice}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="할인가 (원)"
                    />
                    {errors.discountedPrice && (
                      <p className="text-red-500 text-xs mt-1">{errors.discountedPrice}</p>
                    )}
                  </div>
                </div>
                
                {/* 재고 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    재고 수량
                  </label>
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm text-gray-500">현재 재고: {currentProduct?.productCount || 1}개</p>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={decreaseStock}
                        className="p-2 bg-gray-200 rounded-l-md"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className="w-full p-2 border-y border-gray-300 text-center"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={increaseStock}
                        className="p-2 bg-gray-200 rounded-r-md"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                    
                {/* 상품 설명 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    패키지 설명
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="럭키트에 포함될 수 있는 음식들을 설명해주세요"
                  ></textarea>
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                  )}
                </div>
                
                {/* 버튼 */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalVisible(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#F7B32B] hover:bg-[#E09D18] rounded-md"
                  >
                    저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* 삭제 확인 모달 */}
      {confirmModalVisible && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm mx-auto p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">럭키트 삭제</h3>
            <p className="text-sm text-gray-500 mb-4">
              정말로 이 럭키트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setConfirmModalVisible(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 토스트 메시지 */}
      {toast.show && (
        <div
          className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white text-sm`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default ProductManagement 