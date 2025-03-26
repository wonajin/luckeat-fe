import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import Header from '../components/layout/Header'
import { useAuth } from '../context/AuthContext'
import { getUserInfo } from '../api/userApi'
import { getMyStore } from '../api/storeApi'
import StoreCard from '../components/store/StoreCard'

function BusinessPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [userData, setUserData] = useState(null)
  const [storeData, setStoreData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // 사용자 정보와 가게 정보 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 사용자 정보 가져오기
        const userResponse = await getUserInfo()
        if (userResponse.success) {
          setUserData(userResponse.data)
        }

        // 가게 정보 가져오기
        const storeResponse = await getMyStore()
        if (storeResponse.success) {
          setStoreData(storeResponse.data)
        }
      } catch (error) {
        console.error('데이터 로딩 중 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const handleLogout = async () => {
    try {
      const result = await logout()
      if (result.success) {
        navigate('/')
      } else {
        console.error('로그아웃 실패:', result.message)
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error)
    } finally {
      setShowLogoutModal(false)
    }
  }

  // API에서 가져온 사용자 정보가 없으면, 로컬 상태의 사용자 정보 사용
  const displayUser = userData || user || {}

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <Header title="사업자 페이지" />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F7B32B]"></div>
          </div>
        ) : (
          <>
            {/* 사업자 페이지 제목 */}
            <div className="p-6 text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                사업자 페이지
              </h1>
            </div>
            
            {/* 가게 정보 카드 */}
            {storeData ? (
              <div className="px-4 mb-6">
                <h2 className="text-xl font-bold text-gray-700 mb-3">
                  내 가게 정보
                </h2>
                <StoreCard store={storeData} />
              </div>
            ) : (
              <div className="px-4 py-6 mb-6 bg-gray-100 rounded-lg mx-4 text-center">
                <p className="text-gray-600 mb-3">
                  등록된 가게 정보가 없습니다.
                </p>
                <button
                  className="py-2 px-4 bg-[#F7B32B] hover:bg-[#E09D18] text-white font-bold rounded transition-colors"
                  onClick={() => navigate('/register-store')}
                >
                  가게 등록하기
                </button>
              </div>
            )}
            
            <div className="mt-6">
              {/* 메뉴 목록 */}
              <div className="p-4 space-y-4">
                <div className="border-b pb-2">
                  <button
                    className="w-full text-left font-bold text-gray-700 flex justify-between items-center"
                    onClick={() => navigate('/edit-product')}
                  >
                    <span>상품 정보 수정</span>
                    <span className="text-gray-400">→</span>
                  </button>
                </div>

                <div className="border-b pb-2">
                  <button
                    className="w-full text-left font-bold text-gray-700 flex justify-between items-center"
                    onClick={() => navigate('/edit-store')}
                  >
                    <span>가게 정보 수정</span>
                    <span className="text-gray-400">→</span>
                  </button>
                </div>

                <div className="border-b pb-2">
                  <button
                    className="w-full text-left font-bold text-gray-700 flex justify-between items-center"
                    onClick={() => setShowLogoutModal(true)}
                  >
                    <span>로그아웃</span>
                    <span className="text-gray-400">→</span>
                  </button>
                </div>

                <div className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold">고객 문의</span>
                    <span className="text-gray-400">luckeat@example.com</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 푸터 */}
        <div className="p-4 mt-auto">
          <p className="text-center text-sm text-gray-400">
            Copyright @MYRO Corp. All Rights Reserved
          </p>
        </div>
      </div>

      {/* 로그아웃 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-xs">
            <h3 className="font-bold text-lg text-center mb-4">로그아웃</h3>
            <p className="text-center mb-4">로그아웃 하시겠습니까?</p>
            <div className="flex space-x-2">
              <button
                className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg"
                onClick={() => setShowLogoutModal(false)}
              >
                취소
              </button>
              <button
                className="flex-1 py-2 bg-[#F7B32B] hover:bg-[#E09D18] text-white font-bold rounded-lg transition-colors"
                onClick={handleLogout}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  )
}

export default BusinessPage
