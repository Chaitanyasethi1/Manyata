import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Header() {
  const { t } = useTranslation()

  return (
    <header className="bg-white border-b border-[#D0D5DD] py-3.5 px-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Neutral Seal + Wordmark + Subtitle */}
        <Link to="/" className="flex items-center gap-3.5 text-inherit no-underline">
          {/* Neutral Placeholder Crest (Inline SVG Shield/Seal) */}
          <div className="w-11 h-11 shrink-0" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M24 4L7 10V22C7 33.5 14.5 42.5 24 45C33.5 42.5 41 33.5 41 22V10L24 4Z" fill="#0B1F4B" stroke="#D0D5DD" strokeWidth="1.5"/>
              <path d="M24 7L10 12V22C10 31.5 16 39.5 24 41.8C32 39.5 38 31.5 38 22V12L24 7Z" fill="#1F3A7A"/>
              <circle cx="24" cy="23" r="8" stroke="#FFFFFF" strokeWidth="1.2" fill="#0B1F4B"/>
              <circle cx="24" cy="23" r="2.5" fill="#E07B00"/>
              <path d="M24 16V19M24 27V30M17 23H20M28 23H31" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M16 36L24 38L32 36" stroke="#138808" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-[#0B1F4B]">
                {t('siteTitle', 'Manyata')}
              </span>
              <span className="text-[11px] font-mono text-[#5B6472] uppercase tracking-wider hidden sm:inline">
                · AICTE Regulation Bureau Scrutiny
              </span>
            </div>
            <p className="text-xs text-[#5B6472] font-normal mt-0.5 leading-tight">
              {t('siteSubtitle', 'AI-Assisted Application Validation & Compliance Verification')}
            </p>
          </div>
        </Link>

        {/* Right: SIH 2026 Problem Statement Tag & Theme */}
        <div className="text-right hidden sm:block border-l border-[#D0D5DD] pl-4">
          <p className="text-xs font-semibold text-[#0B1F4B]">
            Smart India Hackathon 2026
          </p>
          <p className="text-[11px] text-[#5B6472] font-mono mt-0.5">
            Problem Statement: SIH26261 · Smart Automation
          </p>
        </div>
      </div>
    </header>
  )
}
