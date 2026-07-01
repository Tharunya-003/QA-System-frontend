import { useState, useEffect, useRef } from 'react'

const IconChevL = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>)
const IconChevR = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>)
const IconMax = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>)
const IconStar = ({ size = 28, color = '#444' }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden="true"><path d="m12 2 2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7Z" /></svg>)

const TYPE_LABEL = { text: 'Text', icon: 'Icon' }

function defaultElements(slide) {
  const els = [
    { id: 'title', type: 'text', text: slide.title || 'Untitled', x: 50, y: 44, w: 82, fontSize: 32, fontWeight: 700, align: 'center', color: '#1f1f1f', rotation: 0, z: 2 },
  ]
  if (slide.role) {
    els.push({ id: 'subtitle', type: 'text', text: slide.role, x: 50, y: 60, w: 70, fontSize: 18, fontWeight: 400, align: 'center', color: '#666666', rotation: 0, z: 1 })
  }
  els.push({ id: 'icon', type: 'icon', x: 86, y: 16, size: 28, color: '#9a9a9a', rotation: 0, z: 3 })
  return els
}

export default function PreviewPanel({ report }) {
  const [idx, setIdx] = useState(0)
  const [elementsBySlide, setElementsBySlide] = useState({})
  const [selectedId, setSelectedId] = useState(null)
  const [showLayers, setShowLayers] = useState(false)
  const stageRef = useRef(null)

  const slides = report?.course_model?.slides || []
  const slide = slides[idx]
  const cm = report?.course_model || {}

  function go(delta) {
    setSelectedId(null)
    setIdx((i) => Math.min(slides.length - 1, Math.max(0, i + delta)))
  }
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slides.length])

  function fullscreen() {
    const el = stageRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  if (!slides.length) {
    return <div className="panel"><p className="muted">No slides were detected in this storyboard.</p></div>
  }

  const elements = elementsBySlide[slide.index] || defaultElements(slide)
  const selected = elements.find((e) => e.id === selectedId) || null
  const slideFindings = (report.findings || []).filter((f) => String(f.location?.slide) === String(slide.index))

  function commit(next) {
    setElementsBySlide((m) => ({ ...m, [slide.index]: next }))
  }
  function patchEl(id, patch) {
    commit(elements.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }
  function bringToFront(id) {
    const max = Math.max(...elements.map((e) => e.z))
    patchEl(id, { z: max + 1 })
  }
  function sendToBack(id) {
    const min = Math.min(...elements.map((e) => e.z))
    patchEl(id, { z: min - 1 })
  }
  function duplicate(id) {
    const src = elements.find((e) => e.id === id)
    const clone = { ...src, id: `${src.type}-${Date.now()}`, x: Math.min(95, src.x + 6), y: Math.min(95, src.y + 6), z: Math.max(...elements.map((e) => e.z)) + 1 }
    commit([...elements, clone])
    setSelectedId(clone.id)
  }
  function remove(id) {
    commit(elements.filter((e) => e.id !== id))
    setSelectedId(null)
  }

  const sorted = [...elements].sort((a, b) => a.z - b.z)

  return (
    <div className="preview-grid">
      {/* LEFT — interactive slide canvas */}
      <section className="ppt-panel">
        <div className="pv-panel-head">
          <span className="pv-panel-title">Slide Preview</span>
          <div className="ppt-controls">
            <button className="pv-ctrl" onClick={() => go(-1)} disabled={idx === 0} title="Previous"><IconChevL /></button>
            <span className="slide-counter">{idx + 1} / {slides.length}</span>
            <button className="pv-ctrl" onClick={() => go(1)} disabled={idx === slides.length - 1} title="Next"><IconChevR /></button>
            <button className="pv-ctrl" onClick={fullscreen} title="Fullscreen"><IconMax /></button>
          </div>
        </div>
        <div className="ppt-stage" ref={stageRef}>
          <div className="ppt-slide canvas" onClick={() => setSelectedId(null)}>
            <span className="ppt-slide-no">Slide {slide.index}</span>
            {sorted.map((el) => {
              const sel = el.id === selectedId
              const style = {
                left: `${el.x}%`, top: `${el.y}%`, zIndex: el.z,
                width: el.type === 'text' ? `${el.w}%` : 'auto',
                transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
              }
              return (
                <div
                  key={el.id}
                  className={`canvas-el ${sel ? 'sel' : ''}`}
                  style={style}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(el.id) }}
                >
                  {el.type === 'text' ? (
                    <div style={{ fontSize: el.fontSize, fontWeight: el.fontWeight, textAlign: el.align, color: el.color, fontFamily: 'Georgia, serif', lineHeight: 1.25 }}>
                      {el.text}
                    </div>
                  ) : (
                    <IconStar size={el.size} color={el.color} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* RIGHT — properties panel (adaptive) */}
      <section className={`content-panel ${selected ? 'editing' : ''}`}>
        <div className="pv-panel-head">
          <span className="pv-panel-title">
            {selected ? `Editing: ${TYPE_LABEL[selected.type]}` : 'Slide Content'}
          </span>
          <div className="pv-edit-actions">
            <button className={`edit-btn ghost ${showLayers ? 'on' : ''}`} onClick={() => setShowLayers((v) => !v)}>Layers</button>
            {selected && <button className="edit-btn" onClick={() => setSelectedId(null)}>Done</button>}
          </div>
        </div>

        <div className="content-body">
          {showLayers && (
            <div className="layers">
              <div className="section-label">Layers</div>
              {[...elements].sort((a, b) => b.z - a.z).map((el) => (
                <button
                  key={el.id}
                  className={`layer-row ${el.id === selectedId ? 'sel' : ''}`}
                  onClick={() => setSelectedId(el.id)}
                >
                  <span className="layer-type">{TYPE_LABEL[el.type]}</span>
                  <span className="layer-name">{el.type === 'text' ? el.text : 'Icon'}</span>
                </button>
              ))}
            </div>
          )}

          {selected ? (
            <PropertiesEditor
              el={selected}
              onPatch={(patch) => patchEl(selected.id, patch)}
              onFront={() => bringToFront(selected.id)}
              onBack={() => sendToBack(selected.id)}
              onDuplicate={() => duplicate(selected.id)}
              onDelete={() => remove(selected.id)}
            />
          ) : (
            <ReadOnlyContent slide={slide} slides={slides} idx={idx} cm={cm} report={report} slideFindings={slideFindings} />
          )}
        </div>
      </section>
    </div>
  )
}

function Num({ label, value, onChange, step = 1, min, max }) {
  return (
    <label className="prop-num">
      <span>{label}</span>
      <input type="number" value={Math.round(value)} step={step} min={min} max={max}
        onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

function PropertiesEditor({ el, onPatch, onFront, onBack, onDuplicate, onDelete }) {
  return (
    <>
      {/* Transform */}
      <div>
        <div className="section-label">Transform</div>
        <div className="prop-grid">
          <Num label="X %" value={el.x} onChange={(v) => onPatch({ x: v })} min={0} max={100} />
          <Num label="Y %" value={el.y} onChange={(v) => onPatch({ y: v })} min={0} max={100} />
          {el.type === 'text'
            ? <Num label="Width %" value={el.w} onChange={(v) => onPatch({ w: v })} min={10} max={100} />
            : <Num label="Size" value={el.size} onChange={(v) => onPatch({ size: v })} min={10} max={120} />}
          <Num label="Rotate°" value={el.rotation} onChange={(v) => onPatch({ rotation: v })} min={-180} max={180} />
        </div>
      </div>

      {/* Style / attributes (context-aware) */}
      <div>
        <div className="section-label">{el.type === 'text' ? 'Text Style' : 'Icon Style'}</div>
        {el.type === 'text' ? (
          <>
            <label className="prop-field">
              <span>Content</span>
              <input className="pv-input" value={el.text} onChange={(e) => onPatch({ text: e.target.value })} />
            </label>
            <div className="prop-grid">
              <Num label="Font size" value={el.fontSize} onChange={(v) => onPatch({ fontSize: v })} min={8} max={96} />
              <label className="prop-num">
                <span>Weight</span>
                <select value={el.fontWeight} onChange={(e) => onPatch({ fontWeight: Number(e.target.value) })}>
                  <option value={400}>Regular</option>
                  <option value={600}>Semibold</option>
                  <option value={700}>Bold</option>
                </select>
              </label>
            </div>
            <label className="prop-field">
              <span>Align</span>
              <div className="seg">
                {['left', 'center', 'right'].map((a) => (
                  <button key={a} className={el.align === a ? 'on' : ''} onClick={() => onPatch({ align: a })}>{a}</button>
                ))}
              </div>
            </label>
            <label className="prop-field">
              <span>Color</span>
              <input type="color" className="prop-color" value={el.color} onChange={(e) => onPatch({ color: e.target.value })} />
            </label>
          </>
        ) : (
          <label className="prop-field">
            <span>Color</span>
            <input type="color" className="prop-color" value={el.color} onChange={(e) => onPatch({ color: e.target.value })} />
          </label>
        )}
      </div>

      {/* Layering / actions */}
      <div className="prop-actions">
        <button onClick={onFront}>Bring to Front</button>
        <button onClick={onBack}>Send to Back</button>
        <button onClick={onDuplicate}>Duplicate</button>
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>
    </>
  )
}

function ReadOnlyContent({ slide, slides, idx, cm, report, slideFindings }) {
  return (
    <>
      <div className="stat-bar">
        <div className="stat-box"><div className="stat-num">{slide.index}</div><div className="stat-lbl">Slide #</div></div>
        <div className="stat-box"><div className="stat-num">{slides.length}</div><div className="stat-lbl">Total</div></div>
        <div className="stat-box">
          <div className={`stat-num ${slideFindings.length ? 'warn' : ''}`}>{slideFindings.length}</div>
          <div className="stat-lbl">Issues</div>
        </div>
      </div>

      <p className="pv-hint">Click any element on the slide to edit it.</p>

      <div>
        <div className="section-label">Title</div>
        <div className="section-title">{slide.title || 'Untitled'}{slide.role ? ` (${slide.role})` : ''}</div>
      </div>

      <div>
        <div className="section-label">Key Points</div>
        {slideFindings.length ? (
          <ul className="key-points">{slideFindings.map((f) => <li key={f.finding_id}>{f.evidence || f.remark}</li>)}</ul>
        ) : (
          <div className="section-text muted">No findings recorded for this slide.</div>
        )}
      </div>

      <div>
        <div className="section-label">Metadata</div>
        <div className="meta-box">
          <div className="meta-item"><span>Slide index</span><span>{slide.index}</span></div>
          <div className="meta-item"><span>Role</span><span>{slide.role || '—'}</span></div>
          <div className="meta-item"><span>Position</span><span>{idx + 1} of {slides.length}</span></div>
          <div className="meta-item"><span>Issues</span><span>{slideFindings.length}</span></div>
        </div>
      </div>
    </>
  )
}
