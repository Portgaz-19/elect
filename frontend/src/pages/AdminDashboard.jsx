import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

const TABS = ['Constituencies', 'Elections', 'Parties', 'Candidates', 'Voter roll', 'Audit Log']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Constituencies')

  return (
    <div className="page">
      <h1>Admin</h1>
      <p className="eyebrow-line">Manage the electoral map, elections, and approvals.</p>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Constituencies' && <ConstituenciesTab />}
      {tab === 'Elections' && <ElectionsTab />}
      {tab === 'Parties' && <PartiesTab />}
      {tab === 'Candidates' && <CandidatesTab />}
      {tab === 'Voter roll' && <VoterRollTab />}
      {tab === 'Audit Log' && <AuditLogTab />}
    </div>
  )
}

function useFeedback() {
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const clear = () => { setError(''); setMessage('') }
  return { error, message, setError, setMessage, clear }
}

function ConstituenciesTab() {
  const [list, setList] = useState(null)
  const { error, message, setError, setMessage, clear } = useFeedback()
  const [form, setForm] = useState({ name: '', level: 'STATE', parentId: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    api.get('/admin/constituencies').then(setList).catch((err) => setError(err.message))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e) {
    e.preventDefault()
    clear()
    setSubmitting(true)
    try {
      await api.post('/admin/constituencies', { ...form, parentId: form.parentId || null })
      setMessage('Constituency created.')
      setForm({ name: '', level: 'STATE', parentId: '' })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {error && <div className="alert-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      <div className="card">
        <h2>New constituency</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="cname">Name</label>
            <input id="cname" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="clevel">Level</label>
            <select id="clevel" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="NATIONAL">National</option>
              <option value="STATE">State</option>
              <option value="FEDERAL_CONSTITUENCY">Federal constituency</option>
              <option value="WARD">Ward</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="cparent">Parent constituency (optional)</label>
            <select id="cparent" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
              <option value="">None</option>
              {list?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create constituency'}
          </button>
        </form>
      </div>

      <div className="section-gap">
        <h2>All constituencies</h2>
        {list === null && <p>Loading…</p>}
        {list?.length === 0 && <p className="empty-note">None created yet.</p>}
        {list?.length > 0 && (
          <div className="register">
            {list.map((c, i) => (
              <div className="register-row" key={c.id}>
                <span className="register-row-index">{i + 1}.</span>
                <div className="register-row-main">
                  <div className="register-row-title">{c.name}</div>
                  <div className="register-row-sub">{c.level}{c.parent ? ` · under ${c.parent.name}` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function ElectionsTab() {
  const [list, setList] = useState(null)
  const [constituencies, setConstituencies] = useState([])
  const { error, message, setError, setMessage, clear } = useFeedback()
  const [form, setForm] = useState({ name: '', type: 'PRESIDENTIAL', constituencyId: '', startTime: '', endTime: '' })
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState({})

  const load = useCallback(() => {
    api.get('/admin/elections').then(setList).catch((err) => setError(err.message))
    api.get('/admin/constituencies').then(setConstituencies).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e) {
    e.preventDefault()
    clear()
    setSubmitting(true)
    try {
      await api.post('/admin/elections', {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      })
      setMessage('Election created.')
      setForm({ name: '', type: 'PRESIDENTIAL', constituencyId: '', startTime: '', endTime: '' })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function setStatus(id, status) {
    clear()
    try {
      await api.patch(`/admin/elections/${id}/status`, { status })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function loadResults(id) {
    try {
      const data = await api.get(`/admin/elections/${id}/results`)
      setResults((prev) => ({ ...prev, [id]: data }))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      {error && <div className="alert-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      <div className="card">
        <h2>New election</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="ename">Name</label>
            <input id="ename" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="etype">Type</label>
            <select id="etype" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="PRESIDENTIAL">Presidential</option>
              <option value="GUBERNATORIAL">Gubernatorial</option>
              <option value="NATIONAL_ASSEMBLY">National Assembly</option>
              <option value="STATE_ASSEMBLY">State Assembly</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="econst">Constituency</label>
            <select id="econst" required value={form.constituencyId} onChange={(e) => setForm({ ...form, constituencyId: e.target.value })}>
              <option value="" disabled>Select a constituency</option>
              {constituencies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="estart">Start time</label>
            <input id="estart" type="datetime-local" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="eend">End time</label>
            <input id="eend" type="datetime-local" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create election'}
          </button>
        </form>
      </div>

      <div className="section-gap">
        <h2>All elections</h2>
        {list === null && <p>Loading…</p>}
        {list?.length === 0 && <p className="empty-note">None created yet.</p>}
        {list?.length > 0 && (
          <div className="register">
            {list.map((el, i) => (
              <div key={el.id}>
                <div className="register-row">
                  <span className="register-row-index">{i + 1}.</span>
                  <div className="register-row-main">
                    <div className="register-row-title">{el.name}</div>
                    <div className="register-row-sub">
                      {el.type.replace('_', ' ')} · {el.constituency?.name} ·{' '}
                      <span className={`status status-${el.status.toLowerCase()}`}>{el.status}</span>
                    </div>
                  </div>
                  <div className="register-row-action">
                    {el.status !== 'OPEN' && (
                      <button className="btn btn-outline btn-small" onClick={() => setStatus(el.id, 'OPEN')}>Open</button>
                    )}
                    {el.status === 'OPEN' && (
                      <button className="btn btn-outline btn-small" onClick={() => setStatus(el.id, 'CLOSED')}>Close</button>
                    )}
                    <button className="btn btn-outline btn-small" onClick={() => loadResults(el.id)}>Results</button>
                  </div>
                </div>
                {results[el.id] && (
                  <div style={{ padding: '0 0 1rem 1.6rem', fontSize: '0.9rem', color: 'var(--charcoal-soft)' }}>
                    {results[el.id].totalVotesCast} total votes ·{' '}
                    {results[el.id].tallies.map((t) => `${t.candidateName} (${t.partyAcronym}): ${t.votes}`).join(' · ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function PartiesTab() {
  const [list, setList] = useState(null)
  const { error, setError, message, setMessage, clear } = useFeedback()

  const load = useCallback(() => {
    api.get('/admin/parties').then(setList).catch((err) => setError(err.message))
  }, [])

  useEffect(() => { load() }, [load])

  async function act(id, action) {
    clear()
    try {
      await api.patch(`/admin/parties/${id}/${action}`, {})
      setMessage(`Party ${action}d.`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      {error && <div className="alert-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}
      <h2>Pending parties</h2>
      {list === null && <p>Loading…</p>}
      {list?.length === 0 && <p className="empty-note">No parties awaiting approval.</p>}
      {list?.length > 0 && (
        <div className="register">
          {list.map((p, i) => (
            <div className="register-row" key={p.id}>
              <span className="register-row-index">{i + 1}.</span>
              <div className="register-row-main">
                <div className="register-row-title">{p.name} ({p.acronym})</div>
                <div className="register-row-sub">{p.chairmanName}</div>
              </div>
              <div className="register-row-action">
                <button className="btn btn-primary btn-small" onClick={() => act(p.id, 'approve')}>Approve</button>
                <button className="btn btn-outline btn-small" onClick={() => act(p.id, 'reject')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function CandidatesTab() {
  const [list, setList] = useState(null)
  const { error, setError, message, setMessage, clear } = useFeedback()

  const load = useCallback(() => {
    api.get('/admin/candidates').then(setList).catch((err) => setError(err.message))
  }, [])

  useEffect(() => { load() }, [load])

  async function act(id, action) {
    clear()
    try {
      await api.patch(`/admin/candidates/${id}/${action}`, {})
      setMessage(`Candidate ${action}d.`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      {error && <div className="alert-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}
      <h2>Pending candidates</h2>
      {list === null && <p>Loading…</p>}
      {list?.length === 0 && <p className="empty-note">No candidates awaiting approval.</p>}
      {list?.length > 0 && (
        <div className="register">
          {list.map((c, i) => (
            <div className="register-row" key={c.id}>
              <span className="register-row-index">{i + 1}.</span>
              <div className="register-row-main">
                <div className="register-row-title">{c.fullName}</div>
                <div className="register-row-sub">{c.party?.acronym} · {c.election?.name}</div>
              </div>
              <div className="register-row-action">
                <button className="btn btn-primary btn-small" onClick={() => act(c.id, 'approve')}>Approve</button>
                <button className="btn btn-outline btn-small" onClick={() => act(c.id, 'reject')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function VoterRollTab() {
  const [file, setFile] = useState(null)
  const { error, setError, message, setMessage, clear } = useFeedback()
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return
    clear()
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/admin/voter-roll/upload', formData)
      setMessage(`Imported ${res.imported} voter${res.imported === 1 ? '' : 's'}.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      {error && <div className="alert-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}
      <div className="card">
        <h2>Import voter roll</h2>
        <p className="eyebrow-line">
          CSV columns: voterRegNumber, fullName, dateOfBirth, constituencyId
        </p>
        <form onSubmit={handleUpload}>
          <div className="form-field">
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={uploading || !file}>
            {uploading ? 'Uploading…' : 'Upload CSV'}
          </button>
        </form>
      </div>
    </>
  )
}

function AuditLogTab() {
  const [logs, setLogs] = useState(null)
  const { error, setError } = useFeedback()

  useEffect(() => {
    api.get('/admin/audit-log').then(setLogs).catch((err) => setError(err.message))
  }, [])

  return (
    <>
      {error && <div className="alert-box">{error}</div>}
      <h2>Audit log</h2>
      {logs === null && <p>Loading…</p>}
      {logs?.length === 0 && <p className="empty-note">No actions logged yet.</p>}
      {logs?.length > 0 && (
        <div className="register">
          {logs.map((log) => (
            <div className="register-row" key={log.id}>
              <div className="register-row-main">
                <div className="register-row-title">{log.action.replace(/_/g, ' ')}</div>
                <div className="register-row-sub">
                  {log.actorEmail} · {log.details} · {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}