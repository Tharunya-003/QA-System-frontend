import FindingCard from './FindingCard.jsx'

// Group findings by their slide location, ordering numeric slides first and
// cross-artifact/structure findings (non-numeric "slide") last.
function groupBySlide(findings) {
  const groups = {}
  for (const f of findings) {
    const key = f.location?.slide ?? 'general'
    groups[key] = groups[key] || []
    groups[key].push(f)
  }
  const keys = Object.keys(groups).sort((a, b) => {
    const na = Number(a), nb = Number(b)
    const aNum = !Number.isNaN(na), bNum = !Number.isNaN(nb)
    if (aNum && bNum) return na - nb
    if (aNum) return -1
    if (bNum) return 1
    return String(a).localeCompare(String(b))
  })
  return keys.map((k) => [k, groups[k]])
}

function label(key) {
  if (key === 'general' || key === 'N/A') return 'Course-level / structure'
  if (Number.isNaN(Number(key))) return `${key}`
  return `Slide ${key}`
}

export default function SlidePanel({ findings, slidesById }) {
  if (!findings.length) {
    return <div className="panel"><p className="muted">No findings for this selection. 🎉</p></div>
  }
  const groups = groupBySlide(findings)

  const sev = { blocker: 0, major: 0, minor: 0, suggestion: 0 }
  for (const f of findings) if (sev[f.severity] !== undefined) sev[f.severity]++

  return (
    <div className="findings-feed">
      {/* Stats bar — quick metrics for the current view */}
      <div className="findings-stats stat-bar">
        <div className="stat-box"><div className="stat-num">{findings.length}</div><div className="stat-lbl">Total</div></div>
        <div className="stat-box"><div className="stat-num">{sev.blocker}</div><div className="stat-lbl">Blockers</div></div>
        <div className="stat-box"><div className="stat-num">{sev.major}</div><div className="stat-lbl">Major</div></div>
        <div className="stat-box"><div className="stat-num">{sev.minor}</div><div className="stat-lbl">Minor</div></div>
      </div>

      {groups.map(([key, list]) => {
        const slide = slidesById?.[key]
        return (
          <div className="slide-group" key={key}>
            <h4>
              <span className="slide-no">{label(key)}</span>
              {slide?.title && <span className="muted"> — {slide.title}</span>}
              {slide?.role && <span className="muted"> ({slide.role})</span>}
            </h4>
            <div className="findings-grid">
              {list.map((f) => <FindingCard key={f.finding_id} finding={f} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
