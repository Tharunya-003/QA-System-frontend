export default function ParseWarnings({ parseReport }) {
  if (!parseReport) return null
  const low = parseReport.low_confidence_slides || []
  const unmapped = parseReport.unmapped_columns || []
  const warnings = parseReport.adapter_warnings || []
  if (!low.length && !unmapped.length && !warnings.length) return null

  return (
    <div className="warnbanner">
      <h4>⚠️ Parse warnings — review before trusting these findings</h4>
      {low.length > 0 && (
        <p style={{ margin: '4px 0' }}>
          These slides could not be parsed with high confidence: <strong>{low.join(', ')}</strong>.
        </p>
      )}
      {unmapped.length > 0 && (
        <p style={{ margin: '4px 0' }}>
          Unmapped columns/fields (preserved, not analyzed): <strong>{unmapped.join(', ')}</strong>.
        </p>
      )}
      {warnings.length > 0 && (
        <ul>
          {warnings.slice(0, 12).map((w, i) => <li key={i}>{w}</li>)}
          {warnings.length > 12 && <li className="muted">…and {warnings.length - 12} more</li>}
        </ul>
      )}
    </div>
  )
}
