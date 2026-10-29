import { Routes, Route } from 'react-router-dom'
import AdminLayout from './AdminLayout.jsx'
import AdminOverview from './AdminOverview.jsx'
import AdminApplications from './AdminApplications.jsx'
import AdminUsers from './AdminUsers.jsx'
import AdminAuditTrail from './AdminAuditTrail.jsx'

export default function AdminPortal() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit" element={<AdminAuditTrail />} />
      </Route>
    </Routes>
  )
}
