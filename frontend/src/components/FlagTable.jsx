/**
 * Reusable flag table.
 * Props:
 *   flags : array of flag objects from ValidationResult.modules[].flags
 *           each flag has: id, severity, message, document, clause, module
 */
const SEV_STYLE = {
  critical: 'bg-red-100 text-red-700 border-red-300',
  high:     'bg-orange-100 text-orange-700 border-orange-300',
  medium:   'bg-blue-100 text-blue-700 border-blue-300',
  low:      'bg-gray-100 text-gray-600 border-gray-300',
}

const SEV_BAR = {
  critical: 'border-red-500',
  high:     'border-orange-400',
  medium:   'border-blue-400',
  low:      'border-gray-300',
}

export default function FlagTable({ flags = [] }) {
  if (!flags.length) return (
    <p className="text-sm text-green-600 font-medium">✓ No flags detected.</p>
  )

  // Sort: critical first
  const ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
  const sorted = [...flags].sort(
    (a, b) => (ORDER[a.severity] ?? 9) - (ORDER[b.severity] ?? 9)
  )

  return (
    <div className="space-y-2">
      {sorted.map((f, i) => (
        <div
          key={i}
          className={`border-l-4 rounded-r px-3 py-2 text-sm ${SEV_BAR[f.severity]}`}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded border
                              ${SEV_STYLE[f.severity]}`}>
              {f.severity?.toUpperCase()}
            </span>
            <span className="font-mono text-xs text-gray-400">{f.id}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">{f.document}</span>
            {f.module && (
              <>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400 italic">{f.module}</span>
              </>
            )}
          </div>
          <p className="text-gray-800">{f.message}</p>
          {f.clause && (
            <p className="text-xs text-gray-400 mt-0.5 italic">{f.clause}</p>
          )}
        </div>
      ))}
    </div>
  )
}
