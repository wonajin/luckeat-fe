import React from 'react'
import { categories } from '../../data/storeData'

function CategoryList({ selectedCategory, onSelectCategory }) {
  return (
    <div className="grid grid-cols-4 gap-2 p-4 bg-gray-100">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`flex flex-col items-center ${
            selectedCategory === category.name
              ? 'text-yellow-500'
              : 'text-gray-700'
          }`}
          onClick={() =>
            onSelectCategory(category.name === '전체' ? '' : category.name)
          }
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 ${
              selectedCategory === category.name
                ? 'bg-yellow-100'
                : 'bg-gray-200'
            }`}
          >
            <span className="text-2xl">{category.icon}</span>
          </div>
          <span className="text-xs">{category.name}</span>
        </button>
      ))}
    </div>
  )
}

export default CategoryList
