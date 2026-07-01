const STATUS_COLOR = {
  blocker: { bg: '#ff6b6b', ink: '#2a0000' },
  major:   { bg: '#ffa94d', ink: '#2a1400' },
  minor:   { bg: '#ffd43b', ink: '#2a2400' },
  pass:    { bg: '#51cf66', ink: '#06210e' },
}
const FALLBACK = { bg: '#9ca3af', ink: '#11151c' }

const SEVERITY_RANK = { blocker: 0, major: 1, minor: 2, pass: 3 }

export default function Scorecard({ scorecard, selected, onSelect }) {
  const entries = Object.entries(scorecard || {})

  const needsReview = entries
    .filter(([, s]) => s.status !== 'pass')
    .sort((a, b) => (SEVERITY_RANK[a[1].status] ?? 9) - (SEVERITY_RANK[b[1].status] ?? 9))
  const compliant = entries.filter(([, s]) => s.status === 'pass')

  function Row([principle, s]) {
    const c = STATUS_COLOR[s.status] || FALLBACK
    return (
      <div
        key={principle}
        className={`score-row ${selected === principle ? 'sel' : ''}`}
        onClick={() => onSelect(principle)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(principle) } }}
      >
        <div className="score-left">
          <span className="score-dot" style={{ background: c.bg }} />
          <span className="score-label">{principle}</span>
        </div>
        <div className="score-right">
          <span className="score-badge" style={{ background: c.bg, color: c.ink }}>
            {s.findings}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="panel scorecard">
      <h3>Principle Scorecard</h3>

      <div
        className={`score-row all ${!selected ? 'sel' : ''}`}
        onClick={() => onSelect(null)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(null) } }}
      >
        <div className="score-left">
          <span className="score-label">All principles</span>
        </div>
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
