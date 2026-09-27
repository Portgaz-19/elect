import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function VoterRegisterPage() {
  const { setLoggedInFromResponse } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    voterRegNumber: '',
    dateOfBirth: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/auth/voter/register', form)
      setLoggedInFromResponse(data)
      navigate('/elections')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <h1>Register as a voter</h1>
      <p className="eyebrow-line">
        You must already be on the official voter roll. Enter your registration
        number and date of birth exactly as recorded, then set a password.
      </p>

      {error && <div className="alert-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="vrn">Voter registration number</label>
          <input id="vrn" required value={form.voterRegNumber} onChange={update('voterRegNumber')} />
        </div>
        <div className="form-field">
          <label htmlFor="dob">Date of birth</label>
          <input id="dob" type="date" required value={form.dateOfBirth} onChange={update('dateOfBirth')} />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={update('email')} />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password (min. 8 characters)</label>
          <input id="password" type="password" required minLength={8} value={form.password} onChange={update('password')} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Registering…' : 'Complete registration'}
        </button>
      </form>

      <p className="link-line">
        Already registered? <Link to="/login">Log in</Link>.
      </p>
    </div>
  )
}
