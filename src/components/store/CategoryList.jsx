const categories = [
  { id: 1, name: '전체', icon: '🍽️' },
  { id: 2, name: '한식', icon: '🥘' },
  { id: 3, name: '중식', icon: '🥟' },
  { id: 4, name: '수산', icon: '🐟' },
  { id: 5, name: '카페/디저트', icon: '🥐' },
  { id: 6, name: '분식', icon: '🍜' },
  { id: 7, name: '야채/과일', icon: '🥬' },
  { id: 8, name: '기타', icon: '📦' },
]

function CategoryList() {
  return (
    <div className="p-4 bg-gray-50">
      <div className="grid grid-cols-4 gap-4">
        {categories.map((category) => (
          <button key={category.id} className="flex flex-col items-center p-2">
            <span className="text-2xl mb-1">{category.icon}</span>
            <span className="text-xs">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryList
