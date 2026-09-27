import React, { createContext, useContext, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './styles.css'

const AuthContext = createContext(null)
const useAuth = () => useContext(AuthContext)
const levels = ['NATIONAL', 'STATE', 'FEDERAL_CONSTITUENCY', 'WARD']
const electionTypes = ['PRESIDENTIAL', 'GUBERNATORIAL', 'NATIONAL_ASSEMBLY', 'STATE_ASSEMBLY']
const statusLabels = { NATIONAL_ASSEMBLY: 'National Assembly', STATE_ASSEMBLY: 'State Assembly', FEDERAL_CONSTITUENCY: 'Federal constituency', RESULTS_PUBLISHED: 'Results published' }
const label = (value) => statusLabels[value] || String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const when = (date) => date ? new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date)) : '—'

async function api(path, { token, body, ...options } = {}) {
  const isForm = body instanceof FormData
  const response = await fetch(path, {
    ...options,
    headers: { ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    body: body && !isForm ? JSON.stringify(body) : body,
  })
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || data?.error || 'The request could not be completed.')
  return data
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('elect-session') || 'null'))
  const setAuth = (auth) => { localStorage.setItem('elect-session', JSON.stringify(auth)); setSession(auth) }
  const logout = () => { localStorage.removeItem('elect-session'); setSession(null) }
  return <AuthContext.Provider value={{ session, setAuth, logout }}>{children}</AuthContext.Provider>
}

function Guard({ role, children }) {
  const { session } = useAuth()
  return session && (!role || session.role === role) ? children : <Navigate to="/login" replace />
}

function Status({ value }) { return <span className={`status ${String(value || '').toLowerCase()}`}>{label(value)}</span> }
function Notice({ error, success }) { return error || success ? <p className={`notice ${error ? 'error' : 'success'}`} role="alert">{error || success}</p> : null }
function Empty({ children }) { return <p className="empty">{children}</p> }
function Submit({ children, disabled }) { return <button className="button" disabled={disabled}>{children}</button> }

function Header() {
  const { session, logout } = useAuth()
  const home = session?.role === 'ADMIN' ? '/admin' : session?.role === 'PARTY' ? '/party' : '/elections'
  return <header className="masthead"><div className="shell nav"><Link className="brand" to="/elections"><span>Elect</span><small>Federal electoral register</small></Link><nav><Link to="/elections">Elections</Link>{session ? <><Link to={home}>{label(session.role)} desk</Link><button className="text-button" onClick={logout}>Sign out</button></> : <><Link to="/voter-register">Voter register</Link><Link to="/party-register">Party register</Link><Link className="nav-action" to="/login">Sign in</Link></>}</nav></div></header>
}

function Shell({ title, children, aside }) { return <main className="shell page"><div className="page-heading"><p className="kicker">Independent electoral register</p><h1>{title}</h1></div><div className={aside ? 'two-column' : ''}><section>{children}</section>{aside && <aside>{aside}</aside>}</div></main> }

function Login() {
  const { setAuth, session } = useAuth(); const navigate = useNavigate(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  if (session) return <Navigate to={session.role === 'ADMIN' ? '/admin' : session.role === 'PARTY' ? '/party' : '/elections'} replace />
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); const form = new FormData(event.currentTarget); try { const auth = await api('/api/auth/login', { method: 'POST', body: Object.fromEntries(form) }); setAuth(auth); navigate(auth.role === 'ADMIN' ? '/admin' : auth.role === 'PARTY' ? '/party' : '/elections') } catch (e) { setError(e.message) } finally { setBusy(false) } }
  return <Shell title="Sign in"><form className="form narrow" onSubmit={submit}><Notice error={error}/><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label><Submit disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Submit><p className="form-foot">First visit? <Link to="/voter-register">Register as a voter</Link> or <Link to="/party-register">register a party</Link>.</p></form></Shell>
}

function VoterRegister() {
  const { setAuth } = useAuth(); const navigate = useNavigate(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const auth = await api('/api/auth/voter/register', { method: 'POST', body: Object.fromEntries(new FormData(event.currentTarget)) }); setAuth(auth); navigate('/elections') } catch (e) { setError(e.message) } finally { setBusy(false) } }
  return <Shell title="Voter registration" aside={<p>Your registration number and date of birth must match the electoral roll supplied by the Commission.</p>}><form className="form narrow" onSubmit={submit}><Notice error={error}/><label>Voter registration number<input name="voterRegNumber" required /></label><label>Date of birth<input name="dateOfBirth" type="date" required /></label><label>Email address<input name="email" type="email" required /></label><label>Choose a password<input name="password" type="password" minLength="6" required /></label><Submit disabled={busy}>{busy ? 'Checking register…' : 'Complete registration'}</Submit></form></Shell>
}

function PartyRegister() {
  const { setAuth } = useAuth(); const navigate = useNavigate(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const auth = await api('/api/party/register', { method: 'POST', body: Object.fromEntries(new FormData(event.currentTarget)) }); setAuth(auth); navigate('/party') } catch (e) { setError(e.message) } finally { setBusy(false) } }
  return <Shell title="Party registration" aside={<p>New party applications are held for approval. You may sign in after applying and track the decision here.</p>}><form className="form" onSubmit={submit}><Notice error={error}/><div className="form-grid"><label>Party name<input name="name" required /></label><label>Acronym<input name="acronym" required /></label><label>Chairman’s name<input name="chairmanName" /></label><label>Logo URL<input name="logoUrl" type="url" /></label><label>Email address<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength="6" required /></label></div><Submit disabled={busy}>{busy ? 'Submitting…' : 'Submit party application'}</Submit></form></Shell>
}

function Elections() {
  const [elections, setElections] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  useEffect(() => { api('/api/elections').then(setElections).catch((e) => setError(e.message)).finally(() => setLoading(false)) }, [])
  return <Shell title="Election register" aside={<><h2>Before you vote</h2><p>Review the election and candidate list carefully. A ballot can be cast only once in each election.</p></>}><Notice error={error}/>{loading ? <p>Loading election register…</p> : elections.length ? <div className="register-list">{elections.map((election) => <Link className="register-row" key={election.id} to={`/elections/${election.id}`}><span className="row-number">{String(elections.indexOf(election) + 1).padStart(2, '0')}</span><span><strong>{election.name}</strong><small>{label(election.type)} · {election.constituency?.name || 'Constituency to be confirmed'}</small></span><span className="row-end"><Status value={election.status}/><small>{when(election.startTime)}</small></span></Link>)}</div> : <Empty>No elections have been entered in the register.</Empty>}</Shell>
}

function ElectionDetail() {
  const { id } = useParams(); const { session } = useAuth(); const [election, setElection] = useState(null); const [candidates, setCandidates] = useState([]); const [hasVoted, setHasVoted] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState('')
  useEffect(() => { Promise.all([api(`/api/elections/${id}`), api(`/api/elections/${id}/candidates`)]).then(([e, c]) => { setElection(e); setCandidates(c) }).catch((e) => setError(e.message)); if (session?.role === 'VOTER') api(`/api/voter/elections/${id}/eligibility`, { token: session.token }).then((data) => setHasVoted(data.hasVoted)).catch((e) => setError(e.message)) }, [id, session])
  const vote = async (candidateId) => { if (!window.confirm('Cast your ballot for this candidate? This cannot be changed.')) return; setBusy(candidateId); setError(''); try { await api(`/api/voter/elections/${id}/vote`, { method: 'POST', token: session.token, body: { candidateId } }); setHasVoted(true); setSuccess('Your ballot has been recorded.') } catch (e) { setError(e.message) } finally { setBusy('') } }
  if (!election && !error) return <Shell title="Election"><p>Loading election…</p></Shell>
  return <Shell title={election?.name || 'Election'} aside={election && <dl className="facts"><div><dt>Election</dt><dd>{label(election.type)}</dd></div><div><dt>Constituency</dt><dd>{election.constituency?.name || '—'}</dd></div><div><dt>Voting window</dt><dd>{when(election.startTime)} — {when(election.endTime)}</dd></div><div><dt>Status</dt><dd><Status value={election.status}/></dd></div></dl>}><Notice error={error} success={success}/><h2>Ballot</h2>{session?.role === 'VOTER' && hasVoted && <p className="notice success">You have already voted in this election.</p>}{candidates.length ? <ol className="ballot">{candidates.map((candidate) => <li key={candidate.id}><div className="candidate"><img src={candidate.photoUrl || 'https://placehold.co/96x96/D9E2DB/0F3D2E?text=E'} alt="" onError={(event) => { event.currentTarget.style.visibility = 'hidden' }} /><div><h3>{candidate.fullName}</h3><p className="party-name">{candidate.party?.name || candidate.party?.acronym || 'Political party'} {candidate.party?.acronym && `(${candidate.party.acronym})`}</p>{candidate.runningMateName && <p>Running mate: {candidate.runningMateName}</p>}{candidate.manifesto && <p>{candidate.manifesto}</p>}</div></div>{session?.role === 'VOTER' && !hasVoted && election?.status === 'OPEN' && <button className="button vote" disabled={busy === candidate.id} onClick={() => vote(candidate.id)}>{busy === candidate.id ? 'Recording…' : 'Cast vote'}</button>}</li>)}</ol> : <Empty>No approved candidates are listed for this election.</Empty>}</Shell>
}

function PartyDashboard() {
  const { session } = useAuth(); const [party, setParty] = useState(null); const [candidates, setCandidates] = useState([]); const [elections, setElections] = useState([]); const [constituencies, setConstituencies] = useState([]); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false)
  const load = () => Promise.all([api('/api/party/me', { token: session.token }), api('/api/party/candidates', { token: session.token }), api('/api/elections'), api('/api/constituencies')]).then(([p, c, e, areas]) => { setParty(p); setCandidates(c); setElections(e); setConstituencies(areas) }).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])
  const submit = async (event) => { event.preventDefault(); setError(''); setSuccess(''); setBusy(true); const data = Object.fromEntries(new FormData(event.currentTarget)); try { await api('/api/party/candidates', { method: 'POST', token: session.token, body: data }); event.currentTarget.reset(); setSuccess('Candidate submitted for approval.'); load() } catch (e) { setError(e.message) } finally { setBusy(false) } }
  if (!party && !error) return <Shell title="Party desk"><p>Loading party record…</p></Shell>
  return <Shell title="Party desk" aside={party && <dl className="facts"><div><dt>Registered party</dt><dd>{party.name} ({party.acronym})</dd></div><div><dt>Chairman</dt><dd>{party.chairmanName || '—'}</dd></div><div><dt>Application</dt><dd><Status value={party.status}/></dd></div></dl>}><Notice error={error} success={success}/><h2>Put forward a candidate</h2>{party?.status === 'APPROVED' ? <form className="form" onSubmit={submit}><div className="form-grid"><label>Election<select name="electionId" required><option value="">Select election</option>{elections.map((election) => <option key={election.id} value={election.id}>{election.name} — {election.constituency?.name}</option>)}</select></label><label>Constituency<select name="constituencyId" required><option value="">Select constituency</option>{constituencies.map((area) => <option key={area.id} value={area.id}>{area.name} — {label(area.level)}</option>)}</select></label><label>Candidate’s full name<input name="fullName" required /></label><label>Running mate’s name<input name="runningMateName" /></label><label>Photo URL<input name="photoUrl" type="url" /></label></div><label>Biography<textarea name="bio" rows="3" /></label><label>Manifesto<textarea name="manifesto" rows="4" /></label><Submit disabled={busy}>{busy ? 'Submitting…' : 'Submit candidate'}</Submit></form> : <p className="notice">Candidate submissions open after the party application is approved.</p>}<h2 className="section-title">Your candidate register</h2>{candidates.length ? <div className="register-list">{candidates.map((candidate) => <div className="register-row static" key={candidate.id}><span><strong>{candidate.fullName}</strong><small>{candidate.election?.name} · {candidate.constituency?.name}</small></span><Status value={candidate.status}/></div>)}</div> : <Empty>No candidates have been submitted.</Empty>}</Shell>
}

function AdminDashboard() {
  const { session } = useAuth(); const [tab, setTab] = useState('elections'); const [data, setData] = useState({ constituencies: [], elections: [], parties: [], candidates: [] }); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [results, setResults] = useState(null); const [busy, setBusy] = useState(false)
  const load = () => Promise.all(['/api/admin/constituencies', '/api/admin/elections', '/api/admin/parties', '/api/admin/candidates'].map((path) => api(path, { token: session.token }))).then(([constituencies, elections, parties, candidates]) => setData({ constituencies, elections, parties, candidates })).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])
  const act = async (path, options = {}) => { setError(''); setSuccess(''); setBusy(true); try { const value = await api(path, { token: session.token, ...options }); setSuccess('Register updated.'); load(); return value } catch (e) { setError(e.message); return null } finally { setBusy(false) } }
  const addConstituency = (event) => { event.preventDefault(); const input = Object.fromEntries(new FormData(event.currentTarget)); act('/api/admin/constituencies', { method: 'POST', body: { ...input, parentId: input.parentId || null } }).then((value) => value && event.currentTarget.reset()) }
  const addElection = (event) => { event.preventDefault(); const input = Object.fromEntries(new FormData(event.currentTarget)); act('/api/admin/elections', { method: 'POST', body: { ...input, startTime: new Date(input.startTime).toISOString(), endTime: new Date(input.endTime).toISOString() } }).then((value) => value && event.currentTarget.reset()) }
  const upload = (event) => { event.preventDefault(); const file = new FormData(event.currentTarget); act('/api/admin/voter-roll/upload', { method: 'POST', body: file }).then((value) => value && setSuccess(`${value.imported} voter record${value.imported === 1 ? '' : 's'} imported.`)) }
  const showResults = async (id) => { const value = await act(`/api/admin/elections/${id}/results`); if (value) setResults(value) }
  const controls = <div className="tabs">{[['elections', 'Elections'], ['constituencies', 'Constituencies'], ['parties', 'Party approvals'], ['candidates', 'Candidate approvals'], ['roll', 'Voter roll']].map(([key, text]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{text}</button>)}</div>
  return <Shell title="Election administration"><div className="admin"><p className="admin-intro">Manage the electoral register, ballot approvals, and voting windows.</p>{controls}<Notice error={error} success={success}/>{tab === 'constituencies' && <><form className="form inline-form" onSubmit={addConstituency}><label>Name<input name="name" required /></label><label>Level<select name="level">{levels.map((level) => <option key={level}>{level}</option>)}</select></label><label>Parent<select name="parentId"><option value="">No parent</option>{data.constituencies.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><Submit disabled={busy}>Add constituency</Submit></form><Rows items={data.constituencies} render={(item) => <><span><strong>{item.name}</strong><small>{label(item.level)}{item.parent && ` · ${item.parent.name}`}</small></span></>}/></>}{tab === 'elections' && <><form className="form form-grid" onSubmit={addElection}><label>Name<input name="name" required /></label><label>Type<select name="type">{electionTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>Constituency<select name="constituencyId" required><option value="">Select constituency</option>{data.constituencies.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Opens<input name="startTime" type="datetime-local" required /></label><label>Closes<input name="endTime" type="datetime-local" required /></label><Submit disabled={busy}>Enter election</Submit></form><Rows items={data.elections} render={(item) => <><span><strong>{item.name}</strong><small>{label(item.type)} · {item.constituency?.name} · {when(item.startTime)}</small></span><span className="actions"><Status value={item.status}/>{item.status !== 'OPEN' && <button disabled={busy} onClick={() => act(`/api/admin/elections/${item.id}/status`, { method: 'PATCH', body: { status: 'OPEN' } })}>Open</button>}{item.status === 'OPEN' && <button disabled={busy} onClick={() => act(`/api/admin/elections/${item.id}/status`, { method: 'PATCH', body: { status: 'CLOSED' } })}>Close</button>}<button disabled={busy} onClick={() => showResults(item.id)}>Results</button></span></>}/>{results && <Results results={results} close={() => setResults(null)}/>}</>}{tab === 'parties' && <ApprovalRows items={data.parties} type="parties" act={act} busy={busy}/>} {tab === 'candidates' && <ApprovalRows items={data.candidates} type="candidates" act={act} busy={busy}/>} {tab === 'roll' && <form className="form narrow" onSubmit={upload}><p>Upload a CSV with <code>voterRegNumber,fullName,dateOfBirth,constituencyId</code> columns.</p><label>Voter roll CSV<input name="file" type="file" accept=".csv,text/csv" required /></label><Submit disabled={busy}>Import voter roll</Submit></form>}</div></Shell>
}

function Rows({ items, render }) { return items.length ? <div className="register-list">{items.map((item) => <div className="register-row static" key={item.id}>{render(item)}</div>)}</div> : <Empty>There are no records to show.</Empty> }
function ApprovalRows({ items, type, act, busy }) { return <Rows items={items} render={(item) => <><span><strong>{item.name || item.fullName}</strong><small>{item.acronym || item.party?.name}{item.election && ` · ${item.election.name}`}</small></span><span className="actions"><button disabled={busy} onClick={() => act(`/api/admin/${type}/${item.id}/approve`, { method: 'PATCH' })}>Approve</button><button className="danger" disabled={busy} onClick={() => act(`/api/admin/${type}/${item.id}/reject`, { method: 'PATCH' })}>Reject</button></span></>} /> }
function Results({ results, close }) { return <section className="results"><button className="text-button" onClick={close}>Close results</button><h2>{results.electionName}</h2><p>{results.totalVotesCast} ballots cast</p><ol>{results.tallies?.map((tally) => <li key={tally.candidateId}><strong>{tally.candidateName}</strong> <span>{tally.partyAcronym} — {tally.votes} votes</span></li>)}</ol></section> }

function App() { return <AuthProvider><Header/><Routes><Route path="/" element={<Navigate to="/elections" replace/>}/><Route path="/login" element={<Login/>}/><Route path="/voter-register" element={<VoterRegister/>}/><Route path="/party-register" element={<PartyRegister/>}/><Route path="/elections" element={<Elections/>}/><Route path="/elections/:id" element={<ElectionDetail/>}/><Route path="/party" element={<Guard role="PARTY"><PartyDashboard/></Guard>}/><Route path="/admin" element={<Guard role="ADMIN"><AdminDashboard/></Guard>}/><Route path="*" element={<Navigate to="/elections" replace/>}/></Routes></AuthProvider> }

createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>)
