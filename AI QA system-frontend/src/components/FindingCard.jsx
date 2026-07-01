import { useState } from 'react'
import { updateFinding, getFindingOverride } from '../api.js'

const IconPencil = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)

const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
)

const IconBulb = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
  </svg>
)

export default function FindingCard({ finding }) {
  const override = getFindingOverride(finding.finding_id) || {}
  const [status, setStatus] = useState(override.status || finding.status || 'open')
  const [editing, setEditing] = useState(false)
  const [remark, setRemark] = useState(override.edited_remark || finding.edited_remark || finding.remark)
  const [reco, setReco] = useState(override.edited_recommendation || finding.edited_recommendation || finding.recommendation)
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
  const confidencePct = finding.confidence < 1 ? `${(finding.confidence * 100).toFixed(0)}% confidence` : null

  return (
    <div className={`finding ${finding.severity} ${resolved ? `resolved is-${status}` : ''}`}>
      <div className="f-top">
        <div className="f-meta">
          <span className={`badge ${finding.severity}`}>{finding.severity}</span>
          <span className="f-meta-line">
            <span className="ruleid">{finding.rule_id}</span>
            {finding.principle && <> · <span>{finding.principle}</span></>}
            {finding.method_used && <> · <span>{finding.method_used}</span></>}
          </span>
        </div>

        <div className="f-actions">
          {editing ? (
            <>
              <button className="btn sm" disabled={saving}
                onClick={() => act('edited', { edited_remark: remark, edited_recommendation: reco })}>
                Save
              </button>
              <button className="btn sm ghost" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <button className="f-edit" onClick={() => setEditing(true)}>
              <span className="f-edit-ic"><IconPencil /></span> Edit
            </button>
          )}
        </div>
      </div>

      <h3 className="f-title">{finding.evidence || finding.remark}</h3>

      {editing ? (
        <>
          <label className="f-label">Details</label>
          <textarea className="evidence" rows={2} value={remark} onChange={(e) => setRemark(e.target.value)} />
          <label className="f-label">Suggested fix</label>
          <textarea className="evidence" rows={2} value={reco} onChange={(e) => setReco(e.target.value)} />
        </>
      ) : (
        <>
          <hr className="f-divider" />
          <div className="f-rows">
            <div className="f-row">
              <span className="f-icon"><IconInfo /></span>
              <div>
                <div className="f-label">Details</div>
                <div className="f-row-text">
                  {remark}
                  {confidencePct && <span className="f-conf"> · {confidencePct}</span>}
                </div>
              </div>
            </div>
            <div className="f-row">
              <span className="f-icon fix"><IconBulb /></span>
              <div>
                <div className="f-label">Suggested fix</div>
                <div className="f-row-text strong">{reco}</div>
              </div>
            </div>
          </div>

          <div className="f-decision">
            {resolved ? (
              <>
                <span className={`status-tag ${status}`}>
                  {status === 'accepted' && <IconCheck />}
                  {status === 'rejected' && <IconX />}
                  {status}
                </span>
                <button
                  className="f-btn undo"
                  disabled={saving}
                  onClick={() => act('open')}
                  aria-label="Undo decision and reopen this finding"
                >
                  Undo
                </button>
              </>
            ) : (
              <>
                <button
                  className="f-btn accept"
                  disabled={saving}
                  onClick={() => act('accepted')}
                  aria-label="Accept this finding"
                >
                  Accept
                </button>
                <button
                  className="f-btn reject"
                  disabled={saving}
                  onClick={() => act('rejected')}
                  aria-label="Reject this finding"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
