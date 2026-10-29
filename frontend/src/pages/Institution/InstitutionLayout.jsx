import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'
import { FileText, FileUp, FolderCheck, Bell } from 'lucide-react'

export default function InstitutionLayout() {
  const location = useLocation()

  const tabs = [
    { to: '/institution', label: 'Application Tracker', icon: FileText, end: true },
    { to: '/institution/new', label: 'New Application (Phase 1)', icon: FileUp },
    { to: '/institution/documents', label: 'Document Manager', icon: FolderCheck },
    { to: '/institution/alerts', label: 'Alerts & Reminders', icon: Bell },
  ]

  const breadcrumbs = [
    { label: 'Institution Portal', to: '/institution' },
  ]

  if (location.pathname.includes('/new')) breadcrumbs.push({ label: 'New Application Submission' })
  if (location.pathname.includes('/documents')) breadcrumbs.push({ label: 'Document Manager' })
  if (location.pathname.includes('/alerts')) breadcrumbs.push({ label: 'Alerts & Reminders' })
  if (location.pathname.includes('/report')) breadcrumbs.push({ label: 'Validation Report' })
  if (location.pathname.includes('/deficiency')) breadcrumbs.push({ label: 'Deficiency Notice' })
  if (location.pathname.includes('/clearance')) breadcrumbs.push({ label: 'Clearance Package' })

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Portal Sub-Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D0D5DD] gap-3">
          <div>
            <span className="text-[11px] font-mono font-bold text-[#5B6472] uppercase">
              Institutional Applicant Self-Service Portal
            </span>
            <h1 className="text-xl font-semibold text-[#0B1F4B] tracking-tight mt-0.5">
              Greenfield Polytechnic Institute · AICTE ID: 1-3847291048
            </h1>
            <p className="text-xs text-[#5B6472]">
              Approval Cycle: 2026-27 · Bengaluru Urban, Karnataka
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#E6F2EA] text-[#1F5E34] border border-[#4C8A62] px-2.5 py-1 rounded-[2px] font-medium">
              Registered Applicant Entity
            </span>
          </div>
        </div>

        {/* Portal Tabs Bar */}
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

        {/* Content Outlet */}
        <Outlet />
      </div>
    </div>
  )
}
