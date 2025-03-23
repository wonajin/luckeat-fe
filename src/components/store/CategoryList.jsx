import React from 'react'

// 아이콘 매핑 - 백엔드에서 아이콘 정보가 없으므로 카테고리 이름에 따라 아이콘 지정
const categoryIcons = {
  전체: '🍽️',
  한식: '🍚',
  중식: '🥢',
  일식: '🍣',
  양식: '🍕',
  디저트: '🍰',
  패스트푸드: '🍔',
  분식: '🍜',
  베이커리: '🍞',
  카페: '☕',
  퓨전음식: '🥗',
  정육: '🥩',
  수산: '🐟',
  '야채/과일': '🥬',
  기타: '🛒',
}

function CategoryList({ categories = [], selectedCategory, onSelectCategory }) {
  // 전체 카테고리 추가 (API에서 전체 카테고리가 없는 경우)
  const allCategories = [
    { id: 0, categoryName: '전체', categoryImage: 'all.jpg' },
    ...(categories || []),
  ]

  // selectedCategory가 없으면 '전체' 카테고리가 선택된 것으로 처리
  const isAllSelected =
    selectedCategory === '' ||
    selectedCategory === null ||
    selectedCategory === undefined

  return (
    <div className="grid grid-cols-4 gap-2 p-4 bg-gray-100">
      {allCategories.map((category) => {
        // 백엔드 API의 카테고리 필드명에 맞게 수정
        const categoryName = category.categoryName
        const icon = categoryIcons[categoryName] || '🍴' // 기본 아이콘

        // 선택 상태 확인 - '전체' 카테고리는 selectedCategory가 비어있을 때 선택됨
        const isSelected =
          category.categoryName === '전체'
            ? isAllSelected
            : selectedCategory === category.id ||
              selectedCategory === String(category.id)

        return (
          <button
            key={category.id}
            className={`flex flex-col items-center ${
              isSelected ? 'text-yellow-500' : 'text-gray-700'
            }`}
            onClick={() =>
              onSelectCategory(categoryName === '전체' ? '' : category.id)
            }
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 ${
                isSelected ? 'bg-yellow-100' : 'bg-gray-200'
              }`}
            >
              <span className="text-2xl">{icon}</span>
            </div>
            <span className="text-xs">{categoryName}</span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryList
