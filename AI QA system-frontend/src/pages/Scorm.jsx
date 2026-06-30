import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SCORM_ACCEPT = ['.zip', '.pptx', '.docx']
const MAX_SIZE = 50 * 1024 * 1024

const ANALYZE_STEPS = [
  'Parsing SCORM package…',
  'Extracting course structure…',
  'Checking compliance standards…',
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

const SCORM_HISTORY_KEY = 'scorm_history'

function listScormHistory() {
  try {
    return JSON.parse(localStorage.getItem(SCORM_HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveScormEntry(file) {
  const history = listScormHistory()
  const entry = {
    id: `scorm_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    filename: file.name,
    size: file.size,
    uploadedAt: Date.now(),
  }
  history.unshift(entry)
  localStorage.setItem(SCORM_HISTORY_KEY, JSON.stringify(history))
  return entry
}

function deleteScormEntry(id) {
  const history = listScormHistory().filter(e => e.id !== id)
  localStorage.setItem(SCORM_HISTORY_KEY, JSON.stringify(history))
}

export default function Scorm() {
  const [file, setFile] = useState(null)
  const [drag, setDrag] = useState(false)
  const [guidelinesFile, setGuidelinesFile] = useState(null)
  const [guidelinesDrag, setGuidelinesDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [history, setHistory] = useState([])

  const inputRef = useRef()
  const guidelinesInputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => { setHistory(listScormHistory()) }, [])

  function removeFromHistory(e, id) {
    e.preventDefault()
    e.stopPropagation()
    deleteScormEntry(id)
    setHistory(listScormHistory())
  }

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
    if (!SCORM_ACCEPT.includes(ext)) {
      setError(`Unsupported format "${ext}". Upload a .zip, .pptx, or .docx file.`)
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
    setGuidelinesFile(f)
  }

  async function submit() {
    if (!file) return
    setBusy(true); setError(''); setStep(0)
    try {
      // Save to local SCORM history
      saveScormEntry(file)
      // Simulate analysis delay (replace with real API call when backend is ready)
      await new Promise(res => setTimeout(res, 3500))
      setHistory(listScormHistory())
      setBusy(false)
      setFile(null)
      setGuidelinesFile(null)
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  const detectedFormat = file ? file.name.split('.').pop().toUpperCase() : null

  if (busy) {
    return (
      <div className="up-shell">
        <div className="up-card up-analyzing">
          <div className="up-spinner" />
          <h1>Analyzing your SCORM package</h1>
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
    <div className="up-shell">
      {/* Upload Form Card */}
      <div className="up-card">
        <div className="up-head">
          <h1>Upload a SCORM package</h1>
          <p className="up-sub">
            ZIP (.zip) is the primary SCORM format. PowerPoint (.pptx) and Word (.docx) are also accepted.
            Custom guidelines (.pdf, .docx, .txt) can be optionally uploaded for a tailored compliance review.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '16px' }}>
          {/* Column 1: SCORM File (Required) */}
          <div>
            <span className="meta-tag" style={{ marginBottom: '12px' }}>SCORM File (Required)</span>
            <div
              className={`up-drop ${drag ? 'drag' : ''}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
              style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <div className="up-drop-icon">
                {/* SCORM / package icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h2 style={{ fontSize: '15px', marginBottom: '8px' }}>Drag SCORM package here</h2>
              <div className="up-or" style={{ margin: '8px auto' }}><span>OR</span></div>
              <button type="button" className="up-browse" style={{ padding: '6px 16px', fontSize: '11px' }} onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
                Browse files
              </button>
              <input
                ref={inputRef} type="file" accept={SCORM_ACCEPT.join(',')} hidden
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
          </div>

          {/* Column 2: Custom Guidelines (Optional) */}
          <div>
            <span className="meta-tag" style={{ marginBottom: '12px' }}>Custom Guidelines (Optional)</span>
            <div
              className={`up-drop ${guidelinesDrag ? 'drag' : ''}`}
              onClick={() => guidelinesInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setGuidelinesDrag(true) }}
              onDragLeave={() => setGuidelinesDrag(false)}
              onDrop={(e) => { e.preventDefault(); setGuidelinesDrag(false); pickGuidelines(e.dataTransfer.files[0]) }}
              style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderColor: guidelinesFile ? 'var(--border-focus)' : 'var(--border)' }}
            >
              <div className="up-drop-icon" style={{ color: guidelinesFile ? 'var(--text)' : 'var(--muted)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h2 style={{ fontSize: '15px', marginBottom: '8px' }}>Drag guidelines here</h2>
              <div className="up-or" style={{ margin: '8px auto' }}><span>OR</span></div>
              <button type="button" className="up-browse" style={{ padding: '6px 16px', fontSize: '11px' }} onClick={(e) => { e.stopPropagation(); guidelinesInputRef.current?.click() }}>
                Browse guidelines
              </button>
              <input
                ref={guidelinesInputRef} type="file" accept=".pdf,.docx,.txt,.doc" hidden
                onChange={(e) => pickGuidelines(e.target.files[0])}
              />
            </div>

            {guidelinesFile && (
              <div className="up-file" style={{ marginTop: '16px' }}>
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
          </div>
        </div>

        {file && (
          <button className="up-submit" onClick={submit}>
            <span>✓</span> Run {guidelinesFile ? 'Guidelines Audit' : 'SCORM QA Analyzer'}
          </button>
        )}

        {error && <div className="up-error">{error}</div>}
      </div>

      {/* SCORM History */}
      {history.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div className="section-header">
            <h2>Your SCORM Packages</h2>
          </div>

          <ul className="up-history-list">
            {history.map((r) => (
              <li key={r.id}>
                <div className="up-history-row">
                  <div className="up-row-left">
                    <span className="chip" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, marginRight: '16px' }}>
                      {r.filename.split('.').pop()}
                    </span>
                    <h3 className="up-row-title" style={{ margin: 0, fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-serif)' }}>
                      {r.filename}
                    </h3>
                  </div>

                  <div className="up-row-meta" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {fmtSize(r.size)} · {fmtDate(r.uploadedAt)}
                  </div>

                  <div className="up-row-right">
                    <button
                      className="up-remove"
                      title="Delete SCORM entry"
                      onClick={(e) => removeFromHistory(e, r.id)}
                      style={{ flexShrink: 0 }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
