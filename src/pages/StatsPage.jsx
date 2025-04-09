import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyStore } from '../api/storeApi'

function StatsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await getMyStore()
        if (response.success && response.data && response.data.id) {
          // 가게 정보가 있는 경우 처리
          // ... existing code ...
        } else {
          // 가게 정보가 없는 경우 안내 페이지로 리디렉션
          navigate('/no-registered-store')
          return
        }
      } catch (error) {
        console.error('가게 정보 로딩 중 오류:', error)
        navigate('/no-registered-store')
      }
    }

    if (user) {
      fetchStoreData()
    }
  }, [user, navigate])

  // ... existing code ...
}

export default StatsPage 