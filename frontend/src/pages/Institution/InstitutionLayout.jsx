import { Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'
import PortalAppShell from '../../components/layout/PortalAppShell.jsx'

export default function InstitutionLayout() {
  const location = useLocation()

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
    <PortalAppShell role="institution">
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <Outlet />
      </div>
    </PortalAppShell>
  )
}
