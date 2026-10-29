import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Search, Download, FileText, ChevronRight } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { mockApplications } from '../../data/mockData.js'

export default function AdminApplications() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const applications = [
    ...mockApplications,
    {
      id: 'AICTE-2026-0006',
      institution: 'R.V. Institute of Management',
      aicteId: '1-9382019482',
      category: 'Extension of Approval (EoA)',
      submittedDate: '29-Oct-2026 12:40',
      status: 'CLEARED',
      score: 88,
      slaRemaining: '44h remaining',
    },
    {
      id: 'AICTE-2026-0007',
      institution: 'Vidyapeeth Institute of Pharmacy',
      aicteId: '1-5948372019',
      category: 'Extension of Approval (EoA)',
      submittedDate: '29-Oct-2026 09:15',
      status: 'NEEDS_REVIEW',
      score: 71,
      slaRemaining: '40h remaining',
    },
    {
      id: 'AICTE-2026-0008',
      institution: 'National Institute of Applied Sciences',
      aicteId: '1-8492019482',
      category: 'Increase in Approved Intake',
      submittedDate: '29-Oct-2026 04:30',
      status: 'NEEDS_REVIEW',
      score: 68,
      slaRemaining: '36h remaining',
    },
  ]

  const filtered = applications.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.aicteId.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-[#D0D5DD] rounded-[4px]">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-[#5B6472]" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#1A1D23]">Status:</span>
          <div className="flex flex-wrap items-center gap-1">
            {['ALL', 'CLEARED', 'NEEDS_REVIEW', 'DEFICIENT'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-xs border rounded-[2px] font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-[#0B1F4B] text-white border-[#0B1F4B]'
                    : 'bg-white text-[#5B6472] border-[#D0D5DD] hover:bg-gray-50'
                }`}
              >
                {s === 'ALL' ? 'All (8)' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5B6472] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by ID, institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 text-xs border border-[#D0D5DD] rounded-[2px] w-64 focus:outline-none focus:ring-1 focus:ring-[#0B1F4B]"
          />
        </div>
      </div>

      {/* Applications Directory Table */}
      <div className="bg-white border border-[#D0D5DD] rounded-[4px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gov-table w-full text-left">
            <thead>
              <tr>
                <th scope="col">Application ID</th>
                <th scope="col">Institution & Permanent ID</th>
                <th scope="col">Regulatory Category</th>
                <th scope="col">Submitted On</th>
                <th scope="col">Trust Score</th>
                <th scope="col">Regulatory Status</th>
                <th scope="col" className="text-right">Inspection Dossier</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="whitespace-nowrap font-mono text-xs font-bold text-[#0B1F4B]">
                    {a.id}
                  </td>
                  <td>
                    <p className="font-semibold text-xs text-[#1A1D23]">{a.institution}</p>
                    <span className="font-mono text-[11px] text-[#5B6472]">{a.aicteId}</span>
                  </td>
                  <td className="text-xs text-[#5B6472] whitespace-nowrap">
                    {a.category}
                  </td>
                  <td className="whitespace-nowrap font-mono text-xs text-[#5B6472]">
                    {a.submittedDate}
                  </td>
                  <td className="whitespace-nowrap font-mono text-xs">
                    <span className="font-bold text-sm text-[#0B1F4B]">{a.score}/100</span>
                  </td>
                  <td className="whitespace-nowrap">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <Link
                        to={`/institution/report/${a.id}`}
                        className="text-[#1F3A7A] hover:underline font-medium"
                      >
                        Validation Report
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Link
                        to={`/officer/${a.id}`}
                        className="text-[#0B1F4B] font-semibold hover:underline"
                      >
                        Officer Review
                      </Link>
                    </div>
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
