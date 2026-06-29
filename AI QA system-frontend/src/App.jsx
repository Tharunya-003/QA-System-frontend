import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Upload from './pages/Upload.jsx'
import Report from './pages/Report.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const loc = useLocation()
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">🎓 ID&nbsp;QA</Link>
        <nav>
          <Link className={loc.pathname === '/' ? 'active' : ''} to="/">Upload</Link>
          <Link className={loc.pathname.startsWith('/admin') ? 'active' : ''} to="/admin">Rubric</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/report/:reviewId" element={<Report />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  )
}
