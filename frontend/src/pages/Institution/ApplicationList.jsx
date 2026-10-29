import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listApplications } from '../../api.js'
import StatusBadge from '../../components/StatusBadge.jsx'

export default function ApplicationList() {
  const [apps,    setApps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    listApplications()
      .then(r => setApps(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false))
  }, [])

  const safeApps = Array.isArray(apps) ? apps : []

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>
  if (error)   return <p className="text-sm text-red-500">{error}</p>
  if (!safeApps.length) return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-4xl mb-3">📭</p>
      <p className="text-sm">No applications yet.</p>
      <Link to="/institution/upload"
        className="mt-3 inline-block text-sm text-gray-700 underline">
        Submit your first application →
      </Link>
    </div>
  )


  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">My Applications</h2>
        <Link to="/institution/upload"
          className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded">
          + New Application
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Application ID</th>
              <th className="px-4 py-3 text-left">Institution</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Trust Score</th>
              <th className="px-4 py-3 text-left">Submitted</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {apps.map((a) => (
              <tr key={a.application_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{a.application_id}</td>
                <td className="px-4 py-3 truncate max-w-xs">{a.institution_name}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3">
                  {a.trust_score != null
                    ? <span className="font-semibold">{a.trust_score.toFixed(1)}</span>
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(a.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/institution/${a.application_id}`}
                    className="text-xs text-gray-600 underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
