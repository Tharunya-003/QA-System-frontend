import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { uploadStoryboard, listReviews, deleteReview } from '../api.js'

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
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [history, setHistory] = useState([])
  const inputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => { setHistory(listReviews()) }, [])

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

  async function submit() {
    if (!file) return
    setBusy(true); setError(''); setStep(0)
    try {
      const { review_id } = await uploadStoryboard(file)
      setStep(ANALYZE_STEPS.length - 1)
      setTimeout(() => navigate(`/report/${review_id}`), 500)
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
    <div className="up-shell">
      <div className="up-card">
        <div className="up-head">
          <h1>Upload a storyboard</h1>
          <p className="up-sub">PowerPoint is the primary format. Word and Excel storyboards are also supported.</p>
        </div>

        <div
          className={`up-drop ${drag ? 'drag' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
        >
          <div className="up-drop-icon">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M12 18v-6" />
              <path d="m9 15 3-3 3 3" />
            </svg>
          </div>
          <h2>Drag and drop your file here</h2>
          <div className="up-or"><span>OR</span></div>
          <button type="button" className="up-browse" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
            Browse files
          </button>
          <input
            ref={inputRef} type="file" accept={ACCEPT.join(',')} hidden
            onChange={(e) => pick(e.target.files[0])}
          />
        </div>

        {file && (
          <div className="up-file">
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

        {file && (
          <button className="up-submit" onClick={submit}>
            <span>✓</span> Finish uploading
          </button>
        )}

        {error && <div className="up-error">{error}</div>}
      </div>

      {history.length > 0 && (
        <div className="up-card up-history">
          <div className="up-history-head">
            <h2>Previous uploads</h2>
            <span className="up-count">{history.length}</span>
          </div>
          <ul className="up-history-list">
            {history.map((r) => (
              <li key={r.review_id}>
                <Link to={`/report/${r.review_id}`} className="up-history-item">
                  <div className="up-file-badge sm">
                    {r.filename.split('.').pop().toUpperCase()}
                  </div>
                  <div className="up-file-meta">
                    <div className="up-file-name">{r.filename}</div>
                    <div className="up-sub">{fmtSize(r.size)} · {fmtDate(r.uploadedAt)}</div>
                  </div>
                  <span className="up-view">View report →</span>
                  <button className="up-remove" title="Delete"
                    onClick={(e) => removeFromHistory(e, r.review_id)}>
                    ✕
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
