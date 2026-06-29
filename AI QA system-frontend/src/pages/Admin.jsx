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
      <h1>Rubric (read-only)</h1>
      <div className="summary-cards">
        <div className="card"><div className="num">{rubric.principle_count}</div><div className="lbl">Principles</div></div>
        <div className="card"><div className="num">{rubric.rule_count}</div><div className="lbl">Atomic rules</div></div>
        <div className="card"><div className="num">v{rubric.version}</div><div className="lbl">Ruleset version</div></div>
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
