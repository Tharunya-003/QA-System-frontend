import { useState } from 'react'
import { updateFinding } from '../api.js'

export default function FindingCard({ finding }) {
  const [status, setStatus] = useState(finding.status || 'open')
  const [editing, setEditing] = useState(false)
  const [remark, setRemark] = useState(finding.edited_remark || finding.remark)
  const [reco, setReco] = useState(finding.edited_recommendation || finding.recommendation)
  const [saving, setSaving] = useState(false)

  async function act(newStatus, payload = {}) {
    setSaving(true)
    try {
      await updateFinding(finding.finding_id, { status: newStatus, ...payload })
      setStatus(newStatus)
      setEditing(false)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const resolved = status === 'accepted' || status === 'rejected' || status === 'edited'

  return (
    <div className={`finding ${finding.severity} ${resolved ? 'resolved' : ''}`}>
      <div className="row1">
        <span className={`badge ${finding.severity}`}>{finding.severity}</span>
        <span className="ruleid">{finding.rule_id}</span>
        <span className="muted">· {finding.principle}</span>
        {status !== 'open' && <span className={`status-tag ${status}`}>{status}</span>}
        <span className="method">{finding.method_used}</span>

        {!editing && (
          <div className="actions top">
            <button className="icon-btn accept" title="Accept" disabled={saving} onClick={() => act('accepted')}>✓</button>
            <button className="icon-btn reject" title="Reject" disabled={saving} onClick={() => act('rejected')}>✕</button>
            <button className="icon-btn" title="Edit" onClick={() => setEditing(true)}>✎</button>
          </div>
        )}
      </div>

      <div className="evidence">{finding.evidence || '(no evidence captured)'}</div>

      {editing ? (
        <>
          <textarea className="evidence" rows={2} value={remark} onChange={(e) => setRemark(e.target.value)} />
          <textarea className="evidence" rows={2} value={reco} onChange={(e) => setReco(e.target.value)} />
          <div className="actions">
            <button className="btn sm" disabled={saving}
              onClick={() => act('edited', { edited_remark: remark, edited_recommendation: reco })}>
              Save
            </button>
            <button className="btn sm ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className="remark">{remark}</div>
          <div className="reco"><b>Fix:</b> {reco}</div>
          {finding.confidence < 1 && (
            <div className="muted confidence">confidence {(finding.confidence * 100).toFixed(0)}%</div>
          )}
        </>
      )}
    </div>
  )
}
