import StatusBadge from './StatusBadge.jsx'

export default function TrustScoreBar({ score = 0, isCapped = false, capReason = '' }) {
  const clampedScore = Math.max(0, Math.min(100, Number(score) || 0))

  let bandStatus = 'CLEARED'
  let barColor = 'bg-[#1F5E34]'
  let bandText = 'Cleared (≥ 75)'

  if (clampedScore < 50) {
    bandStatus = 'DEFICIENT'
    barColor = 'bg-[#8F2D2D]'
    bandText = 'Deficient (< 50)'
  } else if (clampedScore < 75) {
    bandStatus = 'NEEDS_REVIEW'
    barColor = 'bg-[#8A5A0B]'
    bandText = 'Needs Review (50–74)'
  }

  return (
    <div className="gov-card p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#5B6472]">
            Overall Composite Trust Score
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-semibold font-mono text-[#0B1F4B]">
              {clampedScore}
            </span>
            <span className="text-xs text-[#5B6472] font-mono">/ 100</span>
          </div>
        </div>

        <div className="text-right">
          <StatusBadge status={bandStatus} size="sm" />
          <p className="text-[11px] text-[#5B6472] mt-1 font-medium">{bandText}</p>
        </div>
      </div>

      {/* Horizontal Bar with Marked 50 and 75 Thresholds */}
      <div className="pt-2 pb-1">
        <div className="relative w-full h-3 bg-[#E5E7EB] rounded-[2px] overflow-visible border border-[#D0D5DD]">
          {/* Filled progress */}
          <div
            className={`h-full ${barColor} transition-all duration-150`}
            style={{ width: `${clampedScore}%` }}
            role="progressbar"
            aria-valuenow={clampedScore}
            aria-valuemin="0"
            aria-valuemax="100"
          />

          {/* 50 Threshold Tick */}
          <div
            className="absolute top-[-4px] bottom-[-4px] w-[2px] bg-[#1A1D23] z-10"
            style={{ left: '50%' }}
            title="Deficient Threshold (50)"
          />

          {/* 75 Threshold Tick */}
          <div
            className="absolute top-[-4px] bottom-[-4px] w-[2px] bg-[#1A1D23] z-10"
            style={{ left: '75%' }}
            title="Cleared Threshold (75)"
          />
        </div>

        {/* Labels below thresholds */}
        <div className="relative w-full text-[11px] text-[#5B6472] mt-1.5 font-mono">
          <span className="absolute left-0">0</span>
          <span className="absolute left-[50%] -translate-x-1/2">50 (Deficient cutoff)</span>
          <span className="absolute left-[75%] -translate-x-1/2">75 (Cleared cutoff)</span>
          <span className="absolute right-0">100</span>
        </div>
      </div>

      {isCapped && (
        <div className="text-xs bg-[#FDF2F2] border border-[#F6B8B8] text-[#8F2D2D] p-2 rounded-[2px]">
          <strong>Score Capped:</strong> {capReason || 'Score capped at 49 due to presence of critical integrity anomaly flag.'}
        </div>
      )}
    </div>
  )
}
