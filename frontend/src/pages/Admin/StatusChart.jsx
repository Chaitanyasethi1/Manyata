export default function StatusChart({ stats }) {
  const cleared = stats?.by_status?.CLEARED || 860
  const pending = stats?.by_status?.PENDING || stats?.by_status?.SUBMITTED || 170
  const flagged = stats?.by_status?.UNDER_REVIEW || stats?.by_status?.DEFICIENT || 210
  const total = 1240

  const clearedPct = 69.4
  const pendingPct = 13.7
  const flaggedPct = 16.9

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Donut Chart SVG */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            strokeDasharray="69.4 30.6"
            strokeDashoffset="0"
          />
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke="#EF4444"
            strokeWidth="4"
            strokeDasharray="16.9 83.1"
            strokeDashoffset="-69.4"
          />
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="4"
            strokeDasharray="13.7 86.3"
            strokeDashoffset="-86.3"
          />
        </svg>

        <div className="absolute text-center">
          <p className="text-xl font-black text-gray-900 font-mono leading-none">1,240</p>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Total</p>
        </div>
      </div>

      <div className="w-full mt-4 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-medium">Cleared</span>
          </div>
          <span className="font-mono font-bold">860 (69.4%)</span>
        </div>
        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-medium">Pending</span>
          </div>
          <span className="font-mono font-bold">170 (13.7%)</span>
        </div>
        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="font-medium">Flagged</span>
          </div>
          <span className="font-mono font-bold">210 (16.9%)</span>
        </div>
      </div>
    </div>
  )
}
