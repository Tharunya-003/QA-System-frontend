import { useEffect, useState } from 'react'
import { getRubric } from '../api.js'

const SEV_CLASS = { blocker: 'blocker', major: 'major', minor: 'minor', suggestion: 'suggestion' }

export default function Admin() {
  const [rubric, setRubric] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getRubric().then(setRubric).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="error">Error: {error}</div>
  if (!rubric) return <div className="progress"><div className="spinner" /><p>Loading rubric…</p></div>

  return (
    <div>
      <span className="meta-tag">STANDARDS · SYSTEM DEFINITIONS</span>
      <h1 className="main-heading">
        QUALITY ASSURANCE 
        <span className="muted-heading">RUBRIC</span>
      </h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-num">
            {rubric.principle_count < 10 ? `0${rubric.principle_count}` : rubric.principle_count}
          </p>
          <span className="stat-lbl">Principles</span>
        </div>
        <div className="stat-card">
          <p className="stat-num">
            {rubric.rule_count < 10 ? `0${rubric.rule_count}` : rubric.rule_count}
          </p>
          <span className="stat-lbl">Atomic rules</span>
        </div>
        <div className="stat-card">
          <p className="stat-num">v{rubric.version}</p>
          <span className="stat-lbl">Ruleset version</span>
        </div>
      </div>

      <div className="panel">
        <table className="rubric-table">
          <thead>
            <tr>
              <th>Rule</th><th>Principle</th><th>Description</th>
              <th>Applies to</th><th>Method</th><th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {rubric.rules.map((r) => (
              <tr key={r.rule_id}>
                <td className="tag">{r.rule_id}</td>
                <td>{r.principle}</td>
                <td>{r.description}</td>
                <td className="muted">{r.applies_to}</td>
                <td className="tag">{r.method}</td>
                <td><span className={`pill ${SEV_CLASS[r.severity]}`}>{r.severity}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
