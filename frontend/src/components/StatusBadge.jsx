const CONFIG = {
  SUBMITTED:    'bg-gray-100 text-gray-700',
  PROCESSING:   'bg-blue-100 text-blue-700',
  CLEARED:      'bg-green-100 text-green-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  DEFICIENT:    'bg-red-100 text-red-700',
  RESUBMITTED:  'bg-purple-100 text-purple-700',
  FORWARDED:    'bg-teal-100 text-teal-700',
}

export default function StatusBadge({ status }) {
  const cls = CONFIG[status] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {status}
    </span>
  )
}
