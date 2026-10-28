export default function KPICards({ stats, alerts }) {
  if (!stats) return null

  const unread = alerts.filter(a => !a.is_read).length

  const cards = [
    {
      label: 'Total Applications',
      value: stats.total,
      sub:   'all time',
      color: 'bg-gray-50 border-gray-200',
    },
    {
      label: 'Cleared',
      value: stats.by_status?.CLEARED ?? 0,
      sub:   'approved by officer',
      color: 'bg-green-50 border-green-200',
    },
    {
      label: 'Under Review',
      value: stats.by_status?.UNDER_REVIEW ?? 0,
      sub:   'awaiting officer decision',
      color: 'bg-yellow-50 border-yellow-200',
    },
    {
      label: 'Deficient',
      value: stats.by_status?.DEFICIENT ?? 0,
      sub:   'returned to institution',
      color: 'bg-red-50 border-red-200',
    },
    {
      label: 'Avg Trust Score',
      value: stats.avg_trust_score != null
               ? stats.avg_trust_score.toFixed(1)
               : '—',
      sub:   'across validated apps',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Unread Alerts',
      value: unread,
      sub:   'need attention',
      color: unread > 0
               ? 'bg-orange-50 border-orange-200'
               : 'bg-gray-50 border-gray-200',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`border rounded-lg p-4 ${c.color}`}
        >
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {c.label}
          </p>
          <p className="text-3xl font-bold text-gray-800">{c.value}</p>
          <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
