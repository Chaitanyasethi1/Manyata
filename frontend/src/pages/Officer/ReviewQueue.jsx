import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, ArrowUpDown, Clock, AlertTriangle, ChevronRight, Search, FileText } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import TrustScoreBar from '../../components/ui/TrustScoreBar.jsx'
import { mockApplications } from '../../data/mockData.js'

export default function ReviewQueue() {
  const [priorityFilter, setPriorityFilter] = useState('ALL') // ALL | HIGH | MEDIUM | DEFICIENT
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('score') // score | age | flags
  const [sortAsc, setSortAsc] = useState(true)

  // Needs review cases are score 50-74, plus allow viewing all queue files
  const baseQueue = [
    {
      id: 'AICTE-2026-0002',
      institution: 'Greenfield Polytechnic Institute',
      aicteId: '1-3847291048',
      category: 'Extension of Approval (EoA)',
      score: 64,
      priority: 'HIGH',
      ageHours: 18,
      submittedDate: '28-Oct-2026 18:20',
      flagsCount: 2,
      flagsSummary: 'Fire NOC date mismatch; Land survey discrepancy',
      slaRemaining: '30h remaining',
      status: 'NEEDS_REVIEW',
    },
    {
      id: 'AICTE-2026-0004',
      institution: 'Saraswati College of Engineering',
      aicteId: '1-1029384756',
      category: 'Introduction of New Course / Division',
      score: 58,
      priority: 'HIGH',
      ageHours: 26,
      submittedDate: '28-Oct-2026 10:45',
      flagsCount: 3,
      flagsSummary: 'Cadre ratio shortfall in CSE faculty; Incomplete laboratory carpet area certificate',
      slaRemaining: '22h remaining',
      status: 'NEEDS_REVIEW',
    },
    {
      id: 'AICTE-2026-0007',
      institution: 'Vidyapeeth Institute of Pharmacy',
      aicteId: '1-5948372019',
      category: 'Extension of Approval (EoA)',
      score: 71,
      priority: 'MEDIUM',
      ageHours: 8,
      submittedDate: '29-Oct-2026 09:15',
      flagsCount: 1,
      flagsSummary: 'Building stability certificate issued under older municipal format',
      slaRemaining: '40h remaining',
      status: 'NEEDS_REVIEW',
    },
    {
      id: 'AICTE-2026-0005',
      institution: 'Kaveri Academy of Technical Studies',
      aicteId: '1-7483920156',
      category: 'Extension of Approval (EoA)',
      score: 38,
      priority: 'CRITICAL',
      ageHours: 34,
      submittedDate: '27-Oct-2026 14:10',
      flagsCount: 4,
      flagsSummary: 'Severe land title mismatch; Affidavit seal tampering detected by ELA',
      slaRemaining: '14h remaining',
      status: 'DEFICIENT',
    },
    {
      id: 'AICTE-2026-0008',
      institution: 'National Institute of Applied Sciences',
      aicteId: '1-8492019482',
      category: 'Increase in Approved Intake',
      score: 68,
      priority: 'MEDIUM',
      ageHours: 12,
      submittedDate: '29-Oct-2026 04:30',
      flagsCount: 1,
      flagsSummary: 'Hostel accommodation capacity calculation clarification needed',
      slaRemaining: '36h remaining',
      status: 'NEEDS_REVIEW',
    },
  ]

  // Filter logic
  const filtered = baseQueue.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.aicteId.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (priorityFilter === 'HIGH') return item.priority === 'HIGH'
    if (priorityFilter === 'MEDIUM') return item.priority === 'MEDIUM'
    if (priorityFilter === 'DEFICIENT') return item.status === 'DEFICIENT'
    return true
  })

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'score') {
      return sortAsc ? a.score - b.score : b.score - a.score
    }
    if (sortField === 'age') {
      return sortAsc ? a.ageHours - b.ageHours : b.ageHours - a.ageHours
    }
    if (sortField === 'flags') {
      return sortAsc ? a.flagsCount - b.flagsCount : b.flagsCount - a.flagsCount
    }
    return 0
  })

  return (
    <div className="space-y-6">
      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Cases in Scrutiny Queue</span>
          <span className="text-2xl font-semibold text-[#0B1F4B]">{baseQueue.length}</span>
          <span className="text-[11px] text-[#8A5A0B] block mt-0.5">Score band 50–74 + escalated</span>
        </div>

        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">High Priority (Score 50-59)</span>
          <span className="text-2xl font-semibold text-[#8A5A0B]">
            {baseQueue.filter(x => x.priority === 'HIGH').length}
          </span>
          <span className="text-[11px] text-[#5B6472] block mt-0.5">Requires multi-clause scrutiny</span>
        </div>

        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Average Scrutiny Age</span>
          <span className="text-2xl font-semibold text-[#0B1F4B]">19.6 hrs</span>
          <span className="text-[11px] text-[#1F5E34] block mt-0.5">Within 48h SLA limit</span>
        </div>

        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Deficiency Capped Cases</span>
          <span className="text-2xl font-semibold text-[#8F2D2D]">
            {baseQueue.filter(x => x.status === 'DEFICIENT').length}
          </span>
          <span className="text-[11px] text-[#8F2D2D] block mt-0.5">Critical anomaly detected</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#D0D5DD] p-3 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-[#5B6472]" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#1A1D23]">Queue Filter:</span>
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: 'All Cases (5)' },
              { id: 'HIGH', label: 'High Priority (2)' },
              { id: 'MEDIUM', label: 'Standard Review (2)' },
              { id: 'DEFICIENT', label: 'Critical / Capped (1)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setPriorityFilter(f.id)}
                className={`px-2.5 py-1 text-xs border rounded-[2px] font-medium transition-colors ${
                  priorityFilter === f.id
                    ? 'bg-[#0B1F4B] text-white border-[#0B1F4B]'
                    : 'bg-white text-[#5B6472] border-[#D0D5DD] hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5B6472] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search App ID, Institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-[#D0D5DD] rounded-[2px] w-56 focus:outline-none focus:ring-1 focus:ring-[#0B1F4B]"
            />
          </div>

          <div className="flex items-center gap-1 text-xs text-[#5B6472]">
            <span>Sort:</span>
            <button
              onClick={() => {
                if (sortField === 'score') setSortAsc(!sortAsc)
                else { setSortField('score'); setSortAsc(true) }
              }}
              className="px-2 py-1 border border-[#D0D5DD] rounded-[2px] text-xs font-mono flex items-center gap-1 hover:bg-gray-50"
            >
              <span>Score</span>
              <ArrowUpDown className="w-3 h-3" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => {
                if (sortField === 'age') setSortAsc(!sortAsc)
                else { setSortField('age'); setSortAsc(false) }
              }}
              className="px-2 py-1 border border-[#D0D5DD] rounded-[2px] text-xs font-mono flex items-center gap-1 hover:bg-gray-50"
            >
              <span>Age</span>
              <ArrowUpDown className="w-3 h-3" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Dense Table */}
      <div className="bg-white border border-[#D0D5DD] rounded-[4px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gov-table w-full text-left">
            <thead>
              <tr>
                <th scope="col">Application ID</th>
                <th scope="col">Institution & AICTE ID</th>
                <th scope="col">Category</th>
                <th scope="col">Trust Score</th>
                <th scope="col">Queue Age</th>
                <th scope="col">Flags</th>
                <th scope="col">SLA Status</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(row => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-[#0B1F4B]">{row.id}</span>
                  </td>
                  <td>
                    <p className="font-semibold text-xs text-[#1A1D23]">{row.institution}</p>
                    <span className="font-mono text-[11px] text-[#5B6472]">{row.aicteId}</span>
                  </td>
                  <td className="text-xs text-[#5B6472] whitespace-nowrap">
                    {row.category}
                  </td>
                  <td className="whitespace-nowrap font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0B1F4B]">{row.score}/100</span>
                      {row.score < 50 ? (
                        <span className="text-[10px] bg-[#F6E7E7] text-[#8F2D2D] px-1 py-0.2 rounded-[2px] font-semibold border border-[#B85C5C]">
                          &lt; 50
                        </span>
                      ) : row.score < 75 ? (
                        <span className="text-[10px] bg-[#FBF3DC] text-[#8A5A0B] px-1 py-0.2 rounded-[2px] font-semibold border border-[#C99A3A]">
                          50–74
                        </span>
                      ) : (
                        <span className="text-[10px] bg-[#E6F2EA] text-[#1F5E34] px-1 py-0.2 rounded-[2px] font-semibold border border-[#4C8A62]">
                          ≥ 75
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-xs text-[#5B6472] font-mono">
                    {row.ageHours}h ago
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded-[2px] ${
                        row.flagsCount >= 3 ? 'bg-[#F6E7E7] text-[#8F2D2D]' : 'bg-[#FBF3DC] text-[#8A5A0B]'
                      }`}>
                        {row.flagsCount} flags
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5B6472] mt-0.5 truncate max-w-xs">{row.flagsSummary}</p>
                  </td>
                  <td className="whitespace-nowrap text-xs text-[#5B6472] font-mono">
                    <span className="flex items-center gap-1 text-[#8A5A0B]">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      <span>{row.slaRemaining}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap text-right">
                    <Link
                      to={`/officer/${row.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#0B1F4B] text-white text-xs font-medium rounded-[2px] hover:bg-[#1F3A7A] transition-colors"
                    >
                      <span>Scrutinize</span>
                      <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
