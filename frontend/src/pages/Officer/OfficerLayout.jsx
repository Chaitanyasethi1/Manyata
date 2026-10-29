import { Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'
import PortalAppShell from '../../components/layout/PortalAppShell.jsx'

export default function OfficerLayout() {
  const location = useLocation()

  const breadcrumbs = [
    { label: 'AICTE Officer Portal', to: '/officer' },
  ]

  if (location.pathname.includes('/sources')) breadcrumbs.push({ label: 'Verification Sources' })
  if (location.pathname.includes('/sop')) breadcrumbs.push({ label: 'Officer Scrutiny SOP' })
  if (location.pathname.match(/\/officer\/[A-Za-z0-9-]+$/) && !location.pathname.includes('/sources') && !location.pathname.includes('/sop')) {
    breadcrumbs.push({ label: 'Individual Case Scrutiny' })
  }

  return (
    <PortalAppShell role="officer">
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <Outlet />
      </div>
    </PortalAppShell>
  )
}
