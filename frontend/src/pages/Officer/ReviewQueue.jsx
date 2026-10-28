import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listApplications } from '../../api.js'
import StatusBadge from '../../components/StatusBadge.jsx'

export default function ReviewQueue() {
  const [apps,    setApps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    listApplications('UNDER_REVIEW')
      .then(r => setApps(r.data))
      .catch(() => setError('Failed to load review queue.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>
  if (error)   return <p className="text-sm text-red-500">{error}</p>

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold">Review Queue</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Applications awaiting officer decision
          </p>
        </div>
        <span className="text-sm bg-yellow-100 text-yellow-800
                         px-3 py-1 rounded-full font-semibold">
          {apps.length} pending
        </span>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm">No applications pending review.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Application ID</th>
                <th className="px-4 py-3 text-left">Institution</th>
                <th className="px-4 py-3 text-left">Trust Score</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Submitted</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apps.map((a) => (
                <tr key={a.application_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">
                    {a.application_id}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {a.institution_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${
                      a.trust_score >= 75 ? 'text-green-600' :
                      a.trust_score >= 50 ? 'text-yellow-600' :
                                            'text-red-600'
                    }`}>
                      {a.trust_score?.toFixed(1) ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/officer/${a.application_id}`}
                      className="text-xs bg-gray-900 text-white
                                 px-3 py-1.5 rounded"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
