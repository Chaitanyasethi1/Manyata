import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  FileUp,
  FolderCheck,
  Bell,
  ClipboardList,
  Database,
  BookOpen,
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  History,
  Search,
  Moon,
  Sun,
  Menu,
  ChevronLeft,
  ChevronRight,
  Shield,
  School,
  Landmark,
  LogOut,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import CommandPalette from '../ui/CommandPalette.jsx'

export default function PortalAppShell({ role = 'officer', children }) {
  const { t, i18n } = useTranslation()
  const location = useLocation()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Load and apply dark theme state
  useEffect(() => {
    const savedTheme = localStorage.getItem('manyata_portal_theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('manyata_portal_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('manyata_portal_theme', 'light')
    }
  }

  // Navigation Links based on active role
  const institutionNav = [
    {
      group: 'Application Workflow',
      items: [
        { to: '/institution', label: 'Application Tracker', icon: FileText, end: true },
        { to: '/institution/new', label: 'New Application (Phase 1)', icon: FileUp },
        { to: '/institution/documents', label: 'Document Manager', icon: FolderCheck },
      ],
    },
    {
      group: 'Statutory Compliance',
      items: [
        { to: '/institution/alerts', label: 'Alerts & Reminders', icon: Bell, badge: '2' },
      ],
    },
  ]

  const officerNav = [
    {
      group: 'Scrutiny Desk',
      items: [
        { to: '/officer', label: 'Review Queue (50-74)', icon: ClipboardList, end: true, badge: '5' },
        { to: '/officer/sources', label: 'Verification Sources', icon: Database },
      ],
    },
    {
      group: 'Statutory Guidelines',
      items: [
        { to: '/officer/sop', label: 'Officer Scrutiny SOP', icon: BookOpen },
      ],
    },
  ]

  const adminNav = [
    {
      group: 'Executive Governance',
      items: [
        { to: '/admin', label: 'Executive Overview', icon: LayoutDashboard, end: true },
        { to: '/admin/applications', label: 'Applications Directory', icon: FileSpreadsheet },
      ],
    },
    {
      group: 'Compliance & Audit',
      items: [
        { to: '/admin/users', label: 'User & Role Governance', icon: Users },
        { to: '/admin/audit', label: 'National Audit Trail', icon: History },
      ],
    },
  ]

  let currentNav = officerNav
  let roleTitle = 'AICTE Scrutiny Officer'
  let roleBadge = 'OFFICER'
  let userName = 'S. K. Ramanathan, Joint Director'

  if (location.pathname.startsWith('/institution')) {
    currentNav = institutionNav
    roleTitle = 'Institutional Applicant'
    roleBadge = 'INSTITUTION'
    userName = 'Greenfield Polytechnic (1-3847291048)'
  } else if (location.pathname.startsWith('/admin')) {
    currentNav = adminNav
    roleTitle = 'Executive Administration'
    roleBadge = 'ADMIN'
    userName = 'Dr. Aniruddha Roy, CTO'
  }

  return (
    <div className="min-h-screen flex bg-[#F4F6F9] text-[#1A1D23] font-sans portal-shell">
      {/* ── Command Palette (Ctrl+K) ────────────────────────────────────────── */}
      <CommandPalette isOpen={isCommandOpen} setIsOpen={setIsCommandOpen} />

      {/* ── Fixed Left Sidebar (Navy #0B1F4B, 260px / Collapsible) ─────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#0B1F4B] text-white flex flex-col transition-all duration-200 border-r border-[#081738] ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1F3A7A]/60">
          <Link to="/" className="flex items-center gap-2.5 text-inherit no-underline overflow-hidden">
            <div className="w-8 h-8 rounded-[4px] bg-[#1F3A7A] flex items-center justify-center shrink-0 border border-white/20">
              <span className="font-bold text-xs text-white">M</span>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-bold text-sm tracking-tight block text-white">Manyata</span>
                <span className="text-[10px] text-gray-300 font-mono uppercase block -mt-0.5">
                  AICTE Scrutiny Desk
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Grouped Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {currentNav.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider">
                  {section.group}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-[#1F3A7A] text-white font-semibold border-l-3 border-[#E07B00]'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        } ${isCollapsed ? 'justify-center' : ''}`
                      }
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                      {!isCollapsed && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] bg-[#E07B00] text-white font-bold">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Collapse Toggle Button */}
        <div className="p-3 border-t border-[#1F3A7A]/60 flex items-center justify-between">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-[2px]"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-[11px] font-mono uppercase">Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Layout (Content Area with Top Bar) ─────────────────────────── */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${
        isCollapsed ? 'md:ml-16' : 'md:ml-64'
      }`}>
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-[#D0D5DD] px-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Mobile hamburger & Global Search Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-1.5 text-[#5B6472] hover:text-[#1A1D23]"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Quick Command Palette Search Button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#5B6472] bg-[#F4F6F9] hover:bg-gray-100 border border-[#D0D5DD] rounded-[4px] w-48 sm:w-64 transition-colors"
            >
              <Search className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="flex-1 text-left truncate">Search dossier, clauses...</span>
              <kbd className="hidden sm:inline font-mono text-[10px] bg-white border border-[#D0D5DD] px-1.5 rounded-[2px]">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons: Notifications, Theme Toggle, Language, User Menu */}
          <div className="flex items-center gap-2.5">
            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-[#5B6472] hover:text-[#1A1D23] rounded-[4px] border border-[#D0D5DD] hover:bg-gray-50 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#E07B00]" strokeWidth={1.5} />
              ) : (
                <Moon className="w-4 h-4 text-[#0B1F4B]" strokeWidth={1.5} />
              )}
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-1.5 text-[#5B6472] hover:text-[#1A1D23] rounded-[4px] border border-[#D0D5DD] hover:bg-gray-50 transition-colors"
                title="Statutory Alerts"
              >
                <Bell className="w-4 h-4" strokeWidth={1.5} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#8F2D2D] rounded-full" />
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#D0D5DD] rounded-[4px] shadow-lg p-3 space-y-2 z-50 text-xs animate-fade-in-rise">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#D0D5DD]">
                    <span className="font-bold text-[#0B1F4B] uppercase tracking-wide text-[11px]">
                      Compliance Alerts (2)
                    </span>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-[10px] text-[#1F3A7A] hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2 bg-[#F6E7E7] text-[#8F2D2D] rounded-[2px] border border-[#B85C5C]">
                      <strong>Fire Safety NOC Expiring:</strong> KSFES NOC expires in 25 days (AICTE-2026-0002).
                    </div>
                    <div className="p-2 bg-[#FBF3DC] text-[#8A5A0B] rounded-[2px] border border-[#C99A3A]">
                      <strong>Scrutiny Queue SLA:</strong> Case AICTE-2026-0004 has 22h remaining.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#D0D5DD]">
              <div className="hidden lg:block text-right">
                <span className="text-xs font-semibold text-[#1A1D23] block leading-tight">
                  {userName}
                </span>
                <span className="text-[10px] font-mono text-[#5B6472] block">
                  {roleTitle}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] ${
                roleBadge === 'ADMIN'
                  ? 'bg-[#0B1F4B] text-white'
                  : roleBadge === 'OFFICER'
                  ? 'bg-[#EBF0FA] text-[#0B1F4B] border border-[#0B1F4B]'
                  : 'bg-[#E6F2EA] text-[#1F5E34] border border-[#4C8A62]'
              }`}>
                {roleBadge}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
