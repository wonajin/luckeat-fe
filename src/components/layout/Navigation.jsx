import { useNavigate, useLocation } from 'react-router-dom'

function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="mt-auto border-t">
      <ul className="flex justify-around py-3">
        <li>
          <button
            className={`flex flex-col items-center ${location.pathname === '/' ? 'text-blue-600' : ''}`}
            onClick={() => navigate('/')}
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs mt-1">홈</span>
          </button>
        </li>
        <li>
          <button
            className={`flex flex-col items-center ${location.pathname === '/map' ? 'text-blue-600' : ''}`}
            onClick={() => navigate('/map')}
          >
            <span className="text-2xl">📍</span>
            <span className="text-xs mt-1">지도</span>
          </button>
        </li>
        <li>
          <button
            className="flex flex-col items-center"
            onClick={() => navigate('/mypage')}
          >
            <span className="text-2xl">👤</span>
            <span className="text-xs mt-1">마이</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
