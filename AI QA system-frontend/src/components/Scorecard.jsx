const DOT = {
  pass: 'var(--pass)', minor: 'var(--minor)',
  major: 'var(--major)', blocker: 'var(--blocker)',
}

const SEVERITY_RANK = { blocker: 0, major: 1, minor: 2, pass: 3 }

export default function Scorecard({ scorecard, selected, onSelect }) {
  const entries = Object.entries(scorecard || {})

  const needsReview = entries
    .filter(([, s]) => s.status !== 'pass')
    .sort((a, b) => (SEVERITY_RANK[a[1].status] ?? 9) - (SEVERITY_RANK[b[1].status] ?? 9))
  const compliant = entries.filter(([, s]) => s.status === 'pass')

  function Row([principle, s]) {
    return (
      <div
        key={principle}
        className={`score-row ${selected === principle ? 'sel' : ''}`}
        onClick={() => onSelect(principle)}
      >
        <span className="dot" style={{ background: DOT[s.status] || 'var(--muted)' }} />
        <span className="score-name">{principle}</span>
        <span className="counts">
          {s.blockers > 0 && <span className="pill blocker">{s.blockers}</span>}
          {s.majors > 0 && <span className="pill major">{s.majors}</span>}
          {s.minors > 0 && <span className="pill minor">{s.minors}</span>}
          {s.suggestions > 0 && <span className="pill suggestion">{s.suggestions}</span>}
        </span>
      </div>
    )
  }

  return (
    <div className="panel scorecard">
      <h3>Principle Scorecard</h3>

      <div
        className={`score-row all ${!selected ? 'sel' : ''}`}
        onClick={() => onSelect(null)}
      >
        <span className="score-name">All principles</span>
      </div>

      {needsReview.length > 0 && (
        <>
          <div className="score-section">Needs review</div>
          {needsReview.map(Row)}
        </>
      )}

      {compliant.length > 0 && (
        <>
          <div className="score-section">Compliant</div>
          {compliant.map(Row)}
        </>
      )}
    </div>
  )
}
