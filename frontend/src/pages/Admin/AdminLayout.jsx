import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'
import { LayoutDashboard, FileSpreadsheet, Users, ShieldAlert, History } from 'lucide-react'

export default function AdminLayout() {
  const location = useLocation()

  const tabs = [
    { to: '/admin', label: 'Executive Overview & KPIs', icon: LayoutDashboard, end: true },
    { to: '/admin/applications', label: 'National Applications Directory', icon: FileSpreadsheet },
    { to: '/admin/users', label: 'User & Role Governance', icon: Users },
    { to: '/admin/audit', label: 'National Audit & Compliance Log', icon: History },
  ]

  const breadcrumbs = [
    { label: 'Admin Portal', to: '/admin' },
  ]

  if (location.pathname.includes('/applications')) breadcrumbs.push({ label: 'National Applications Directory' })
  if (location.pathname.includes('/users')) breadcrumbs.push({ label: 'User & Role Governance' })
  if (location.pathname.includes('/audit')) breadcrumbs.push({ label: 'National Audit Trail' })

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Admin Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D0D5DD] gap-3">
          <div>
            <span className="text-[11px] font-mono font-bold text-[#5B6472] uppercase">
              AICTE Regulation Bureau · Central Administration Command
            </span>
            <h1 className="text-xl font-semibold text-[#0B1F4B] tracking-tight mt-0.5">
              National Compliance Governance & Executive Dashboard
            </h1>
            <p className="text-xs text-[#5B6472]">
              Administrator: Dr. Aniruddha Roy, Chief Technology Officer · Role-Based Access Control (RBAC) Active
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#F4F6F9] text-[#0B1F4B] border border-[#0B1F4B] px-2.5 py-1 rounded-[2px] font-mono font-bold">
              SYS-ADMIN · LEVEL-4
            </span>
          </div>
        </div>

        {/* Mandatory Principle Banner */}
        <div className="bg-[#F4F6F9] border-l-4 border-[#0B1F4B] p-3 text-xs text-[#1A1D23] flex items-center justify-between">
          <p>
            <strong className="text-[#0B1F4B]">Governance Mandate:</strong> System-wide immutable logging enabled. Every automated AI extraction and human regulatory review action is recorded in the cryptographically chained audit trail for SIH 2026 Problem Statement SIH26261.
          </p>
          <span className="text-[11px] font-mono text-[#5B6472] shrink-0 ml-4">
            GIGW 3.0 / ISO 27001
          </span>
        </div>

        {/* Admin Sub-navigation Tabs */}
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

        {/* Outlet Content */}
        <Outlet />
      </div>
    </div>
  )
}
