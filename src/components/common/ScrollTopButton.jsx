import React, { useState, useEffect } from 'react'

function ScrollTopButton({ scrollContainerRef }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const scrollContainer = scrollContainerRef?.current
    if (!scrollContainer) return

    const handleScroll = () => {
      setIsVisible(scrollContainer.scrollTop > 100)
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [scrollContainerRef])

  const scrollToTop = () => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div
      className="fixed left-1/2 transform translate-x-[220%] z-[9999]"
      style={{
        bottom: '80px', // 더 작아진 네비게이션 바에 맞게 조정
      }}
    >
      <button
        onClick={scrollToTop}
        className={`bg-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-600 transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="맨 위로 스크롤"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>
  )
}

export default ScrollTopButton
