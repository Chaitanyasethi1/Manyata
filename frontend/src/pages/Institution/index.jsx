import { Routes, Route, NavLink } from 'react-router-dom'
import UploadForm       from './UploadForm.jsx'
import ApplicationList  from './ApplicationList.jsx'
import ApplicationDetail from './ApplicationDetail.jsx'
import Alerts           from './Alerts.jsx'

const tabs = [
  { to: '/institution',         label: 'My Applications', end: true },
  { to: '/institution/upload',  label: 'New Application' },
  { to: '/institution/alerts',  label: 'Alerts' },
]

export default function InstitutionPortal() {
  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `pb-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <Routes>
        <Route index                   element={<ApplicationList />} />
        <Route path="upload"           element={<UploadForm />} />
        <Route path="alerts"           element={<Alerts />} />
        <Route path=":appId"           element={<ApplicationDetail />} />
      </Routes>
    </div>
  )
}
