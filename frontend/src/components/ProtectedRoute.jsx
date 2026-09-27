import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wrap a route's element with this to require login, and optionally a
// specific role (ADMIN / PARTY / VOTER). Mirrors the same three-way split
// SecurityConfig enforces on the backend — this is a UX convenience only,
// the backend is what actually protects the data either way.
export default function ProtectedRoute({ role, children }) {
  const { authed, role: currentRole } = useAuth()

  if (!authed) return <Navigate to="/login" replace />
  if (role && currentRole !== role) return <Navigate to="/" replace />

  return children
}
