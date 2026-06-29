function ChipList({ ids }) {
  if (!ids || !ids.length) return <span className="cell-no">✗ none</span>
  return (
    <span className="chiplist">
      {ids.map((id) => <span className="chip" key={id}>{id}</span>)}
    </span>
  )
}

export default function AlignmentMatrix({ matrix }) {
  if (!matrix || !matrix.length) {
    return <div className="panel"><p className="muted">No learning objectives were detected, so no alignment matrix could be built.</p></div>
  }
  return (
    <div className="panel">
      <h3>Learning Objective Alignment Matrix</h3>
      <p className="muted" style={{ marginTop: -6 }}>
        Coverage of each objective across content, knowledge checks, assessment, and summary.
        Red cells mark gaps.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table className="matrix">
          <thead>
            <tr>
              <th>LO</th>
              <th>Objective</th>
              <th>Bloom</th>
              <th>Content</th>
              <th>Knowledge&nbsp;Checks</th>
              <th>Assessment</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.lo_id}>
                <td><strong>{row.lo_id}</strong></td>
                <td>{row.lo_text}</td>
                <td>{row.bloom_level ? <span className="bloom">{row.bloom_level}</span> : <span className="cell-no">✗</span>}</td>
                <td><ChipList ids={row.content_slides} /></td>
                <td><ChipList ids={row.kc_slides} /></td>
                <td><ChipList ids={row.assessment_slides} /></td>
                <td>{row.summary_covered ? <span className="cell-yes">✓ covered</span> : <span className="cell-no">✗ missing</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
