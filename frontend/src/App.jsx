import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import TricolourStrip from './components/layout/TricolourStrip.jsx'
import UtilityBar from './components/layout/UtilityBar.jsx'
import Header from './components/layout/Header.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Public Pages
import Home from './pages/Public/Home.jsx'
import About from './pages/Public/About.jsx'
import HowItWorks from './pages/Public/HowItWorks.jsx'
import Categories from './pages/Public/Categories.jsx'
import VerificationSources from './pages/Public/VerificationSources.jsx'
import HelpFaqs from './pages/Public/HelpFaqs.jsx'
import NotFound from './pages/Public/NotFound.jsx'

// Auth Page
import Login from './pages/Auth/Login.jsx'

// Portals
import InstitutionPortal from './pages/Institution/index.jsx'
import OfficerPortal from './pages/Officer/index.jsx'
import AdminPortal from './pages/Admin/index.jsx'

export default function App() {
  const [role, setRole] = useState('officer') // 'officer' | 'institution' | 'admin'

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#1A1D23] flex flex-col font-sans selection:bg-[#0B1F4B] selection:text-white">
      {/* 1. Thin Tricolour Strip (Saffron / White / Green 4px) */}
      <TricolourStrip />

      {/* 2. Utility Bar: Accessibility, Font size, Contrast, i18n */}
      <UtilityBar />

      {/* 3. National Portal Header with Neutral Crest & SIH26261 Tag */}
      <Header />

      {/* 4. Navy Main Navigation Bar with Role Quick Switcher */}
      <Navbar role={role} setRole={setRole} />

      {/* 5. Main Content Area */}
      <main id="main-content" className="flex-1 w-full flex flex-col min-w-0" tabIndex={-1}>
        <ErrorBoundary>
          <Routes>
            {/* Public Informational Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/sources" element={<VerificationSources />} />
            <Route path="/faqs" element={<HelpFaqs />} />
            <Route path="/login" element={<Login setRole={setRole} />} />

            {/* Role-Based Portals */}
            <Route path="/institution/*" element={<InstitutionPortal />} />
            <Route path="/officer/*" element={<OfficerPortal />} />
            <Route path="/admin/*" element={<AdminPortal />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* 6. Official 4-Column Government Footer */}
      <Footer />
    </div>
  )
}
