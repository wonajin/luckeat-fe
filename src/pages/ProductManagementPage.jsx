import React, { useEffect, useState } from 'react'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import ProductManagement from '../components/products/ProductManagement'
import { getMyStore } from '../api/storeApi'
import { useNavigate } from 'react-router-dom'

const ProductManagementPage = () => {
  const navigate = useNavigate()
  const [storeData, setStoreData] = useState(null)

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await getMyStore()
        if (!response.success || !response.data || !response.data.id) {
          navigate('/no-registered-store')
          return
        }
        setStoreData(response.data)
      } catch (error) {
        console.error('가게 정보 로딩 중 오류:', error)
        navigate('/no-registered-store')
      }
    }

    fetchStoreData()
  }, [navigate])

  return (
    <div className="flex flex-col h-full">
      <Header title="상품 관리" />
      <div className="flex-1 overflow-y-auto">
        <ProductManagement />
      </div>
      <Navigation />
    </div>
  )
}

export default ProductManagementPage 