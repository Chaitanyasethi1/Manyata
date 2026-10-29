import { Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'
import PortalAppShell from '../../components/layout/PortalAppShell.jsx'

export default function AdminLayout() {
  const location = useLocation()

  const breadcrumbs = [
    { label: 'Admin Portal', to: '/admin' },
  ]

  if (location.pathname.includes('/applications')) breadcrumbs.push({ label: 'National Applications Directory' })
  if (location.pathname.includes('/users')) breadcrumbs.push({ label: 'User & Role Governance' })
  if (location.pathname.includes('/audit')) breadcrumbs.push({ label: 'National Audit Trail' })

  return (
    <PortalAppShell role="admin">
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <Outlet />
      </div>
    </PortalAppShell>
  )
}
