import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const role = await login(email, password)
      if (role === 'ADMIN') navigate('/admin')
      else if (role === 'PARTY') navigate('/party')
      else navigate('/elections')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <h1>Log in</h1>
      <p className="eyebrow-line">Admins, parties, and registered voters all sign in here.</p>

      {error && <div className="alert-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="link-line">
        Registered to vote but don't have a login yet? <Link to="/register/voter">Register as a voter</Link>.
      </p>
      <p className="link-line">
        Representing a political party? <Link to="/register/party">Register your party</Link>.
      </p>
    </div>
  )
}
