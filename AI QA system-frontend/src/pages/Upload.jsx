import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { uploadStoryboard, listReviews, deleteReview, saveGuideline, listGuidelines } from '../api.js'

const ACCEPT = ['.pptx', '.docx', '.xlsx']
const MAX_SIZE = 50 * 1024 * 1024

const ANALYZE_STEPS = [
  'Parsing slides…',
  'Extracting storyboard structure…',
  'Checking alignment & layout…',
  'Scoring against rubric…',
  'Compiling report…',
]

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fmtDate(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function Upload() {
  const [file, setFile] = useState(null)
  const [drag, setDrag] = useState(false)
  const [guidelinesFile, setGuidelinesFile] = useState(null)
  const [guidelinesDrag, setGuidelinesDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [history, setHistory] = useState([])
  const [guidelines, setGuidelines] = useState([])
  const [scormHistory, setScormHistory] = useState([])
  const [historyTab, setHistoryTab] = useState('storyboards')

  const inputRef = useRef()
  const guidelinesInputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    setHistory(listReviews())
    setGuidelines(listGuidelines())
    try { setScormHistory(JSON.parse(localStorage.getItem('scorm_history') || '[]')) } catch { setScormHistory([]) }
  }, [])

  function removeFromHistory(e, reviewId) {
    e.preventDefault()
    e.stopPropagation()
    deleteReview(reviewId)
    setHistory(listReviews())
  }

  // Advance the analysis steps while we wait on the backend.
  useEffect(() => {
    if (!busy) return
    const id = setInterval(() => {
      setStep((s) => (s < ANALYZE_STEPS.length - 1 ? s + 1 : s))
    }, 650)
    return () => clearInterval(id)
  }, [busy])

  function pick(f) {
    setError('')
    if (!f) return
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    if (!ACCEPT.includes(ext)) {
      setError(`Unsupported format "${ext}". Upload a .pptx, .docx, or .xlsx file.`)
      return
    }
    if (f.size > MAX_SIZE) {
      setError(`File is too large (${fmtSize(f.size)}). Maximum size is 50 MB.`)
      return
    }
    setFile(f)
  }

  function pickGuidelines(f) {
    setError('')
    if (!f) return
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    const allowed = ['.pdf', '.docx', '.txt', '.doc']
    if (!allowed.includes(ext)) {
      setError(`Unsupported guidelines format "${ext}". Upload a .pdf, .docx, .txt, or .doc file.`)
      return
    }
    if (f.size > MAX_SIZE) {
      setError(`Guidelines file is too large (${fmtSize(f.size)}). Maximum size is 50 MB.`)
      return
    }
    // Save to guidelines history index as soon as client selects the file
    saveGuideline(f)
    setGuidelinesFile(f)
  }

  async function submit() {
    if (!file) return
    setBusy(true); setError(''); setStep(0)
    try {
      const { review_id } = await uploadStoryboard(file, guidelinesFile)
      setStep(ANALYZE_STEPS.length - 1)
      setTimeout(() => navigate(`/report/${review_id}`), 500)
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  const detectedFormat = file ? file.name.split('.').pop().toUpperCase() : null

  // Calculate dynamic stats for the cards
  const totalFiles = history.length
  const totalFilesStr = totalFiles === 0 ? '00' : totalFiles < 10 ? `0${totalFiles}` : `${totalFiles}`
  const totalMB = totalFiles === 0 ? '0.0' : (history.reduce((acc, h) => acc + (h.size || 0), 0) / (1024 * 1024)).toFixed(1)
  
  function getLatestActivity() {
    if (history.length === 0) return '—'
    const diffMs = Date.now() - history[0].uploadedAt
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    const diffHrs = Math.floor(diffMins / 60)
    if (diffHrs < 24) return `${diffHrs}h`
    return `${Math.floor(diffHrs / 24)}d`
  }

  if (busy) {
    return (
      <div className="up-shell">
        <div className="up-card up-analyzing">
          <div className="up-spinner" />
          <h1>Analyzing your storyboard</h1>
          <p className="up-sub">{file?.name}</p>
          <ul className="up-steps">
            {ANALYZE_STEPS.map((label, i) => (
              <li key={label} className={i < step ? 'done' : i === step ? 'active' : ''}>
                <span className="up-dot">{i < step ? '✓' : ''}</span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="sb-grid">
      {/* LEFT — Execution engine (upload) */}
      <section className="sb-left">
      <div className="up-card">
        <div className="up-head">
          <h1>Upload a storyboard</h1>
          <p className="up-sub">PowerPoint (.pptx) is the primary format. Custom guidelines (.pdf, .docx, .txt) can be optionally uploaded to run a tailored compliance review.</p>
        </div>

        {/* Primary dropzone: storyboard */}
        <span className="meta-tag" style={{ display: 'block', marginBottom: '12px' }}>Storyboard File (Required)</span>
        <div
          className={`up-drop ${drag ? 'drag' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
          style={{ minHeight: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <div className="up-drop-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h2 style={{ fontSize: '15px', marginBottom: '8px' }}>Drag storyboard here</h2>
          <div className="up-or" style={{ margin: '8px auto' }}><span>OR</span></div>
          <button type="button" className="up-browse" style={{ padding: '6px 16px', fontSize: '11px' }} onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
            Browse files
          </button>
          <input
            ref={inputRef} type="file" accept={ACCEPT.join(',')} hidden
            onChange={(e) => pick(e.target.files[0])}
          />
        </div>

        {file && (
          <div className="up-file" style={{ marginTop: '16px' }}>
            <div className="up-file-badge">{detectedFormat}</div>
            <div className="up-file-meta">
              <div className="up-file-name">{file.name}</div>
              <div className="up-sub">{fmtSize(file.size)}</div>
            </div>
            <button className="up-remove" title="Remove file"
              onClick={() => { setFile(null); setError('') }}>
              ✕
            </button>
          </div>
        )}

        {/* Secondary condensed action: custom guidelines */}
        <div
          className={`sb-guidelines ${guidelinesDrag ? 'drag' : ''} ${guidelinesFile ? 'has-file' : ''}`}
          onClick={() => guidelinesInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setGuidelinesDrag(true) }}
          onDragLeave={() => setGuidelinesDrag(false)}
          onDrop={(e) => { e.preventDefault(); setGuidelinesDrag(false); pickGuidelines(e.dataTransfer.files[0]) }}
        >
          <div className="sb-guidelines-main">
            <div className="up-drop-icon" style={{ margin: 0, color: guidelinesFile ? 'var(--text)' : 'var(--muted)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="sb-guidelines-title">Custom Guidelines <span>(Optional)</span></div>
              <div className="up-sub" style={{ margin: 0 }}>.pdf, .docx, .txt — drop here or browse to run a tailored compliance review.</div>
            </div>
          </div>
          <button type="button" className="up-browse" style={{ padding: '6px 16px', fontSize: '11px', flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); guidelinesInputRef.current?.click() }}>
            Browse
          </button>
          <input
            ref={guidelinesInputRef} type="file" accept=".pdf,.docx,.txt,.doc" hidden
            onChange={(e) => pickGuidelines(e.target.files[0])}
          />
        </div>

        {guidelinesFile && (
          <div className="up-file" style={{ marginTop: '12px' }}>
            <div className="up-file-badge" style={{ background: '#1c1c1c', border: '1px solid var(--border)', color: 'var(--text)' }}>
              {guidelinesFile.name.split('.').pop().toUpperCase()}
            </div>
            <div className="up-file-meta">
              <div className="up-file-name">{guidelinesFile.name}</div>
              <div className="up-sub">{fmtSize(guidelinesFile.size)}</div>
            </div>
            <button className="up-remove" title="Remove guidelines"
              onClick={() => setGuidelinesFile(null)}>
              ✕
            </button>
          </div>
        )}

        {file && (
          <button className="up-submit" onClick={submit}>
            <span>✓</span> Run {guidelinesFile ? 'Guidelines Audit' : 'QA Analyzer'}
          </button>
        )}

        {error && <div className="up-error">{error}</div>}
      </div>
      </section>

      {/* RIGHT — Persistent history sidebar */}
      <aside className="sb-right">
        <div className="sb-history">
        <div className="section-header">
          <h2>History</h2>
        </div>

        <div className="sidebar-tabs" style={{ marginBottom: '16px' }}>
          <button className={`sidebar-tab ${historyTab === 'storyboards' ? 'active' : ''}`} onClick={() => setHistoryTab('storyboards')}>Storyboards</button>
          <button className={`sidebar-tab ${historyTab === 'scorm' ? 'active' : ''}`} onClick={() => setHistoryTab('scorm')}>Scorm</button>
          <button className={`sidebar-tab ${historyTab === 'guidelines' ? 'active' : ''}`} onClick={() => { setHistoryTab('guidelines'); setGuidelines(listGuidelines()) }}>Guidelines</button>
        </div>

        <div className="sb-history-scroll">
        {/* Storyboards */}
        {historyTab === 'storyboards' && (
          history.length === 0 ? (
            <p className="up-sub">No audited storyboards yet.</p>
          ) : (
            <ul className="up-history-list">
              {history.map((r) => (
                <li key={r.review_id}>
                  <Link to={`/report/${r.review_id}`} className="up-history-row">
                    <div className="up-row-left">
                      <span className="chip" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, marginRight: '16px' }}>
                        {r.filename.split('.').pop()}
                      </span>
                      <h3 className="up-row-title" style={{ margin: 0, fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {r.filename}
                        {r.pinned && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--border-focus)' }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        )}
                      </h3>
                    </div>
                    <div className="up-row-meta" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {fmtSize(r.size)} · {fmtDate(r.uploadedAt)}
                    </div>
                    <div className="up-row-right">
                      <span className="up-view">View report →</span>
                      <button className="up-remove" title="Delete storyboard"
                        onClick={(e) => removeFromHistory(e, r.review_id)} style={{ flexShrink: 0 }}>
                        ✕
                      </button>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )
        )}

        {/* Scorm */}
        {historyTab === 'scorm' && (
          scormHistory.length === 0 ? (
            <p className="up-sub">No SCORM packages uploaded yet.</p>
          ) : (
            <ul className="up-history-list">
              {scormHistory.map((r) => (
                <li key={r.id || r.filename}>
                  <div className="up-history-row" style={{ cursor: 'default' }}>
                    <div className="up-row-left">
                      <span className="chip" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, marginRight: '16px' }}>ZIP</span>
                      <h3 className="up-row-title" style={{ margin: 0, fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-serif)' }}>{r.filename}</h3>
                    </div>
                    <div className="up-row-meta" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {r.size ? `${(r.size / 1024).toFixed(1)} KB · ` : ''}{fmtDate(r.uploadedAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}

        {/* Guidelines */}
        {historyTab === 'guidelines' && (
          guidelines.length === 0 ? (
            <p className="up-sub">No guidelines uploaded yet.</p>
          ) : (
            <ul className="up-history-list">
              {guidelines.map((g) => (
                <li key={g.name + g.uploadedAt}>
                  <div className="up-history-row" style={{ cursor: 'default' }}>
                    <div className="up-row-left">
                      <span className="chip" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, marginRight: '16px' }}>
                        {g.name.split('.').pop()}
                      </span>
                      <h3 className="up-row-title" style={{ margin: 0, fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-serif)' }}>{g.name}</h3>
                    </div>
                    <div className="up-row-meta" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {g.size ? `${(g.size / 1024).toFixed(1)} KB · ` : ''}{fmtDate(g.uploadedAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
        </div>
        </div>
      </aside>
    </div>
  )
}
