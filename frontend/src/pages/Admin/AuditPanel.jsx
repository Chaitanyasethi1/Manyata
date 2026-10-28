import { useEffect, useState } from 'react'
import { getAuditLog } from '../../api.js'

export default function AuditPanel({ apps }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!apps.length) {
      setLoading(false)
      return
    }

    // Fetch audit logs for all apps in parallel, merge + sort
    Promise.all(
      apps.map(a =>
        getAuditLog(a.application_id)
          .then(r => r.data)
          .catch(() => [])
      )
    ).then(results => {
      const all = results
        .flat()
        .sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        )
        .slice(0, 50)   // latest 50 only
      setEntries(all)
    }).finally(() => setLoading(false))
  }, [apps])

  if (loading) return (
    <p className="text-sm text-gray-400 py-4">Loading audit log…</p>
  )

  if (!entries.length) return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-4xl mb-3">📋</p>
      <p className="text-sm">No audit entries yet.</p>
    </div>
  )

  const ACTION_COLOR = {
    OFFICER_CONFIRM_CLEAR:    'text-green-600',
    OFFICER_RETURN_DEFICIENT: 'text-red-600',
    OFFICER_ASK_FOR_INFO:     'text-yellow-600',
    STATUS_CHANGE:            'text-blue-600',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Audit Log</h3>
        <span className="text-xs text-gray-400">
          Latest {entries.length} entries across all applications
        </span>
      </div>

      <div className="space-y-1">
        {entries.map((e) => (
          <div
            key={e.id}
            className="grid text-xs gap-2 py-2 border-b border-gray-50
                       last:border-0"
            style={{ gridTemplateColumns: '140px 120px 200px 1fr' }}
          >
            {/* Timestamp */}
            <span className="text-gray-400">
              {new Date(e.created_at).toLocaleString()}
            </span>

            {/* Actor */}
            <span className="font-medium text-gray-600 truncate">
              {e.actor}
            </span>

            {/* Action */}
            <span className={`font-mono font-semibold
              ${ACTION_COLOR[e.action] ?? 'text-gray-700'}`}>
              {e.action}
            </span>

            {/* Detail */}
            <span className="text-gray-500 truncate">
              {e.from_status && e.to_status
                ? `${e.from_status} → ${e.to_status}`
                : ''}
              {e.comment
                ? <span className="italic ml-2 text-gray-400">
                    "{e.comment}"
                  </span>
                : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
