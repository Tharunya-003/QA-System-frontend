const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
)

function StatusCell({ covered, yes = 'covered', no = 'none' }) {
  return (
    <td className={`status-cell ${covered ? 'ok' : 'gap'}`}>
      <span className="status-pill">
        {covered ? <IconCheck /> : <IconX />}
        {covered ? yes : no}
      </span>
    </td>
  )
}

export default function AlignmentMatrix({ matrix }) {
  if (!matrix || !matrix.length) {
    return <div className="panel"><p className="muted">No learning objectives were detected, so no alignment matrix could be built.</p></div>
  }
  return (
    <div className="panel">
      <h3>Learning Objective Alignment Matrix</h3>
      <p className="muted matrix-sub">
        Coverage of each objective across content, knowledge checks, assessment, and summary.
      </p>

      <div className="matrix-wrap">
        <table className="matrix">
          <thead>
            <tr>
              <th className="col-lo">LO</th>
              <th className="col-obj">Objective</th>
              <th className="ctr">Bloom</th>
              <th className="ctr">Content</th>
              <th className="ctr">Knowledge Checks</th>
              <th className="ctr">Assessment</th>
              <th className="ctr">Summary</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.lo_id}>
                <td className="cell-lo">{row.lo_id}</td>
                <td className="cell-obj">{row.lo_text}</td>
                <td className="ctr">
                  {row.bloom_level
                    ? <span className="bloom-pill">{row.bloom_level}</span>
                    : <span className="dash">—</span>}
                </td>
                <td className="ctr">
                  <span className="content-count"><IconDoc /> {(row.content_slides || []).length}</span>
                </td>
                <StatusCell covered={(row.kc_slides || []).length > 0} />
                <StatusCell covered={(row.assessment_slides || []).length > 0} />
                <StatusCell covered={!!row.summary_covered} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="matrix-legend">
        <span className="legend-item">
          <span className="legend-swatch ok"><IconCheck /></span> Fully covered
        </span>
        <span className="legend-item">
          <span className="legend-swatch gap"><IconX /></span> Gap identified
        </span>
        <span className="legend-item">
          <span className="legend-swatch accent"><IconDoc /></span> Coverage count
        </span>
      </div>
    </div>
  )
}
