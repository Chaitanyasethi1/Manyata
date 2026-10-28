import { useEffect, useState } from 'react'
import { listApplications, listAlerts, getStats } from '../../api.js'
import KPICards           from './KPICards.jsx'
import StatusChart        from './StatusChart.jsx'
import ApplicationsTable  from './ApplicationsTable.jsx'
import TimeInStage        from './TimeInStage.jsx'
import AuditPanel         from './AuditPanel.jsx'

const TABS = [
  { id: 'overview',  label: 'Overview'     },
  { id: 'apps',      label: 'Applications' },
  { id: 'audit',     label: 'Audit Log'    },
]

export default function AdminPortal() {
  const [tab,    setTab]    = useState('overview')
  const [apps,   setApps]   = useState([])
  const [alerts, setAlerts] = useState([])
  const [stats,  setStats]  = useState(null)
  const [loading,setLoading]= useState(true)

  useEffect(() => {
    Promise.all([
      listApplications().then(r => setApps(r.data)),
      listAlerts().then(r => setAlerts(r.data)),
      getStats().then(r => setStats(r.data)),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <p className="text-sm text-gray-400 py-8 text-center">
      Loading dashboard…
    </p>
  )

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold">Admin Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            System overview — all applications
          </p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {new Date().toLocaleString()}
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <KPICards  stats={stats} alerts={alerts} />
          <StatusChart stats={stats} />
          <TimeInStage apps={apps} />
        </div>
      )}

      {tab === 'apps' && (
        <ApplicationsTable apps={apps} />
      )}

      {tab === 'audit' && (
        <AuditPanel apps={apps} />
      )}
    </div>
  )
}
