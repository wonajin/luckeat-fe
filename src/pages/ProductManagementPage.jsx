import React from 'react'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import ProductManagement from '../components/products/ProductManagement'

const ProductManagementPage = () => {
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