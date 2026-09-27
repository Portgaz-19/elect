import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ElectionDetailPage() {
  const { id } = useParams()
  const { authed, role } = useAuth()
  const isVoter = authed && role === 'VOTER'

  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState(null)
  const [hasVoted, setHasVoted] = useState(null)
  const [error, setError] = useState('')
  const [voting, setVoting] = useState(false)
  const [voteMessage, setVoteMessage] = useState('')

  const load = useCallback(() => {
    api.get(`/elections/${id}`).then(setElection).catch((err) => setError(err.message))
    api.get(`/elections/${id}/candidates`).then(setCandidates).catch((err) => setError(err.message))
    if (isVoter) {
      api
        .get(`/voter/elections/${id}/eligibility`)
        .then((data) => setHasVoted(data.hasVoted))
        .catch((err) => setError(err.message))
    }
  }, [id, isVoter])

  useEffect(() => {
    load()
  }, [load])

  async function castVote(candidateId) {
    setError('')
    setVoteMessage('')
    setVoting(true)
    try {
      await api.post(`/voter/elections/${id}/vote`, { candidateId })
      setHasVoted(true)
      setVoteMessage('Your vote has been recorded.')
    } catch (err) {
      setError(err.message)
    } finally {
      setVoting(false)
    }
  }

  return (
    <div className="page">
      {election && (
        <>
          <h1>{election.name}</h1>
          <p className="eyebrow-line">
            {election.type.replace('_', ' ')} · {election.constituency?.name} ·{' '}
            <span className={`status status-${election.status.toLowerCase()}`}>{election.status}</span>
          </p>
        </>
      )}

      {error && <div className="alert-box">{error}</div>}
      {voteMessage && <div className="success-box">{voteMessage}</div>}

      {!authed && (
        <p className="empty-note">Log in as a registered voter to cast a vote in this election.</p>
      )}
      {authed && !isVoter && (
        <p className="empty-note">Only registered voters can cast a vote here.</p>
      )}
      {isVoter && hasVoted && !voteMessage && (
        <p className="empty-note">You have already voted in this election.</p>
      )}

      {candidates === null && <p>Loading candidates…</p>}
      {candidates?.length === 0 && <p className="empty-note">No approved candidates yet for this election.</p>}

      {candidates?.length > 0 && (
        <div className="register">
          {candidates.map((c, i) => (
            <div className="register-row" key={c.id}>
              <span className="register-row-index">{i + 1}.</span>
              <div className="register-row-main">
                <div className="register-row-title">{c.fullName}</div>
                <div className="register-row-sub">
                  {c.party?.acronym} {c.runningMateName ? `· Running mate: ${c.runningMateName}` : ''}
                </div>
                {c.manifesto && <div className="register-row-sub" style={{ marginTop: '0.3rem' }}>{c.manifesto}</div>}
              </div>
              {isVoter && !hasVoted && (
                <div className="register-row-action">
                  <button className="btn btn-gold btn-small" disabled={voting} onClick={() => castVote(c.id)}>
                    {voting ? 'Casting…' : 'Vote'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
