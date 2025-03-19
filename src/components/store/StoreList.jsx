import { useNavigate } from 'react-router-dom'

// 임시 가게 데이터
export const stores = [
  {
    id: 1,
    name: '에이븐 도넛가게',
    image: '🍩',
    category: '카페/디저트',
    isDiscounted: true,
    distance: 0.3,
    reviews: 2,
    shares: 12,
    discountItems: [
      {
        name: '다양한 도넛 12개',
        originalPrice: 20000,
        discountPrice: 8000,
        discountRate: 60,
        image: '🍩',
        isSoldOut: true,
      },
      {
        name: '랜덤 도넛 6개',
        originalPrice: 10000,
        discountPrice: 5000,
        discountRate: 50,
        image: '🍩',
        isSoldOut: false,
      },
    ],
    reviewData: [
      {
        id: 1,
        user: '도넛러버',
        rating: 4.5,
        date: '2024.03.20',
        content:
          '도넛이 정말 맛있어요! 마감 할인으로 더 저렴하게 구매할 수 있어서 좋았습니다.',
        images: ['📸'],
      },
      {
        id: 2,
        user: '단짠단짠',
        rating: 5.0,
        date: '2024.03.19',
        content:
          '신선한 재료로 만든 맛있는 도넛이에요. 다음에 또 방문하고 싶습니다.',
        images: ['📸'],
      },
    ],
  },
  {
    id: 2,
    name: '시에나 김밥',
    image: '🍙',
    category: '한식',
    isDiscounted: false,
    distance: 0.8,
    reviews: 1,
    shares: 34,
    discountItems: [],
    reviewData: [
      {
        id: 3,
        user: '김밥조아',
        rating: 4.0,
        date: '2024.03.18',
        content: '김밥이 깔끔하고 맛있어요.',
        images: [],
      },
    ],
  },
  {
    id: 3,
    name: '현현수산',
    image: '🐟',
    category: '수산',
    isDiscounted: true,
    distance: 1.2,
    reviews: 0,
    shares: 23,
    discountItems: [
      {
        name: '모듬회 2인분',
        originalPrice: 45000,
        discountPrice: 25000,
        discountRate: 45,
        image: '🐟',
        isSoldOut: false,
      },
    ],
    reviewData: [],
  },
  {
    id: 4,
    name: '코비반점',
    image: '🥟',
    category: '중식',
    isDiscounted: true,
    distance: 0.5,
    reviews: 1,
    shares: 15,
    discountItems: [
      {
        name: '짬뽕 2인분',
        originalPrice: 18000,
        discountPrice: 9000,
        discountRate: 50,
        image: '🍜',
        isSoldOut: false,
      },
    ],
    reviewData: [
      {
        id: 4,
        user: '중식매니아',
        rating: 4.5,
        date: '2024.03.17',
        content: '짬뽕이 정말 맛있어요! 해산물이 많이 들어있습니다.',
        images: ['📸'],
      },
    ],
  },
  {
    id: 5,
    name: '에드윈분식',
    image: '🍜',
    category: '분식',
    isDiscounted: false,
    distance: 0.4,
    reviews: 0,
    shares: 45,
    discountItems: [],
    reviewData: [],
  },
  {
    id: 6,
    name: '카구팔싱싱과일마트',
    image: '🍎',
    category: '야채/과일',
    isDiscounted: true,
    distance: 0.9,
    reviews: 1,
    shares: 8,
    discountItems: [
      {
        name: '제철과일 박스',
        originalPrice: 35000,
        discountPrice: 17500,
        discountRate: 50,
        image: '🍎',
        isSoldOut: false,
      },
    ],
    reviewData: [
      {
        id: 5,
        user: '과일덕후',
        rating: 5.0,
        date: '2024.03.16',
        content: '과일이 신선하고 가격도 합리적이에요.',
        images: ['📸'],
      },
    ],
  },
]

function StoreList({
  sortBy = 'distance',
  showDiscountOnly = false,
  selectedCategory = null,
}) {
  const navigate = useNavigate()

  // 필터링
  let filteredStores = stores

  if (showDiscountOnly) {
    filteredStores = filteredStores.filter((store) => store.isDiscounted)
  }

  if (selectedCategory) {
    filteredStores = filteredStores.filter(
      (store) => store.category === selectedCategory,
    )
  }

  // 정렬
  const sortedStores = [...filteredStores].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return a.distance - b.distance
      case 'reviews':
        return b.reviews - a.reviews
      case 'shares':
        return b.shares - a.shares
      default:
        return 0
    }
  })

  return (
    <div className="flex-1 overflow-auto">
      {sortedStores.map((store) => (
        <div
          key={store.id}
          className="p-4 border-b flex items-center gap-4 cursor-pointer hover:bg-gray-50"
          onClick={() => navigate(`/store/${store.id}`)}
        >
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-3xl">
            {store.image}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{store.name}</h3>
            <div className="flex gap-2 text-sm text-gray-500">
              <span>{store.distance}km</span>
              <span>•</span>
              <span>리뷰 {store.reviews}</span>
              <span>•</span>
              <span>공유 {store.shares}</span>
            </div>
            <div className="mt-1">
              <span className="text-sm text-gray-500">{store.category}</span>
              {store.isDiscounted && (
                <span className="text-sm text-blue-600 ml-2">마감 할인중</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StoreList
