import { useState } from 'react'
import { Download, Filter, Search, History, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { mockAuditLogs } from '../../data/mockData.js'

export default function AdminAuditTrail() {
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Enhanced audit log entries with the required fields:
  // (timestamp, actor, role, action, record, rule applied, source response)
  const auditEntries = [
    {
      id: 'AUD-99120',
      timestamp: '2026-10-29T16:15:22+05:30',
      formattedTime: '29-Oct-2026 16:15:22 IST',
      actor: 'officer:ramanathan (Joint Director)',
      role: 'OFFICER',
      action: 'RECORD_SCRUTINY_DECISION',
      record: 'AICTE-2026-0002',
      ruleApplied: 'APH 2026 Clause 4.3.2(b) [Fire NOC Discrepancy]',
      sourceResponse: 'KSFES API: Expiry 28-Oct-2026 mismatch with 28-Nov-2026 on doc',
      hash: 'sha256:7a9f8b...3c1e',
    },
    {
      id: 'AUD-99119',
      timestamp: '2026-10-29T15:50:11+05:30',
      formattedTime: '29-Oct-2026 15:50:11 IST',
      actor: 'system:verification-engine (Worker #4)',
      role: 'SYSTEM',
      action: 'CROSS_REGISTRY_QUERY',
      record: 'AICTE-2026-0002',
      ruleApplied: 'APH 2026 § 2.1.4 [Bhoomi Land Revenue Demarcation]',
      sourceResponse: 'Bhoomi Karnataka Gateway: Survey 42/1 matched 3.42 Acres',
      hash: 'sha256:1b2c3d...9f8e',
    },
    {
      id: 'AUD-99118',
      timestamp: '2026-10-29T15:45:00+05:30',
      formattedTime: '29-Oct-2026 15:45:00 IST',
      actor: 'system:ai-ocr-pipeline',
      role: 'SYSTEM',
      action: 'FEATURE_EXTRACTION_COMPLETE',
      record: 'AICTE-2026-0002',
      ruleApplied: 'Smart Automation Model v2.4 [Table Extraction]',
      sourceResponse: 'Extracted 18 fields across 4 documents with 98.2% avg confidence',
      hash: 'sha256:4d5e6f...8a7b',
    },
    {
      id: 'AUD-99117',
      timestamp: '2026-10-29T14:10:04+05:30',
      formattedTime: '29-Oct-2026 14:10:04 IST',
      actor: 'institution:greenfield_polytechnic',
      role: 'INSTITUTION',
      action: 'APPLICATION_SUBMITTED',
      record: 'AICTE-2026-0002',
      ruleApplied: 'AICTE EoA Schedule 2026-27 Stage 1 Intake',
      sourceResponse: 'Payload integrity SHA-256 verified; 4 PDFs received',
      hash: 'sha256:9c8b7a...1d2e',
    },
    {
      id: 'AUD-99116',
      timestamp: '2026-10-29T11:20:18+05:30',
      formattedTime: '29-Oct-2026 11:20:18 IST',
      actor: 'system:deficiency-generator',
      role: 'SYSTEM',
      action: 'DEFICIENCY_NOTICE_COMPILED',
      record: 'AICTE-2026-0005',
      ruleApplied: 'APH 2026 Clause 4.2.1 [FAR & Land Title Non-compliance]',
      sourceResponse: 'Score capped at 38/100; Formal notice dispatched to applicant inbox',
      hash: 'sha256:3e2d1c...5b6a',
    },
    {
      id: 'AUD-99115',
      timestamp: '2026-10-28T19:40:55+05:30',
      formattedTime: '28-Oct-2026 19:40:55 IST',
      actor: 'admin:dr_aniruddha_roy',
      role: 'ADMIN',
      action: 'SYSTEM_THRESHOLD_CONFIG',
      record: 'SYS_POLICY_2026_01',
      ruleApplied: 'National Automation Governance Directive',
      sourceResponse: 'Capping rule active: Deficient threshold 50, Cleared 75',
      hash: 'sha256:8f9e0a...2b3c',
    },
    {
      id: 'AUD-99114',
      timestamp: '2026-10-28T17:15:30+05:30',
      formattedTime: '28-Oct-2026 17:15:30 IST',
      actor: 'system:clearance-engine',
      role: 'SYSTEM',
      action: 'CLEARANCE_PACKAGE_ISSUED',
      record: 'AICTE-2026-0001',
      ruleApplied: 'APH 2026 Fast-Track Auto-Clearance (Score 91 >= 75)',
      sourceResponse: 'Digital QR seal generated; Sent to apex_institute@portal.edu',
      hash: 'sha256:6a7b8c...4d5e',
    },
  ]

  const filteredLogs = auditEntries.filter((log) => {
    const matchesSearch =
      log.record.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      `"${l.actor}"`,
      l.role,
      l.action,
      l.record,
      `"${l.ruleApplied}"`,
      `"${l.sourceResponse.replace(/"/g, '""')}"`,
      l.hash,
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
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
      {/* Notice Banner */}
      <div className="bg-[#F4F6F9] border-l-4 border-[#0B1F4B] p-4 text-xs text-[#1A1D23] flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-[#0B1F4B]">
            Statutory Immutable Audit Trail & Decision Lineage
          </p>
          <p className="text-[#5B6472]">
            Every regulatory scrutiny action, automated query to issuing authorities, and decision determination is permanently logged with actor identities, rules applied, and cryptographic SHA-256 hashes to guarantee non-repudiation under the IT Act 2000.
          </p>
        </div>
        <div className="text-right text-[11px] text-[#5B6472] font-mono shrink-0 pl-4">
          Chained Logs: Active
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 border border-[#D0D5DD] rounded-[4px]">
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

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5B6472] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search record, actor, rule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-[#D0D5DD] rounded-[2px] w-56 focus:outline-none focus:ring-1 focus:ring-[#0B1F4B]"
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#0B1F4B] text-white text-xs font-medium rounded-[2px] hover:bg-[#1F3A7A] transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Dense Audit Trail Table */}
      <div className="bg-white border border-[#D0D5DD] rounded-[4px] overflow-hidden">
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
                    <span className="font-semibold text-[#1A1D23] block">{log.actor}</span>
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
                  <td className="whitespace-nowrap font-mono text-[10px] text-[#5B6472]">
                    {log.hash}
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
