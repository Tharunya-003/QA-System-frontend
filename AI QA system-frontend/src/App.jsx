import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Upload from './pages/Upload.jsx'
import Report from './pages/Report.jsx'
import Admin from './pages/Admin.jsx'
import Scorm from './pages/Scorm.jsx'
import { listReviews, deleteReview, togglePinReview, editReviewFilename, listGuidelines } from './api.js'

export default function App() {
  const loc = useLocation()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [guidelines, setGuidelines] = useState([])
  const [historyTab, setHistoryTab] = useState('storyboards')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [menuState, setMenuState] = useState({ id: null, x: 0, y: 0 })
  
  const isContentsActive = loc.pathname === '/' || loc.pathname.startsWith('/report')
  const isPreviewActive = loc.pathname.startsWith('/admin')
  const isScormActive = loc.pathname.startsWith('/scorm')

  useEffect(() => {
    setHistory(listReviews())
    setGuidelines(listGuidelines())
    // Auto-switch history tab when navigating between pages
    if (loc.pathname.startsWith('/scorm')) {
      setHistoryTab('scorm')
    } else if (loc.pathname === '/' || loc.pathname.startsWith('/report')) {
      setHistoryTab('storyboards')
    }
  }, [loc.pathname])

  useEffect(() => {
    const handleOutsideClick = () => setMenuState({ id: null, x: 0, y: 0 })
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  const handleDeleteHistory = (e, reviewId) => {
    e.preventDefault()
    e.stopPropagation()
    deleteReview(reviewId)
    setHistory(listReviews())
    if (loc.pathname === `/report/${reviewId}`) {
      navigate('/')
    }
  }

  const handleTogglePin = (reviewId) => {
    togglePinReview(reviewId)
    setHistory(listReviews())
  }

  const handleRename = (reviewId, oldName) => {
    const newName = prompt("Rename storyboard:", oldName)
    if (newName && newName.trim()) {
      editReviewFilename(reviewId, newName.trim())
      setHistory(listReviews())
    }
  }

  const handleLogoClick = (e) => {
    if (isSidebarCollapsed) {
      e.preventDefault()
      setIsSidebarCollapsed(false)
    }
  }

  const activeReview = history.find(r => r.review_id === menuState.id)

  return (
    <div className="app">
      {/* Fixed popup menu - rendered outside sidebar to avoid overflow clipping */}
      {menuState.id && activeReview && (
        <div
          className="sidebar-history-dropdown"
          style={{ position: 'fixed', top: menuState.y, left: menuState.x, zIndex: 9999 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="sidebar-dropdown-item" onClick={() => { handleTogglePin(menuState.id); setMenuState({ id: null, x: 0, y: 0 }); }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px', color: activeReview.pinned ? 'var(--border-focus)' : 'inherit' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {activeReview.pinned ? 'Unpin' : 'Pin'}
          </button>
          <button className="sidebar-dropdown-item" onClick={() => { handleRename(menuState.id, activeReview.filename); setMenuState({ id: null, x: 0, y: 0 }); }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Edit
          </button>
          <button className="sidebar-dropdown-item delete" onClick={(e) => { if (confirm(`Are you sure you want to delete "${activeReview.filename}"?`)) { handleDeleteHistory(e, menuState.id); } setMenuState({ id: null, x: 0, y: 0 }); }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
      {/* Persistent Left Sidebar */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          {/* Logo & Brand Title */}
          <div className="sidebar-brand-wrapper">
            <Link 
              to="/" 
              className="logo-box" 
              title={isSidebarCollapsed ? "Expand sidebar" : "Dashboard"} 
              onClick={handleLogoClick}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              </svg>
            </Link>
            {!isSidebarCollapsed && (
              <>
                <span className="sidebar-brand-name">ID QA</span>
                <button 
                  className="sidebar-collapse-btn" 
                  onClick={() => setIsSidebarCollapsed(true)} 
                  title="Collapse sidebar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <div className="sidebar-nav">
            <Link 
              className={`sidebar-nav-item ${loc.pathname === '/' ? 'active' : ''}`} 
              to="/" 
              title="Upload storyboard"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {!isSidebarCollapsed && <span>Storyboard</span>}
            </Link>
            <Link
              className={`sidebar-nav-item ${isScormActive ? 'active' : ''}`}
              to="/scorm"
              title="Upload SCORM package"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              {!isSidebarCollapsed && <span>Scorm</span>}
            </Link>
            <Link 
              className={`sidebar-nav-item ${isPreviewActive ? 'active' : ''}`} 
              to="/admin" 
              title="QA Rubric Standards"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              {!isSidebarCollapsed && <span>Rubric</span>}
            </Link>
          </div>

          {/* Dynamic History - Tabbed */}
          {!isSidebarCollapsed && (
            <div className="sidebar-history">
              <span className="sidebar-history-title">History</span>

              {/* Tab Switcher */}
              <div className="sidebar-tabs">
                <button
                  className={`sidebar-tab ${historyTab === 'storyboards' ? 'active' : ''}`}
                  onClick={() => setHistoryTab('storyboards')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px' }}>
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <path d="M8 21h8M12 17v4"/>
                  </svg>
                  Storyboards
                </button>
                <button
                  className={`sidebar-tab ${historyTab === 'scorm' ? 'active' : ''}`}
                  onClick={() => setHistoryTab('scorm')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px' }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  Scorm
                </button>
                <button
                  className={`sidebar-tab ${historyTab === 'guidelines' ? 'active' : ''}`}
                  onClick={() => { setHistoryTab('guidelines'); setGuidelines(listGuidelines()); }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Guidelines
                </button>
              </div>

              {/* Storyboards Tab */}
              {historyTab === 'storyboards' && (
                history.length === 0 ? (
                  <p className="sidebar-history-empty">No audited storyboards</p>
                ) : (
                  <ul className="sidebar-history-list">
                    {history.map((r) => {
                      const isActive = loc.pathname === `/report/${r.review_id}`
                      return (
                        <li key={r.review_id}>
                          <div className={`sidebar-history-item-wrapper ${isActive ? 'active' : ''}`}>
                            <Link
                              className="sidebar-history-item-link"
                              to={`/report/${r.review_id}`}
                              title={r.filename}
                            >
                              <span className="sidebar-history-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {r.pinned && (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--border-focus)', flexShrink: 0 }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                  </svg>
                                )}
                                {r.filename}
                              </span>
                            </Link>
                            <div className="sidebar-history-menu-container" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="sidebar-history-menu-btn"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (menuState.id === r.review_id) {
                                    setMenuState({ id: null, x: 0, y: 0 })
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setMenuState({ id: r.review_id, x: rect.right + 8, y: rect.top })
                                  }
                                }}
                                title="Actions"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="1.5"/>
                                  <circle cx="12" cy="5" r="1.5"/>
                                  <circle cx="12" cy="19" r="1.5"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )
              )}

              {/* Scorm Tab */}
              {historyTab === 'scorm' && (() => {
                const scormHistory = (() => { try { return JSON.parse(localStorage.getItem('scorm_history') || '[]') } catch { return [] } })()
                return scormHistory.length === 0 ? (
                  <p className="sidebar-history-empty">No SCORM packages uploaded yet</p>
                ) : (
                  <ul className="sidebar-history-list">
                    {scormHistory.map((r) => (
                      <li key={r.id}>
                        <div className="sidebar-history-item-wrapper">
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, minWidth: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--border-focus)', flexShrink: 0, marginTop: '2px' }}>
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                              <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                            <div style={{ minWidth: 0 }}>
                              <div className="sidebar-history-name" style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>{r.filename}</div>
                              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>
                                {r.size ? `${(r.size / 1024).toFixed(1)} KB · ` : ''}{new Date(r.uploadedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              })()}

              {/* Guidelines Tab */}
              {historyTab === 'guidelines' && (
                guidelines.length === 0 ? (
                  <p className="sidebar-history-empty">No guidelines uploaded yet</p>
                ) : (
                  <ul className="sidebar-history-list">
                    {guidelines.map((g) => (
                      <li key={g.name + g.uploadedAt}>
                        <div className="sidebar-history-item-wrapper sidebar-guideline-item">
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, minWidth: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--border-focus)', flexShrink: 0, marginTop: '2px' }}>
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                            <div style={{ minWidth: 0 }}>
                              <div className="sidebar-history-name" style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>{g.name}</div>
                              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>
                                {g.size ? `${(g.size / 1024).toFixed(1)} KB · ` : ''}{new Date(g.uploadedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="sidebar-profile" onClick={() => isSidebarCollapsed && setIsSidebarCollapsed(false)}>
          <div className="sidebar-avatar" title="User settings">G</div>
          {!isSidebarCollapsed && (
            <div className="sidebar-profile-info">
              <p className="profile-name">Angela Ann</p>
              <p className="profile-email">angela@id-qa.com</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`main-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <header className="topbar">
          <div className="brand" style={{ letterSpacing: '0.1em', fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>
            {loc.pathname.startsWith('/report') ? 'AUDIT REPORT' : loc.pathname.startsWith('/admin') ? 'RUBRIC PREVIEW' : 'DASHBOARD'}
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/scorm" element={<Scorm />} />
            <Route path="/report/:reviewId" element={<Report />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
