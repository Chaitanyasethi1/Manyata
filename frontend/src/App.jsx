import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import NavBar from './components/NavBar.jsx'
import InstitutionPortal from './pages/Institution/index.jsx'
import OfficerPortal     from './pages/Officer/index.jsx'
import AdminPortal       from './pages/Admin/index.jsx'

export default function App() {
  const [role, setRole] = useState('officer')  // officer | admin | institution

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex flex-col font-sans">
      <NavBar role={role} setRole={setRole} />
      <main className="flex-1 w-full flex flex-col min-w-0">
        <Routes>
          <Route path="/"              element={<Navigate to="/officer" replace />} />
          <Route path="/officer/*"     element={<OfficerPortal role={role} setRole={setRole} />} />
          <Route path="/admin/*"       element={<AdminPortal role={role} setRole={setRole} />} />
          <Route path="/institution/*" element={<InstitutionPortal role={role} setRole={setRole} />} />
        </Routes>
      </main>
    </div>
  )
}
