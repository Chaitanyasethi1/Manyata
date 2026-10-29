import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn, User, Shield, School, Landmark } from 'lucide-react'

export default function Navbar({ role, setRole }) {
  const { t } = useTranslation()
  const location = useLocation()

  const navLinks = [
    { to: '/', label: t('nav.home', 'Home'), end: true },
    { to: '/about', label: t('nav.about', 'About Manyata') },
    { to: '/how-it-works', label: t('nav.howItWorks', 'How It Works') },
    { to: '/categories', label: t('nav.categories', 'Application Categories') },
    { to: '/sources', label: t('nav.sources', 'Verification Sources') },
    { to: '/faqs', label: t('nav.faqs', 'Help / FAQs') },
  ]

  const isPortalActive =
    location.pathname.startsWith('/officer') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/institution')

  return (
    <nav className="gov-navbar bg-[#0B1F4B] text-white select-none border-b border-[#081738]" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between flex-wrap">
        {/* Left Navigation Links */}
        <div className="flex items-center overflow-x-auto py-0">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#E07B00] bg-[#1F3A7A] text-white font-semibold'
                    : 'border-transparent text-gray-200 hover:text-white hover:bg-[#132D6B]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right Portal Switcher / Auth Access */}
        <div className="flex items-center gap-1.5 py-1">
          <div className="flex items-center bg-[#071533] border border-[#1F3A7A] rounded-[2px] p-0.5 text-xs">
            <Link
              to="/institution"
              onClick={() => setRole && setRole('institution')}
              className={`px-2 py-1 flex items-center gap-1 rounded-[2px] transition-colors ${
                location.pathname.startsWith('/institution')
                  ? 'bg-[#1F3A7A] text-white font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-[#132D6B]'
              }`}
              title="Access College Application Portal"
            >
              <School className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden lg:inline">{t('nav.institutionPortal', 'Institution')}</span>
            </Link>

            <Link
              to="/officer"
              onClick={() => setRole && setRole('officer')}
              className={`px-2 py-1 flex items-center gap-1 rounded-[2px] transition-colors ${
                location.pathname.startsWith('/officer')
                  ? 'bg-[#1F3A7A] text-white font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-[#132D6B]'
              }`}
              title="Access Scrutiny Officer Queue"
            >
              <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden lg:inline">{t('nav.officerPortal', 'Officer Desk')}</span>
            </Link>

            <Link
              to="/admin"
              onClick={() => setRole && setRole('admin')}
              className={`px-2 py-1 flex items-center gap-1 rounded-[2px] transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'bg-[#1F3A7A] text-white font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-[#132D6B]'
              }`}
              title="Access Executive Command & Audit Dashboard"
            >
              <Landmark className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden lg:inline">{t('nav.adminPortal', 'Admin HQ')}</span>
            </Link>
          </div>

          <Link
            to="/login"
            className="gov-btn gov-btn-secondary !text-xs !py-1 !px-2.5 !bg-white !text-[#0B1F4B] !border-white hover:!bg-gray-100"
          >
            <LogIn className="w-3.5 h-3.5 text-[#0B1F4B]" strokeWidth={1.5} />
            <span>{isPortalActive ? t('nav.logout', 'Sign Out') : t('nav.login', 'Login')}</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
