import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getReport } from '../api.js'
import Scorecard from '../components/Scorecard.jsx'
import SlidePanel from '../components/SlidePanel.jsx'
import AlignmentMatrix from '../components/AlignmentMatrix.jsx'
import ParseWarnings from '../components/ParseWarnings.jsx'

export default function Report() {
  const { reviewId } = useParams()
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('findings')
  const [selected, setSelected] = useState(null)
  const timer = useRef(null)

  useEffect(() => {
    let active = true
    async function poll() {
      try {
        const r = await getReport(reviewId)
        if (!active) return
        setReport(r)
        if (r.status === 'processing') {
          timer.current = setTimeout(poll, 3000)
        }
      } catch (e) {
        if (active) setError(e.message)
      }
    }
    poll()
    return () => { active = false; clearTimeout(timer.current) }
  }, [reviewId])

  const slidesById = useMemo(() => {
    const map = {}
    for (const s of report?.course_model?.slides || []) map[s.index] = s
    return map
  }, [report])

  const filtered = useMemo(() => {
    const all = report?.findings || []
    return selected ? all.filter((f) => f.principle === selected) : all
  }, [report, selected])

  if (error) return <div className="error">Error: {error} <Link to="/">← back</Link></div>

  if (!report || report.status === 'processing') {
    return (
      <div className="progress">
        <div className="spinner" />
        <p>Analyzing storyboard… this can take up to a minute.</p>
        <p className="sub">Parsing → normalizing → enrichment → running {report ? '' : ''}checks</p>
      </div>
    )
  }

  if (report.status === 'failed') {
    return (
      <div>
        <h1>Analysis failed</h1>
        <pre className="evidence">{report.error || 'Unknown error'}</pre>
        <Link className="btn" to="/">← Upload another</Link>
      </div>
    )
  }

  const cm = report.course_model || {}
  const slideCount = cm.slides?.length || 0
  const objCount = cm.objectives?.length || 0

  return (
    <div>
      <div className="report-head">
        <span className="meta-tag">AUDIT REPORT · SYSTEM REVIEW</span>
        <div className="report-title">
          <h1 className="main-heading" style={{ fontSize: '36px', marginBottom: 0 }}>
            {cm.title || report.filename || 'Report'}
          </h1>
          <Link className="btn ghost" to="/">Upload another</Link>
        </div>
        <div className="statusbar">
          <span className="meta-file">{report.filename}</span>
          <span className="meta-item"><b>{slideCount}</b> slides</span>
          <span className="meta-item"><b>{objCount}</b> objectives</span>
          <span className="meta-item"><b>{report.findings.length}</b> findings</span>
        </div>
      </div>

      {report.guidelines_name && (
        <div className="warnbanner" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border-focus)' }}>
          <h4 style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pass)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Custom Guidelines Applied
          </h4>
          <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
            <li style={{ fontSize: '13px', color: 'var(--muted)' }}>
              This storyboard was audited against the custom rules specified in: <strong>{report.guidelines_name}</strong>. Default system constraints were bypassed.
            </li>
          </ul>
        </div>
      )}

      <ParseWarnings parseReport={report.parse_report} />

      <div className="tabs">
        <button className={tab === 'findings' ? 'active' : ''} onClick={() => setTab('findings')}>
          Findings
        </button>
        <button className={tab === 'scorecard' ? 'active' : ''} onClick={() => setTab('scorecard')}>
          Principle Scorecard
        </button>
        <button className={tab === 'matrix' ? 'active' : ''} onClick={() => setTab('matrix')}>
          Alignment Matrix
        </button>
      </div>

      {tab === 'findings' && (
        <>
          {selected && (
            <div className="filter-note">
              Filtered by <strong>{selected}</strong>
              <button className="btn sm ghost" onClick={() => setSelected(null)}>Clear filter</button>
            </div>
          )}
          <SlidePanel findings={filtered} slidesById={slidesById} />
        </>
      )}

      {tab === 'scorecard' && (
        <Scorecard
          scorecard={report.scorecard}
          selected={selected}
          onSelect={(p) => { setSelected(p); setTab('findings') }}
        />
      )}

      {tab === 'matrix' && <AlignmentMatrix matrix={report.alignment_matrix} />}
    </div>
  )
}
