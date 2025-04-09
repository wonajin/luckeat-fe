import { useNavigate, useLocation } from 'react-router-dom'
import luckeatLogo from '../../assets/images/luckeat-logo.png'

function Header({ title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isMainPage = location.pathname === '/' || location.pathname === '/home'

  return (
    <header className="sticky top-0 px-4 py-3 border-b border-gray-100 flex items-center relative bg-white shadow-sm z-10">
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
        <img src={luckeatLogo} alt="럭킷" className="h-6 mx-auto" />
      </h1>
    </header>
  )
}

export default Header
