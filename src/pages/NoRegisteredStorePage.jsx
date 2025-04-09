import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import storeDefaultImage from '../assets/images/luckeat_default_image.webp'

function NoRegisteredStorePage() {
  const navigate = useNavigate()

  // 뒤로가기 방지
  useEffect(() => {
    // 뒤로가기 시 비즈니스 페이지로 이동
    const handlePopState = () => {
      navigate('/business', { replace: true })
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [navigate])

  return (
    <div className="flex flex-col h-full">
      <Header title="등록된 가게 없음" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <img
          src={storeDefaultImage}
          alt="기본 이미지"
          className="w-40 h-40 object-cover rounded-lg mb-6"
        />
        
        <h2 className="text-xl font-bold mb-4">
          등록된 가게가 없습니다
        </h2>
        
        <p className="text-gray-600 mb-6">
          가게 등록은 luckeatnet@gmail.com으로 문의해주세요.
        </p>
        
        <button
          onClick={() => navigate('/business')}
          className="px-6 py-2 bg-yellow-500 text-white font-medium rounded-lg shadow"
        >
          비즈니스 페이지로 돌아가기
        </button>
      </div>
    </div>
  )
}

export default NoRegisteredStorePage 