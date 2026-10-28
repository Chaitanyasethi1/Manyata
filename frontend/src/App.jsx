import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import NavBar from './components/NavBar.jsx'
import InstitutionPortal from './pages/Institution/index.jsx'
import OfficerPortal     from './pages/Officer/index.jsx'
import AdminPortal       from './pages/Admin/index.jsx'

export default function App() {
  const [role, setRole] = useState('institution')  // institution | officer | admin

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <NavBar role={role} setRole={setRole} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/"              element={<Navigate to="/institution" replace />} />
          <Route path="/institution/*" element={<InstitutionPortal />} />
          <Route path="/officer/*"     element={<OfficerPortal />} />
          <Route path="/admin/*"       element={<AdminPortal />} />
        </Routes>
      </main>
    </div>
  )
}
