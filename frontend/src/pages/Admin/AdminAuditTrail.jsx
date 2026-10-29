import { useState } from 'react'
import {
  Download,
  Filter,
  Search,
  History,
  ShieldCheck,
  CheckCircle2,
  List,
  GitCommit,
  User,
  Cpu,
  Building,
  Key
} from 'lucide-react'

export default function AdminAuditTrail() {
  const [viewMode, setViewMode] = useState('table') // 'table' | 'timeline'
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const auditEntries = [
    {
      id: 'AUD-99120',
      timestamp: '2026-10-29T16:15:22+05:30',
      formattedTime: '29-Oct-2026 16:15:22 IST',
      actor: 'officer:ramanathan',
      actorLabel: 'S. K. Ramanathan (Joint Director)',
      role: 'OFFICER',
      action: 'RECORD_SCRUTINY_DECISION',
      record: 'AICTE-2026-0002',
      ruleApplied: 'APH 2026 Clause 4.3.2(b) [Fire NOC Discrepancy]',
      sourceResponse: 'KSFES API: Expiry 28-Oct-2026 mismatch with 28-Nov-2026 on doc',
      hash: 'sha256:7a9f8b3c1e5491a27b88e104f9921',
    },
    {
      id: 'AUD-99119',
      timestamp: '2026-10-29T15:50:11+05:30',
      formattedTime: '29-Oct-2026 15:50:11 IST',
      actor: 'system:verification-engine',
      actorLabel: 'Cross-Registry Worker #4',
      role: 'SYSTEM',
      action: 'CROSS_REGISTRY_QUERY',
      record: 'AICTE-2026-0002',
      ruleApplied: 'APH 2026 § 2.1.4 [Bhoomi Land Revenue Demarcation]',
      sourceResponse: 'Bhoomi Karnataka Gateway: Survey 42/1 matched 3.42 Acres',
      hash: 'sha256:1b2c3d9f8e438201a472910482910',
    },
    {
      id: 'AUD-99118',
      timestamp: '2026-10-29T15:45:00+05:30',
      formattedTime: '29-Oct-2026 15:45:00 IST',
      actor: 'system:ai-ocr-pipeline',
      actorLabel: 'PyMuPDF + OCR Neural Worker',
      role: 'SYSTEM',
      action: 'FEATURE_EXTRACTION_COMPLETE',
      record: 'AICTE-2026-0002',
      ruleApplied: 'Smart Automation Model v2.4 [Table Extraction]',
      sourceResponse: 'Extracted 18 fields across 4 documents with 98.2% avg confidence',
      hash: 'sha256:4d5e6f8a7b9382019482910482910',
    },
    {
      id: 'AUD-99117',
      timestamp: '2026-10-29T14:10:04+05:30',
      formattedTime: '29-Oct-2026 14:10:04 IST',
      actor: 'institution:greenfield_polytechnic',
      actorLabel: 'Registrar, Greenfield Polytechnic',
      role: 'INSTITUTION',
      action: 'APPLICATION_SUBMITTED',
      record: 'AICTE-2026-0002',
      ruleApplied: 'AICTE EoA Schedule 2026-27 Stage 1 Intake',
      sourceResponse: 'Payload integrity SHA-256 verified; 4 PDFs received',
      hash: 'sha256:9c8b7a1d2e9382019482910482910',
    },
    {
      id: 'AUD-99116',
      timestamp: '2026-10-29T11:20:18+05:30',
      formattedTime: '29-Oct-2026 11:20:18 IST',
      actor: 'system:deficiency-generator',
      actorLabel: 'Automated Deficiency Cell',
      role: 'SYSTEM',
      action: 'DEFICIENCY_NOTICE_COMPILED',
      record: 'AICTE-2026-0005',
      ruleApplied: 'APH 2026 Clause 4.2.1 [FAR & Land Title Non-compliance]',
      sourceResponse: 'Score capped at 38/100; Formal notice dispatched to applicant inbox',
      hash: 'sha256:3e2d1c5b6a9382019482910482910',
    },
    {
      id: 'AUD-99115',
      timestamp: '2026-10-28T19:40:55+05:30',
      formattedTime: '28-Oct-2026 19:40:55 IST',
      actor: 'admin:dr_aniruddha_roy',
      actorLabel: 'Dr. Aniruddha Roy, CTO',
      role: 'ADMIN',
      action: 'SYSTEM_THRESHOLD_CONFIG',
      record: 'SYS_POLICY_2026_01',
      ruleApplied: 'National Automation Governance Directive',
      sourceResponse: 'Capping rule active: Deficient threshold 50, Cleared 75',
      hash: 'sha256:8f9e0a2b3c9382019482910482910',
    },
    {
      id: 'AUD-99114',
      timestamp: '2026-10-28T17:15:30+05:30',
      formattedTime: '28-Oct-2026 17:15:30 IST',
      actor: 'system:clearance-engine',
      actorLabel: 'Clearance Package Compiler',
      role: 'SYSTEM',
      action: 'CLEARANCE_PACKAGE_ISSUED',
      record: 'AICTE-2026-0001',
      ruleApplied: 'APH 2026 Fast-Track Auto-Clearance (Score 94 >= 75)',
      sourceResponse: 'Digital QR seal generated; Sent to apex_institute@portal.edu',
      hash: 'sha256:6a7b8c4d5e9382019482910482910',
    },
  ]

  const filteredLogs = auditEntries.filter((log) => {
    const matchesSearch =
      log.record.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ruleApplied.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (roleFilter !== 'ALL' && log.role !== roleFilter) return false
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false
    return true
  })

  function exportCSV() {
    const headers = ['Audit ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Record', 'Rule Applied', 'Source Response', 'Cryptographic Hash']
    const rows = filteredLogs.map((l) => [
      l.id,
      l.formattedTime,
      `"${l.actorLabel}"`,
      l.role,
      l.action,
      l.record,
      `"${l.ruleApplied}"`,
      `"${l.sourceResponse.replace(/"/g, '""')}"`,
      l.hash,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Manyata_National_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER WITH VIEW MODE TOGGLE & CSV EXPORT ───────────────────────── */}
      <div className="bg-white border border-[#D0D5DD] p-5 rounded-[8px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="gov-eyebrow text-[#0B1F4B]">STATUTORY AUDIT & LINEAGE</span>
          <h1 className="font-serif text-2xl font-semibold text-[#0B1F4B] tracking-tight mt-0.5">
            National Regulatory Audit Trail
          </h1>
          <p className="text-xs text-[#5B6472] mt-1 max-w-xl">
            Cryptographically chained transaction logs recording every automated AI assertion, state registry response, and officer determination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Table / Timeline Toggle */}
          <div className="flex items-center gap-1 bg-[#F4F6F9] p-1 border border-[#D0D5DD] rounded-[4px]">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[2px] transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#0B1F4B] shadow-xs' : 'text-[#5B6472] hover:text-[#1A1D23]'
              }`}
            >
              <List className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[2px] transition-colors ${
                viewMode === 'timeline' ? 'bg-white text-[#0B1F4B] shadow-xs' : 'text-[#5B6472] hover:text-[#1A1D23]'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Timeline</span>
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="gov-btn gov-btn-primary !text-xs !py-1.5 !px-3 font-semibold"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 border border-[#D0D5DD] rounded-[8px]">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-[#5B6472]" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#1A1D23]">Role:</span>
          <div className="flex items-center gap-1">
            {['ALL', 'OFFICER', 'SYSTEM', 'INSTITUTION', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2 py-0.5 text-xs border rounded-[2px] font-medium transition-colors ${
                  roleFilter === r
                    ? 'bg-[#0B1F4B] text-white border-[#0B1F4B]'
                    : 'bg-white text-[#5B6472] border-[#D0D5DD] hover:bg-gray-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5B6472] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search record, actor, rule applied..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 text-xs border border-[#D0D5DD] rounded-[4px] w-64 focus:outline-none focus:ring-1 focus:ring-[#0B1F4B]"
          />
        </div>
      </div>

      {/* ── VIEW MODE 1: DENSE TABLE ─────────────────────────────────────────── */}
      {viewMode === 'table' ? (
        <div className="gov-card p-0 overflow-hidden rounded-[8px]">
          <div className="overflow-x-auto">
            <table className="gov-table w-full text-left">
              <thead>
                <tr>
                  <th scope="col">Log ID</th>
                  <th scope="col">Timestamp (IST)</th>
                  <th scope="col">Actor & Role</th>
                  <th scope="col">Action Recorded</th>
                  <th scope="col">Target Record</th>
                  <th scope="col">Statutory Rule Applied</th>
                  <th scope="col">Issuing Authority Response</th>
                  <th scope="col">SHA-256 Chained Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap font-mono text-xs font-bold text-[#0B1F4B]">
                      {log.id}
                    </td>
                    <td className="whitespace-nowrap font-mono text-[11px] text-[#5B6472]">
                      {log.formattedTime}
                    </td>
                    <td className="text-xs">
                      <span className="font-semibold text-[#1A1D23] block">{log.actorLabel}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] inline-block mt-0.5 ${
                        log.role === 'OFFICER'
                          ? 'bg-[#F4F6F9] text-[#1F3A7A] border border-[#1F3A7A]'
                          : log.role === 'ADMIN'
                          ? 'bg-[#0B1F4B] text-white'
                          : log.role === 'INSTITUTION'
                          ? 'bg-[#E6F2EA] text-[#1F5E34] border border-[#4C8A62]'
                          : 'bg-gray-100 text-[#5B6472]'
                      }`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap font-mono text-xs font-bold text-[#1A1D23]">
                      {log.action}
                    </td>
                    <td className="whitespace-nowrap font-mono text-xs text-[#1F3A7A]">
                      {log.record}
                    </td>
                    <td className="text-xs text-[#1A1D23] max-w-xs">
                      <p className="text-[11px] leading-relaxed">{log.ruleApplied}</p>
                    </td>
                    <td className="text-xs text-[#5B6472] max-w-sm">
                      <p className="text-[11px] leading-relaxed">{log.sourceResponse}</p>
                    </td>
                    <td className="whitespace-nowrap font-mono text-[10px] text-[#5B6472] truncate max-w-[120px]">
                      {log.hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── VIEW MODE 2: VERTICAL TIMELINE VIEW ────────────────────────────── */
        <div className="gov-card p-6 rounded-[8px] bg-white space-y-6">
          <div className="relative pl-6 border-l-2 border-[#1F3A7A]/30 space-y-6">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Node dot on the timeline */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#0B1F4B] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E07B00]" />
                </div>

                <div className="p-4 bg-[#F8FAFC] border border-[#D0D5DD] rounded-[6px] space-y-2 hover:border-[#0B1F4B] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B1F4B]">{log.id}</span>
                      <span className="font-mono text-xs font-bold text-[#1F3A7A] px-2 py-0.5 rounded-[2px] bg-white border border-[#D0D5DD]">
                        {log.action}
                      </span>
                      <span className="font-mono text-xs text-[#5B6472]">Record: {log.record}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#5B6472]">{log.formattedTime}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] font-mono text-[#5B6472] uppercase block">Actor / Originator</span>
                      <span className="font-semibold text-[#1A1D23]">{log.actorLabel}</span>
                      <span className="text-[10px] font-mono text-[#5B6472] block">Role: {log.role}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#5B6472] uppercase block">Rule / Clause Applied</span>
                      <span className="text-[#1A1D23] font-medium">{log.ruleApplied}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white border border-[#D0D5DD] rounded-[4px] text-xs text-[#5B6472]">
                    <strong className="text-[#0B1F4B]">Authority Response:</strong> {log.sourceResponse}
                  </div>

                  <div className="text-right pt-1">
                    <span className="font-mono text-[10px] text-[#5B6472]">Chained Hash: {log.hash}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
