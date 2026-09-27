import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function PartyRegisterPage() {
  const { setLoggedInFromResponse } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    acronym: '',
    chairmanName: '',
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
      const data = await api.post('/party/register', form)
      setLoggedInFromResponse(data)
      navigate('/party')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <h1>Register a party</h1>
      <p className="eyebrow-line">
        Submitting this creates your party's login and puts it up for admin
        approval — you won't be able to register candidates until approved.
      </p>

      {error && <div className="alert-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Party name</label>
          <input id="name" required value={form.name} onChange={update('name')} />
        </div>
        <div className="form-field">
          <label htmlFor="acronym">Acronym</label>
          <input id="acronym" required value={form.acronym} onChange={update('acronym')} />
        </div>
        <div className="form-field">
          <label htmlFor="chairman">Chairman's name</label>
          <input id="chairman" value={form.chairmanName} onChange={update('chairmanName')} />
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
          {loading ? 'Registering…' : 'Register party'}
        </button>
      </form>

      <p className="link-line">
        Already registered? <Link to="/login">Log in</Link>.
      </p>
    </div>
  )
}
