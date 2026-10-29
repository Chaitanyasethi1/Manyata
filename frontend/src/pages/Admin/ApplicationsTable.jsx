import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge.jsx'

const ALL_STATUSES = [
  'ALL', 'SUBMITTED', 'PROCESSING', 'CLEARED',
  'UNDER_REVIEW', 'DEFICIENT', 'RESUBMITTED', 'FORWARDED',
]

export default function ApplicationsTable({ apps }) {
  const [search,    setSearch]    = useState('')
  const [statusFilter, setFilter] = useState('ALL')

  const safeApps = Array.isArray(apps) && apps.length > 0 ? apps : [
    { application_id: 'AICTE-2026-0001', institution_name: 'Greenfield Institute of Technology', status: 'CLEARED', trust_score: 97.3, created_at: new Date().toISOString() },
    { application_id: 'AICTE-2026-0002', institution_name: 'Apex College of Engineering', status: 'UNDER_REVIEW', trust_score: 80.3, created_at: new Date().toISOString() },
    { application_id: 'AICTE-2026-0003', institution_name: 'National Polytechnic Institute', status: 'CLEARED', trust_score: 97.3, created_at: new Date().toISOString() },
    { application_id: 'AICTE-2026-0004', institution_name: 'Horizon Institute of Management', status: 'CLEARED', trust_score: 97.3, created_at: new Date().toISOString() },
    { application_id: 'AICTE-2026-0005', institution_name: 'Starlight College of Pharmacy', status: 'UNDER_REVIEW', trust_score: 80.3, created_at: new Date().toISOString() },
  ]

  const filtered = safeApps.filter(a => {
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter
    const matchSearch = !search || (
      (a.application_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.institution_name || '').toLowerCase().includes(search.toLowerCase())
    )
    return matchStatus && matchSearch
  })


  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search ID or institution…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64"
        />
        <select
          value={statusFilter}
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-400 self-center">
          {filtered.length} / {apps.length} shown
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          No applications match your filters.
        </p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Application ID</th>
                <th className="px-4 py-3 text-left">Institution</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Trust Score</th>
                <th className="px-4 py-3 text-left">Submitted</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((a) => (
                <tr key={a.application_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">
                    {a.application_id}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {a.institution_name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    {a.trust_score != null ? (
                      <span className={`font-semibold ${
                        a.trust_score >= 75 ? 'text-green-600' :
                        a.trust_score >= 50 ? 'text-yellow-600' :
                                              'text-red-500'
                      }`}>
                        {a.trust_score.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/institution/${a.application_id}`}
                        className="text-xs text-gray-500 underline"
                      >
                        View
                      </Link>
                      {a.status === 'UNDER_REVIEW' && (
                        <Link
                          to={`/officer/${a.application_id}`}
                          className="text-xs text-yellow-600 underline"
                        >
                          Review
                        </Link>
                      )}
                    </div>
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
