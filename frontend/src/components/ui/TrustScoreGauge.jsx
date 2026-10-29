import { useState, useEffect } from 'react'

export default function TrustScoreGauge({ score = 68, isCapped = false, size = 200 }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 600
    const steps = 30
    const increment = score / steps
    const stepTime = duration / steps

    const timer = setInterval(() => {
      start += increment
      if (start >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [score])

  // Gauge geometry: Semi-circle from 180deg (left) to 0deg (right)
  // angle = 180 - (score / 100) * 180
  const needleAngle = 180 - (animatedScore / 100) * 180

  let bandLabel = 'CLEARED'
  let bandColor = '#1F5E34'
  let bandBg = '#E6F2EA'
  let bandBorder = '#4C8A62'

  if (score < 50 || isCapped) {
    bandLabel = 'DEFICIENT'
    bandColor = '#8F2D2D'
    bandBg = '#F6E7E7'
    bandBorder = '#B85C5C'
  } else if (score < 75) {
    bandLabel = 'NEEDS REVIEW'
    bandColor = '#8A5A0B'
    bandBg = '#FBF3DC'
    bandBorder = '#C99A3A'
  }

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative" style={{ width: size, height: size * 0.62 }}>
        <svg viewBox="0 0 200 125" className="w-full h-full overflow-visible">
          {/* Arc Background Track (Grey) */}
          <path
            d="M 20 110 A 80 80 0 0 1 180 110"
            fill="none"
            stroke="#E4E7EC"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Band 1: Deficient 0 - 49 (Red #8F2D2D) */}
          {/* 180deg to 91.8deg */}
          <path
            d="M 20 110 A 80 80 0 0 1 97.4 30.0"
            fill="none"
            stroke="#8F2D2D"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Band 2: Needs Review 50 - 74 (Amber #C99A3A) */}
          {/* 90deg to 45deg */}
          <path
            d="M 100 30 A 80 80 0 0 1 156.5 53.4"
            fill="none"
            stroke="#C99A3A"
            strokeWidth="16"
          />

          {/* Band 3: Cleared 75 - 100 (Green #1F5E34) */}
          {/* 45deg to 0deg */}
          <path
            d="M 156.5 53.4 A 80 80 0 0 1 180 110"
            fill="none"
            stroke="#1F5E34"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Center Hub */}
          <circle cx="100" cy="110" r="8" fill="#0B1F4B" />
          <circle cx="100" cy="110" r="3" fill="#FFFFFF" />

          {/* Animated Needle */}
          <g transform={`rotate(${needleAngle - 90}, 100, 110)`} style={{ transition: 'transform 100ms ease-out' }}>
            <line
              x1="100"
              y1="110"
              x2="100"
              y2="42"
              stroke="#0B1F4B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <polygon points="97,60 103,60 100,38" fill="#0B1F4B" />
          </g>

          {/* Threshold markers */}
          {/* 50 Threshold (Top centre) */}
          <line x1="100" y1="20" x2="100" y2="28" stroke="#5B6472" strokeWidth="1.5" />
          <text x="100" y="16" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#5B6472">50</text>

          {/* 75 Threshold */}
          <line x1="160" y1="44" x2="154" y2="50" stroke="#5B6472" strokeWidth="1.5" />
          <text x="168" y="44" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#5B6472">75</text>
        </svg>

        {/* Center score readout */}
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="text-3xl font-black font-mono tracking-tight text-[#0B1F4B]">
            {animatedScore}
          </span>
          <span className="text-xs font-mono text-[#5B6472] ml-1">/100</span>
        </div>
      </div>

      {/* Band Badge */}
      <div className="mt-2 text-center">
        <span
          className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-[2px] border"
          style={{
            color: bandColor,
            backgroundColor: bandBg,
            borderColor: bandBorder,
          }}
        >
          {bandLabel}
        </span>
        {isCapped && (
          <span className="block text-[10px] text-[#8F2D2D] font-mono mt-0.5 font-bold">
            Score capped at &lt;50 due to critical flag
          </span>
        )}
      </div>
    </div>
  )
}
