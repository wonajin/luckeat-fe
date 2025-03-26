import { useNavigate, useLocation } from 'react-router-dom'

function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="mt-auto border-t border-gray-100 bg-white shadow-inner">
      <ul className="flex justify-around py-3">
        <li>
          <button
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors ${
              location.pathname === '/' || location.pathname === '/home'
                ? 'text-jeju-orange'
                : 'text-jeju-stone'
            }`}
            onClick={() => navigate('/')}
            aria-label="홈으로 이동"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </button>
        </li>
        <li>
          <button
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors ${
              location.pathname === '/map' 
                ? 'text-jeju-orange' 
                : 'text-jeju-stone'
            }`}
            onClick={() => navigate('/map')}
            aria-label="지도로 이동"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </li>
        <li>
          <button
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors ${
              location.pathname === '/mypage' 
                ? 'text-jeju-orange' 
                : 'text-jeju-stone'
            }`}
            onClick={() => navigate('/mypage')}
            aria-label="내 정보로 이동"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
