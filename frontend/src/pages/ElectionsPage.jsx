import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function ElectionsPage() {
  const [elections, setElections] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/elections/active')
      .then(setElections)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="page">
      <h1>Active elections</h1>
      <p className="eyebrow-line">Elections currently open within their voting window.</p>

      {error && <div className="alert-box">{error}</div>}

      {elections === null && !error && <p>Loading…</p>}

      {elections?.length === 0 && (
        <p className="empty-note">No elections are currently active.</p>
      )}

      {elections?.length > 0 && (
        <div className="register">
          {elections.map((el, i) => (
            <div className="register-row" key={el.id}>
              <span className="register-row-index">{i + 1}.</span>
              <div className="register-row-main">
                <div className="register-row-title">{el.name}</div>
                <div className="register-row-sub">
                  {el.type.replace('_', ' ')} · {el.constituency?.name}
                </div>
              </div>
              <div className="register-row-action">
                <Link className="btn btn-outline btn-small" to={`/elections/${el.id}`}>
                  View ballot
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
