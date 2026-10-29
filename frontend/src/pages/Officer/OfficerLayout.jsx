import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'
import { ClipboardList, Database, BookOpen, ShieldCheck } from 'lucide-react'

export default function OfficerLayout() {
  const location = useLocation()

  const tabs = [
    { to: '/officer', label: 'Review Queue (Needs Review 50-74)', icon: ClipboardList, end: true },
    { to: '/officer/sources', label: 'Verification Sources Panel', icon: Database },
    { to: '/officer/sop', label: 'Scrutiny SOP & Guidelines', icon: BookOpen },
  ]

  const breadcrumbs = [
    { label: 'AICTE Officer Portal', to: '/officer' },
  ]

  if (location.pathname.includes('/sources')) breadcrumbs.push({ label: 'Verification Sources' })
  if (location.pathname.includes('/sop')) breadcrumbs.push({ label: 'Officer Scrutiny SOP' })
  if (location.pathname.match(/\/officer\/[A-Za-z0-9-]+$/) && !location.pathname.includes('/sources') && !location.pathname.includes('/sop')) {
    breadcrumbs.push({ label: 'Individual Case Scrutiny' })
  }

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Officer Bureau Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D0D5DD] gap-3">
          <div>
            <span className="text-[11px] font-mono font-bold text-[#5B6472] uppercase">
              AICTE Regulation Bureau · Central Scrutiny Desk
            </span>
            <h1 className="text-xl font-semibold text-[#0B1F4B] tracking-tight mt-0.5">
              Regulatory Reviewer Console · South-Western Regional Office
            </h1>
            <p className="text-xs text-[#5B6472]">
              Officer: S. K. Ramanathan, Joint Director (Scrutiny) · Session ID: OFF-SWRO-2026-992
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#E6F2EA] text-[#1F5E34] border border-[#4C8A62] px-2.5 py-1 rounded-[2px] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Tier-2 Scrutiny Authority</span>
            </span>
          </div>
        </div>

        {/* Notice Box */}
        <div className="bg-[#F4F6F9] border-l-4 border-[#0B1F4B] p-3 text-xs text-[#1A1D23] flex items-center justify-between">
          <p>
            <strong className="text-[#0B1F4B]">Core Operating Mandate:</strong> AI output is decision-support only. Final regulatory determinations remain with competent AICTE authorities. Human verification is strictly required before any adverse regulatory action.
          </p>
          <span className="text-[11px] font-mono text-[#5B6472] shrink-0 ml-4">
            AICTE APH 2026 § 4.3
          </span>
        </div>

        {/* Officer Sub-navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-[#D0D5DD] overflow-x-auto text-xs no-print">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-[#0B1F4B] text-[#0B1F4B] bg-white font-semibold'
                      : 'border-transparent text-[#5B6472] hover:text-[#1A1D23] hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{tab.label}</span>
              </NavLink>
            )
          })}
        </div>

        {/* Child Views */}
        <Outlet />
      </div>
    </div>
  )
}
