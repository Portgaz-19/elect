import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export default function PartyDashboard() {
  const [me, setMe] = useState(null)
  const [candidates, setCandidates] = useState(null)
  const [elections, setElections] = useState([])
  const [constituencies, setConstituencies] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    electionId: '',
    constituencyId: '',
    fullName: '',
    bio: '',
    manifesto: '',
    runningMateName: '',
  })

  const load = useCallback(() => {
    api.get('/party/me').then(setMe).catch((err) => setError(err.message))
    api.get('/party/candidates').then(setCandidates).catch((err) => setError(err.message))
    api.get('/elections').then(setElections).catch(() => {})
    api.get('/constituencies').then(setConstituencies).catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      await api.post('/party/candidates', form)
      setMessage('Candidate submitted for admin approval.')
      setForm({ electionId: '', constituencyId: '', fullName: '', bio: '', manifesto: '', runningMateName: '' })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const isApproved = me?.status === 'APPROVED'

  return (
    <div className="page">
      <h1>{me ? me.name : 'Party dashboard'}</h1>
      {me && (
        <p className="eyebrow-line">
          {me.acronym} · <span className={`status status-${me.status.toLowerCase()}`}>{me.status}</span>
        </p>
      )}

      {error && <div className="alert-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      {me && !isApproved && (
        <p className="empty-note">
          Your party is awaiting admin approval. You'll be able to register candidates once approved.
        </p>
      )}

      {isApproved && (
        <div className="card">
          <h2>Register a candidate</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="election">Election</label>
              <select id="election" required value={form.electionId} onChange={update('electionId')}>
                <option value="" disabled>Select an election</option>
                {elections.map((el) => (
                  <option key={el.id} value={el.id}>{el.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="constituency">Constituency</label>
              <select id="constituency" required value={form.constituencyId} onChange={update('constituencyId')}>
                <option value="" disabled>Select a constituency</option>
                {constituencies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="fullName">Candidate full name</label>
              <input id="fullName" required value={form.fullName} onChange={update('fullName')} />
            </div>
            <div className="form-field">
              <label htmlFor="runningMate">Running mate (optional)</label>
              <input id="runningMate" value={form.runningMateName} onChange={update('runningMateName')} />
            </div>
            <div className="form-field">
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" value={form.bio} onChange={update('bio')} />
            </div>
            <div className="form-field">
              <label htmlFor="manifesto">Manifesto</label>
              <textarea id="manifesto" value={form.manifesto} onChange={update('manifesto')} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit candidate'}
            </button>
          </form>
        </div>
      )}

      <div className="section-gap">
        <h2>Your candidates</h2>
        {candidates === null && <p>Loading…</p>}
        {candidates?.length === 0 && <p className="empty-note">No candidates registered yet.</p>}
        {candidates?.length > 0 && (
          <div className="register">
            {candidates.map((c, i) => (
              <div className="register-row" key={c.id}>
                <span className="register-row-index">{i + 1}.</span>
                <div className="register-row-main">
                  <div className="register-row-title">{c.fullName}</div>
                  <div className="register-row-sub">{c.election?.name} · {c.constituency?.name}</div>
                </div>
                <span className={`status status-${c.status.toLowerCase()}`}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
