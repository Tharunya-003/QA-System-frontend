import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Upload from './pages/Upload.jsx'
import Report from './pages/Report.jsx'
import Admin from './pages/Admin.jsx'
import Scorm from './pages/Scorm.jsx'

export default function App() {
  const loc = useLocation()
  const isStoryboard = loc.pathname === '/' || loc.pathname.startsWith('/report')
  const isScorm = loc.pathname.startsWith('/scorm')
  const isRubric = loc.pathname.startsWith('/admin')

  return (
    <div className="topapp">
      <header className="topnav">
        <div className="topnav-inner">
          <Link to="/" className="topnav-brand">🎓 ID&nbsp;QA</Link>
          <nav className="topnav-links">
            <Link className={isStoryboard ? 'active' : ''} to="/">Storyboard</Link>
            <Link className={isScorm ? 'active' : ''} to="/scorm">Scorm</Link>
            <Link className={isRubric ? 'active' : ''} to="/admin">Rubric</Link>
          </nav>
        </div>
      </header>

      <main className="topmain">
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/scorm" element={<Scorm />} />
          <Route path="/report/:reviewId" element={<Report />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  )
}
