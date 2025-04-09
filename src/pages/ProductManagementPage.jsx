import React, { useEffect, useState } from 'react'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import ProductManagement from '../components/products/ProductManagement'
import { getMyStore } from '../api/storeApi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // 가게 정보 확인
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const response = await getMyStore();
        
        if (response.success && response.data && response.data.id) {
          // 가게 정보가 있는 경우 처리
          // ... existing code ...
        } else {
          // 가게 정보가 없는 경우 안내 페이지로 리디렉션
          navigate('/no-registered-store');
          return;
        }
      } catch (error) {
        console.error('가게 정보 로딩 중 오류:', error);
        navigate('/no-registered-store');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStoreData();
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="상품 관리" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="상품 관리" />
      <div className="flex-1 overflow-y-auto">
        <ProductManagement />
      </div>
    </div>
  )
}

export default ProductManagementPage 