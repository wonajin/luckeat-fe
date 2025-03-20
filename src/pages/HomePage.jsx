import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/layout/Navigation'
import CategoryList from '../components/store/CategoryList'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import { getStores } from '../api/storeApi'
import { getCategories } from '../api/categoryApi'
import defaultImage from '../assets/images/luckeat-default.png'

function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [stores, setStores] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showScrollTopButton, setShowScrollTopButton] = useState(false)
  const [sortOption, setSortOption] = useState('가까운 순')
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [loading, setLoading] = useState(true)
  const sortOptionsRef = useRef(null)
  const storeListRef = useRef(null)

  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 카테고리 데이터 가져오기
        const categoriesData = await getCategories()
        console.log('카테고리 API 응답:', categoriesData)

        // 응답 구조 확인 및 로그
        const categoriesList = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData?.data || []

        console.log('처리된 카테고리 목록:', categoriesList)
        setCategories(categoriesList)

        // 가게 데이터 가져오기 - 필터 파라미터 적용
        const params = {}
        // 할인중인 가게만 보여주기 옵션이 선택된 경우 API 파라미터 추가
        if (showDiscountOnly) {
          params.isDiscountOpen = true
        }
        
        const storesData = await getStores(params)
        console.log('가게 데이터 API 응답:', storesData)

        // 데이터 구조 확인 후 적절히 설정
        const storesList = Array.isArray(storesData)
          ? storesData
          : storesData?.data || []
        console.log('처리된 가게 목록:', storesList)

        setStores(storesList)
        setFilteredStores(storesList)
        setLoading(false)
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [showDiscountOnly]) // showDiscountOnly 변경 시 데이터 다시 가져오기

  // 로딩 및 데이터 상태 디버깅
  console.log('현재 상태 - 로딩:', loading, '데이터:', stores)

  // 스크롤 위치에 따라 상단으로 이동 버튼 표시 여부 결정
  const handleScroll = () => {
    if (storeListRef.current) {
      setShowScrollTopButton(storeListRef.current.scrollTop > 300)
    }
  }

  // 상단으로 스크롤 이동
  const scrollToTop = () => {
    if (storeListRef.current) {
      storeListRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  // 정렬 옵션 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sortOptionsRef.current &&
        !sortOptionsRef.current.contains(event.target)
      ) {
        setShowSortOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 검색어, 카테고리가 변경될 때 가게 목록 필터링 (할인 필터는 API에서 처리)
  useEffect(() => {
    if (!stores || stores.length === 0) return

    let result = [...stores]
    console.log('필터링 전 가게 수:', result.length)
    console.log('선택된 카테고리:', selectedCategory)

    // 카테고리 필터링 - 백엔드 API 응답 구조에 맞게 수정
    if (selectedCategory) {
      result = result.filter((store) => {
        return store.categoryId === selectedCategory
      })
      console.log('카테고리 필터링 후 가게 수:', result.length)
    }

    // 검색어 필터링 - 필드명 확인 필요
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((store) => {
        const storeName = store.storeName || store.name || ''
        return storeName.toLowerCase().includes(query)
      })
      console.log('검색 필터링 후 가게 수:', result.length)
    }

    setFilteredStores(result)
  }, [searchQuery, selectedCategory, sortOption, stores]) // showDiscountOnly 제거

  return (
    <div>
      {/* 헤더 */}
      <Header />

      {/* 카테고리 리스트 */}
      <CategoryList
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* 가게 목록 */}
      <div>
        {loading ? (
          <p>로딩 중...</p>
        ) : filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <div key={store.id} onClick={() => handleStoreClick(store)}>
              <img src={defaultImage} alt="가게 이미지" />
              <p>{store.storeName}</p>
              <p>{store.address}</p>
            </div>
          ))
        ) : (
          <p>표시할 가게가 없습니다.</p>
        )}
      </div>

      {/* 네비게이션 */}
      <Navigation />
    </div>
  )
}

export default HomePage
