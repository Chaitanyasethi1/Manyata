import { useEffect, useState } from 'react'
import { listAlerts, markAlertRead } from '../../api.js'

const ALERT_COLORS = {
  CRITICAL_FLAG:    'border-red-400 bg-red-50',
  MISSING_DOCUMENT: 'border-yellow-400 bg-yellow-50',
  REVIEW_SLA_BREACH:'border-blue-400 bg-blue-50',
  DOCUMENT_EXPIRY:  'border-orange-400 bg-orange-50',
}

export default function Alerts() {
  const [alerts,  setAlerts]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listAlerts(null, false)
      .then(r => setAlerts(r.data))
      .finally(() => setLoading(false))
  }, [])

  async function markRead(id) {
    await markAlertRead(id)
    setAlerts(a => a.map(x => x.id === id ? { ...x, is_read: true } : x))
  }

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>
  if (!alerts.length) return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-4xl mb-3">🔔</p>
      <p className="text-sm">No alerts.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-gray-700">Alerts</h2>
      {alerts.map((a) => (
        <div key={a.id}
          className={`border-l-4 rounded p-4 flex items-start justify-between
            ${ALERT_COLORS[a.alert_type] ?? 'border-gray-300 bg-gray-50'}
            ${a.is_read ? 'opacity-50' : ''}`}
        >
          <div>
            <p className="text-xs font-bold uppercase text-gray-500 mb-0.5">
              {a.alert_type.replace(/_/g, ' ')} · {a.application_id}
            </p>
            <p className="text-sm">{a.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(a.created_at).toLocaleString()}
            </p>
          </div>
          {!a.is_read && (
            <button
              onClick={() => markRead(a.id)}
              className="ml-4 text-xs text-gray-500 underline shrink-0"
            >
              Mark read
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
