import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import luckeatDefaultImage from '../assets/images/luckeat_default_image.webp'
import Header from '../components/layout/Header'

const NoRegisteredStorePage = () => {
  const navigate = useNavigate()

  // 뒤로가기 방지
  useEffect(() => {
    const preventGoBack = (e) => {
      e.preventDefault()
      // 대신 비즈니스 페이지로 이동
      navigate('/business')
    }
    
    window.history.pushState(null, '', window.location.pathname)
    window.addEventListener('popstate', preventGoBack)
    
    return () => {
      window.removeEventListener('popstate', preventGoBack)
    }
  }, [navigate])

  return (
    <div className="flex flex-col h-full">
      <Header title="가게 정보" />
      <div className="flex-1 flex flex-col items-center justify-start pt-12 px-4 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md text-center space-y-6">
          <img
            src={luckeatDefaultImage}
            alt="럭킷 기본 이미지"
            className="mx-auto w-64 h-64 object-contain"
          />
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">등록된 가게가 없습니다</h1>
            <p className="text-lg text-gray-600">
              가게 등록을 원하시면{' '}
              <a
                href="mailto:luckeatnet@gmail.com"
                className="text-yellow-500 hover:text-yellow-600 font-semibold"
              >
                luckeatnet@gmail.com
              </a>
              로 연락주세요!
            </p>
          </div>
          <button
            onClick={() => navigate('/business')}
            className="mt-8 px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            사업자 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoRegisteredStorePage