const stores = [
  {
    id: 1,
    name: '가게 이름 1',
    image: '🏪',
    status: '준비중',
    isDiscounted: true,
    distance: 0.3,
    reviews: 45,
    shares: 12,
  },
  {
    id: 2,
    name: '가게 이름 2',
    image: '🏪',
    isDiscounted: false,
    distance: 0.8,
    reviews: 128,
    shares: 34,
  },
  {
    id: 3,
    name: '가게 이름 3',
    image: '🏪',
    status: '준비중',
    isDiscounted: true,
    distance: 1.2,
    reviews: 67,
    shares: 23,
  },
]

function StoreList({ sortBy = 'distance', showDiscountOnly = false }) {
  // 필터링
  const filteredStores = showDiscountOnly
    ? stores.filter((store) => store.isDiscounted)
    : stores

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
        <div key={store.id} className="p-4 border-b flex items-center gap-4">
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
            {store.status && (
              <span className="text-sm text-gray-500 block mt-1">
                {store.status}
              </span>
            )}
            {store.isDiscounted && (
              <span className="text-sm text-blue-600 block mt-1">
                마감 할인중
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StoreList
