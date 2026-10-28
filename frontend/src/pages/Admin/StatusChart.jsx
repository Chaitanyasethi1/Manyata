import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const STATUS_COLORS = {
  SUBMITTED:    '#9ca3af',
  PROCESSING:   '#60a5fa',
  CLEARED:      '#4ade80',
  UNDER_REVIEW: '#fbbf24',
  DEFICIENT:    '#f87171',
  RESUBMITTED:  '#c084fc',
  FORWARDED:    '#2dd4bf',
}

export default function StatusChart({ stats }) {
  if (!stats?.by_status) return null

  const data = Object.entries(stats.by_status)
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({ status, count }))

  if (!data.length) return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="font-semibold text-sm mb-2">Status Distribution</h3>
      <p className="text-sm text-gray-400">No data yet.</p>
    </div>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="font-semibold text-sm mb-4">Status Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="status"
            tick={{ fontSize: 10 }}
            tickFormatter={s => s.replace('_', ' ')}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10 }}
            width={28}
          />
          <Tooltip
            formatter={(v) => [v, 'Applications']}
            labelFormatter={l => l.replace('_', ' ')}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] ?? '#9ca3af'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
