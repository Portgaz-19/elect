import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Topbar() {
  const { authed, role, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <Link to="/" className="topbar-brand">Elect</Link>
      <div className="topbar-right">
        {authed ? (
          <>
            <span className="role-tag">{role}</span>
            <button onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'inherit' }}>Log in</Link>
        )}
      </div>
    </header>
  )
}
