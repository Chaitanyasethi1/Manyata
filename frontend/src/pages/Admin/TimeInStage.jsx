import StatusBadge from '../../components/StatusBadge.jsx'

function timeSince(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (days  > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${mins % 60}m`
  return `${mins}m`
}

function urgencyColor(status, dateStr) {
  const hours = (Date.now() - new Date(dateStr).getTime()) / 3600000
  if (status === 'UNDER_REVIEW' && hours > 24) return 'text-red-600 font-semibold'
  if (status === 'UNDER_REVIEW' && hours > 12) return 'text-yellow-600 font-semibold'
  return 'text-gray-600'
}

export default function TimeInStage({ apps }) {
  const active = apps.filter(a =>
    !['CLEARED', 'DEFICIENT', 'FORWARDED'].includes(a.status)
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Time in Current Stage</h3>
        <span className="text-xs text-gray-400">
          Active applications only
        </span>
      </div>

      {active.length === 0 ? (
        <p className="text-sm text-gray-400">
          No active applications.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left py-2">Application ID</th>
              <th className="text-left py-2">Institution</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Time in Stage</th>
              <th className="text-left py-2">SLA Warning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {active.map((a) => {
              const timeStr  = timeSince(a.created_at)
              const urgency  = urgencyColor(a.status, a.created_at)
              const slaBreached =
                a.status === 'UNDER_REVIEW' &&
                (Date.now() - new Date(a.created_at).getTime()) > 24 * 3600000

              return (
                <tr key={a.application_id}>
                  <td className="py-2 font-mono text-xs">
                    {a.application_id}
                  </td>
                  <td className="py-2 max-w-xs truncate">
                    {a.institution_name}
                  </td>
                  <td className="py-2">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className={`py-2 ${urgency}`}>
                    {timeStr}
                  </td>
                  <td className="py-2">
                    {slaBreached ? (
                      <span className="text-xs bg-red-100 text-red-700
                                       px-2 py-0.5 rounded-full font-semibold">
                        ⚠ SLA Breach
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
