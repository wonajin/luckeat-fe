import { useNavigate, useLocation } from 'react-router-dom'

function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="mt-auto border-t">
      <ul className="flex justify-around py-3">
        <li>
          <button
            className={`flex items-center justify-center w-10 h-10 ${
              location.pathname === '/' || location.pathname === '/home'
                ? 'text-yellow-500'
                : 'text-black'
            }`}
            onClick={() => navigate('/')}
          >
            <span className="text-2xl">🏠</span>
          </button>
        </li>
        <li>
          <button
            className={`flex items-center justify-center w-10 h-10 ${
              location.pathname === '/map'
                ? 'text-yellow-500'
                : 'text-black'
            }`}
            onClick={() => navigate('/map')}
          >
            <span className="text-2xl">📍</span>
          </button>
        </li>
        <li>
          <button
            className={`flex items-center justify-center w-10 h-10 ${
              location.pathname === '/mypage'
                ? 'text-yellow-500'
                : 'text-black'
            }`}
            onClick={() => navigate('/mypage')}
          >
            <span className="text-2xl">👤</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
