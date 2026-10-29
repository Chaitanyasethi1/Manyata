import { Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'
import NavBar from './components/NavBar.jsx'
import LandingPage from './pages/Home/LandingPage.jsx'
import LoginPage from './pages/Auth/LoginPage.jsx'
import InstitutionPortal from './pages/Institution/index.jsx'
import OfficerPortal     from './pages/Officer/index.jsx'
import AdminPortal       from './pages/Admin/index.jsx'

import ErrorBoundary from './components/ErrorBoundary.jsx'

export default function App() {
  const [role, setRole] = useState('officer')  // officer | admin | institution
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex flex-col font-sans">
      {!isLoginPage && <NavBar role={role} setRole={setRole} />}
      <main className="flex-1 w-full flex flex-col min-w-0">
        <ErrorBoundary>
          <Routes>
            <Route path="/"              element={<LandingPage setRole={setRole} />} />
            <Route path="/login"         element={<LoginPage setRole={setRole} />} />
            <Route path="/officer/*"     element={<OfficerPortal role={role} setRole={setRole} />} />
            <Route path="/admin/*"       element={<AdminPortal role={role} setRole={setRole} />} />
            <Route path="/institution/*" element={<InstitutionPortal role={role} setRole={setRole} />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  )
}


