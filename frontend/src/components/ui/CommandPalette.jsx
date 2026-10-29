import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, ArrowRight, X, Shield, School, Landmark, BookOpen } from 'lucide-react'

export default function CommandPalette({ isOpen, setIsOpen }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const items = [
    { type: 'APPLICATION', title: 'AICTE-2026-0001 · Greenfield Polytechnic', desc: 'EoA 2026-27 · Score 94 (Cleared)', path: '/institution/report/AICTE-2026-0001' },
    { type: 'APPLICATION', title: 'AICTE-2026-0002 · Greenfield Polytechnic', desc: 'EoA 2026-27 · Score 64 (Needs Review - Fire NOC)', path: '/officer/AICTE-2026-0002' },
    { type: 'APPLICATION', title: 'AICTE-2026-0004 · Saraswati College', desc: 'New Course · Score 58 (Needs Review)', path: '/officer/AICTE-2026-0004' },
    { type: 'APPLICATION', title: 'AICTE-2026-0005 · Kaveri Academy', desc: 'EoA 2026-27 · Score 38 (Deficient - Capped)', path: '/institution/deficiency/AICTE-2026-0005' },

    { type: 'NAVIGATE', title: 'Officer Scrutiny Queue', desc: 'Needs Review queue (Scores 50-74)', path: '/officer' },
    { type: 'NAVIGATE', title: 'New Application Submission', desc: 'Phase 1 Intake Wizard', path: '/institution/new' },
    { type: 'NAVIGATE', title: 'Document Manager', desc: 'Mandatory statutory schedules & expiry dates', path: '/institution/documents' },
    { type: 'NAVIGATE', title: 'National Audit & Compliance Log', desc: 'Immutable chained transaction trail with CSV Export', path: '/admin/audit' },
    { type: 'NAVIGATE', title: 'Verification Sources Panel', desc: '8 connected government registries & API status', path: '/officer/sources' },
    { type: 'NAVIGATE', title: 'Alerts & Reminders', desc: 'Statutory compliance calendar & deadlines', path: '/institution/alerts' },

    { type: 'CLAUSE', title: 'AICTE APH 2026 Clause 4.3.2(b)', desc: 'Fire Safety NOC & Life Safety Certificate norms', path: '/about#handbook' },
    { type: 'CLAUSE', title: 'AICTE APH 2026 Clause 4.2.1', desc: 'Land Title, Ownership & FAR requirements', path: '/about#handbook' },
    { type: 'CLAUSE', title: 'AICTE APH 2026 Clause 5.1', desc: 'Cadre Ratio and Student-to-Faculty Ratio (SFR)', path: '/about#handbook' },
  ]

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setIsOpen])

  if (!isOpen) return null

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(path) {
    setIsOpen(false)
    setQuery('')
    navigate(path)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 px-4 backdrop-blur-xs">
      <div className="bg-white border border-[#D0D5DD] rounded-[8px] shadow-2xl max-w-xl w-full overflow-hidden animate-fade-in-rise">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-[#D0D5DD] flex items-center gap-3 bg-[#F8FAFC]">
          <Search className="w-4 h-4 text-[#5B6472] shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, application ID, handbook clause..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-[#1A1D23] focus:outline-none placeholder-[#5B6472]"
          />
          <span className="text-[10px] font-mono bg-white border border-[#D0D5DD] px-1.5 py-0.5 rounded-[2px] text-[#5B6472]">
            ESC
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#5B6472] hover:text-[#1A1D23]"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#5B6472]">
              No matching records, routes, or clauses found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(item.path)}
                className="flex items-center justify-between p-2.5 rounded-[4px] hover:bg-[#F4F6F9] cursor-pointer text-xs transition-colors border border-transparent hover:border-[#D0D5DD]"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] ${
                    item.type === 'APPLICATION'
                      ? 'bg-[#EBF0FA] text-[#0B1F4B]'
                      : item.type === 'CLAUSE'
                      ? 'bg-[#FBF3DC] text-[#8A5A0B]'
                      : 'bg-gray-100 text-[#5B6472]'
                  }`}>
                    {item.type}
                  </span>
                  <div>
                    <span className="font-semibold text-[#1A1D23] block">{item.title}</span>
                    <span className="text-[11px] text-[#5B6472] block">{item.desc}</span>
                  </div>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-[#5B6472] shrink-0" strokeWidth={1.5} />
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2 border-t border-[#D0D5DD] bg-[#F8FAFC] flex items-center justify-between text-[11px] text-[#5B6472]">
          <span>Tip: Press <kbd className="font-mono bg-white px-1 border border-gray-300 rounded">Ctrl</kbd> + <kbd className="font-mono bg-white px-1 border border-gray-300 rounded">K</kbd> anywhere</span>
          <span>AICTE Manyata Quick Index</span>
        </div>
      </div>
    </div>
  )
}
