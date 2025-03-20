import { useNavigate, useLocation } from 'react-router-dom'

function Header({ title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isMainPage = location.pathname === '/' || location.pathname === '/home'

  return (
    <header className="px-4 py-3 border-b flex items-center relative">
      {!isMainPage && (
        <button
          onClick={() => navigate(-1)}
          className="text-2xl absolute left-4"
        >
          ←
        </button>
      )}
      <h1
        className="text-2xl font-bold text-yellow-500 w-full text-center"
        onClick={() => navigate('/')}
      >
        Luckeat
      </h1>
    </header>
  )
}

export default Header
