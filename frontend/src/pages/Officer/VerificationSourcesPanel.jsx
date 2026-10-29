import { useState } from 'react'
import { Database, RefreshCw, CheckCircle2, AlertTriangle, Clock, Server, ShieldCheck, ExternalLink, Filter } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { mockVerificationSources } from '../../data/mockData.js'

export default function VerificationSourcesPanel() {
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState('29-Oct-2026 16:30 IST')

  const sources = [
    {
      id: 'SRC-01',
      name: 'UGC / AICTE Central Institutional Master Registry',
      agency: 'University Grants Commission & AICTE',
      type: 'Direct API · REST / JSON',
      endpoint: 'https://api.ugc.ac.in/v2/institutions/verify',
      latency: '180ms',
      lastSync: '29-Oct-2026 16:28:10 IST',
      status: 'VERIFIED',
      uptime: '99.98%',
      attributes: 'Permanent Institute ID, Trust / Society Name, Approved Courses, Intake Cap',
      fallbackSOP: 'Check offline master CSV backup updated every 24 hours at 00:00 IST.',
    },
    {
      id: 'SRC-02',
      name: 'State Fire & Emergency Services Registry (KSFES / DFS / MFS)',
      agency: 'Directorate General of Fire Services (Multi-state Gateway)',
      type: 'Federated Webhook · National Disaster Management Gateway',
      endpoint: 'https://firesafety.gov.in/api/v1/noc/validate',
      latency: '410ms',
      lastSync: '29-Oct-2026 16:15:44 IST',
      status: 'MISMATCH_DETECTED',
      uptime: '98.40%',
      attributes: 'NOC Number, Issue Date, Validity End Date, Plinth Area, Max Floor Height',
      fallbackSOP: 'Send physical verification memo to District Fire Officer via Regional Bureau.',
    },
    {
      id: 'SRC-03',
      name: 'Bhoomi / National Land Records Modernization Registry (NLRMP)',
      agency: 'Department of Land Resources · Ministry of Rural Development',
      type: 'State API Gateway · Bhoomi / Bhulekh / Meebhoomi',
      endpoint: 'https://landrecords.gov.in/api/v3/survey/extract',
      latency: '620ms',
      lastSync: '29-Oct-2026 15:50:12 IST',
      status: 'VERIFIED',
      uptime: '97.80%',
      attributes: 'Survey Number, Khata Extent (Acres/Guntas), Title Owner, Conversion Status',
      fallbackSOP: 'Demand Certified RTC and 30-year Encumbrance Certificate signed by Tahsildar.',
    },
    {
      id: 'SRC-04',
      name: 'Town & Country Planning / Municipal Plan Sanction DB',
      agency: 'Directorate of Town & Country Planning (DTCP / BBMP / DDA)',
      type: 'e-Naksha / Online Building Plan Approval System',
      endpoint: 'https://dtcp.gov.in/api/plans/sanctioned-roster',
      latency: '340ms',
      lastSync: '29-Oct-2026 16:02:18 IST',
      status: 'MANUAL_REVIEW_REQUIRED',
      uptime: '99.10%',
      attributes: 'Sanction Plan Drawing Hash, Approved Built-up Area, FAR / FSI, Road Width',
      fallbackSOP: 'Constitute Local Inspection Committee (LIC) for on-site physical measurement.',
    },
    {
      id: 'SRC-05',
      name: 'National Academic Depository (NAD / DigiLocker Registry)',
      agency: 'Ministry of Electronics and Information Technology (MeitY)',
      type: 'DigiLocker Issuer / DocExchange API',
      endpoint: 'https://nad.digitallocker.gov.in/public/api/v2/cert',
      latency: '120ms',
      lastSync: '29-Oct-2026 16:29:55 IST',
      status: 'VERIFIED',
      uptime: '99.99%',
      attributes: 'Principal & Faculty PhD Degrees, University Affiliation Letters, NBA Accreditations',
      fallbackSOP: 'Query Affiliating University Registrar via official NIC government email.',
    },
    {
      id: 'SRC-06',
      name: 'Central Board of Direct Taxes (CBDT) PAN & 12A/80G Registry',
      agency: 'Income Tax Department · Ministry of Finance',
      type: 'TIN-NSDL PAN Verification API',
      endpoint: 'https://incometax.gov.in/api/pan/v1/status',
      latency: '95ms',
      lastSync: '29-Oct-2026 16:25:01 IST',
      status: 'VERIFIED',
      uptime: '99.95%',
      attributes: 'Society / Trust PAN, 12A Non-profit Exemption, Active Filing Status',
      fallbackSOP: 'Inspect Form 10B audit report filed on IT Portal.',
    },
    {
      id: 'SRC-07',
      name: 'Ministry of Corporate Affairs (MCA21 v3 Portal)',
      agency: 'Ministry of Corporate Affairs',
      type: 'MCA21 e-Governance API',
      endpoint: 'https://mca.gov.in/api/v2/companies/master-data',
      latency: '1450ms',
      lastSync: '29-Oct-2026 14:12:00 IST',
      status: 'SOURCE_UNAVAILABLE',
      uptime: '91.20%',
      attributes: 'CIN / LLPIN, Registered Office Address, Director / Trustee Identification (DIN)',
      fallbackSOP: 'Officer must request physical certified copy of Trust Deed / MoA under seal.',
    },
    {
      id: 'SRC-08',
      name: 'State University Affiliation Batch Verification Gateway',
      agency: 'Council of State Higher Education Boards',
      type: 'Scheduled SFTP Batch Reconciliation',
      endpoint: 'sftp://univ-gateway.nic.in/aicte/inbound/vtu',
      latency: 'Batch',
      lastSync: '29-Oct-2026 06:00:00 IST',
      status: 'VERIFICATION_PENDING',
      uptime: '99.00%',
      attributes: 'Academic Year Affiliation Order, Sanctioned Intake, Nominee Notifications',
      fallbackSOP: 'Reconciliation occurs every 12 hours. Check next run at 18:00 IST.',
    },
  ]

  const filteredSources = sources.filter(s => {
    if (filterStatus === 'ALL') return true
    return s.status === filterStatus
  })

  function handleRefresh() {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastRefreshed(new Date().toLocaleString('en-IN') + ' IST')
    }, 800)
  }

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-[#F4F6F9] border-l-4 border-[#0B1F4B] p-4 text-xs text-[#1A1D23] flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-[#0B1F4B]">
            Automated Cross-Verification Infrastructure
          </p>
          <p className="text-[#5B6472]">
            Manyata interfaces with eight official central and state government databases to cross-verify claims extracted from uploaded applicant certificates. When external sources report discrepancies or become unavailable, strict fallback Standard Operating Procedures (SOPs) are activated.
          </p>
        </div>
        <div className="text-right text-[11px] text-[#5B6472] font-mono shrink-0 pl-4">
          Protocol: GIGW-API-v3
        </div>
      </div>

      {/* KPI Header Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Connected Registries</span>
          <span className="text-2xl font-semibold text-[#0B1F4B]">{sources.length} Gateways</span>
          <span className="text-[11px] text-[#1F5E34] block mt-0.5">7 Online · 1 Intermittent</span>
        </div>

        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Auto-Reconciled</span>
          <span className="text-2xl font-semibold text-[#1F5E34]">
            {sources.filter(s => s.status === 'VERIFIED').length}
          </span>
          <span className="text-[11px] text-[#1F5E34] block mt-0.5">High confidence matches</span>
        </div>

        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Mismatch / Flags Detected</span>
          <span className="text-2xl font-semibold text-[#8A5A0B]">
            {sources.filter(s => s.status === 'MISMATCH_DETECTED').length}
          </span>
          <span className="text-[11px] text-[#8A5A0B] block mt-0.5">Requires manual scrutiny</span>
        </div>

        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Avg Network Latency</span>
          <span className="text-2xl font-semibold text-[#0B1F4B]">245 ms</span>
          <span className="text-[11px] text-[#5B6472] block mt-0.5">Target SLA &lt; 1000ms</span>
        </div>
      </div>

      {/* Filter and Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-[#D0D5DD] rounded-[4px]">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-[#5B6472]" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#1A1D23]">Filter Status:</span>
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'ALL', label: 'All Gateways (8)' },
              { id: 'VERIFIED', label: 'Verified (4)' },
              { id: 'MISMATCH_DETECTED', label: 'Mismatch Detected (1)' },
              { id: 'SOURCE_UNAVAILABLE', label: 'Unavailable / Offline (1)' },
              { id: 'MANUAL_REVIEW_REQUIRED', label: 'Manual Review (1)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-2.5 py-1 text-xs border rounded-[2px] font-medium transition-colors ${
                  filterStatus === f.id
                    ? 'bg-[#0B1F4B] text-white border-[#0B1F4B]'
                    : 'bg-white text-[#5B6472] border-[#D0D5DD] hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#5B6472] font-mono">
            Synced: {lastRefreshed}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 text-xs border border-[#D0D5DD] rounded-[2px] bg-white text-[#0B1F4B] hover:bg-gray-50 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            <span>Poll Health</span>
          </button>
        </div>
      </div>

      {/* Dense Sources Table */}
      <div className="bg-white border border-[#D0D5DD] rounded-[4px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gov-table w-full text-left">
            <thead>
              <tr>
                <th scope="col">Source ID & Name</th>
                <th scope="col">Nodal Agency & Protocol</th>
                <th scope="col">Reconciled Attributes</th>
                <th scope="col">Latency</th>
                <th scope="col">Last Synced Timestamp</th>
                <th scope="col">Current Result Status</th>
                <th scope="col">Officer Fallback SOP</th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.map((s) => (
                <tr key={s.id}>
                  <td className="whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-[#0B1F4B] block">{s.id}</span>
                    <span className="font-semibold text-xs text-[#1A1D23]">{s.name}</span>
                    <span className="font-mono text-[10px] text-[#5B6472] block truncate max-w-xs">{s.endpoint}</span>
                  </td>
                  <td className="text-xs text-[#5B6472]">
                    <p className="font-medium text-[#1A1D23]">{s.agency}</p>
                    <span className="font-mono text-[11px]">{s.type}</span>
                  </td>
                  <td className="text-xs text-[#5B6472] max-w-xs">
                    <p className="text-[11px] leading-relaxed">{s.attributes}</p>
                  </td>
                  <td className="font-mono text-xs whitespace-nowrap text-[#1A1D23]">
                    {s.latency}
                  </td>
                  <td className="font-mono text-xs whitespace-nowrap text-[#5B6472]">
                    {s.lastSync}
                  </td>
                  <td className="whitespace-nowrap">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="text-xs text-[#1F3A7A] max-w-xs">
                    <p className="text-[11px] leading-relaxed">{s.fallbackSOP}</p>
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
