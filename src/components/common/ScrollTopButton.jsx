import { useState, useEffect } from 'react'

function ScrollTopButton() {
  const [showScrollTopButton, setShowScrollTopButton] = useState(false)

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTopButton(window.scrollY > 300)
    }

    // 이벤트 리스너 추가
    window.addEventListener('scroll', handleScroll)

    // 클린업 함수
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <>
      {showScrollTopButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-50 hover:bg-yellow-600"
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
      )}
    </>
  )
}

export default ScrollTopButton 