import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { MOCK_VERIFICATION_SOURCES } from '../../data/mockData.js'
import { Database, CheckCircle2, RefreshCw } from 'lucide-react'

export default function VerificationSources() {
  const breadcrumbs = [{ label: 'Verification Sources' }]

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="border-b border-[#D0D5DD] pb-4">
          <span className="text-xs font-semibold text-[#0B1F4B] uppercase tracking-wider">
            Inter-Departmental Integration
          </span>
          <h1 className="text-2xl font-semibold text-[#0B1F4B] tracking-tight mt-1">
            External Government Verification Sources
          </h1>
          <p className="text-xs text-[#5B6472] mt-1 max-w-3xl leading-relaxed">
            Manyata cross-verifies institutional claims directly against authoritative departmental registries to eliminate forged clearances and outdated certificates.
          </p>
        </div>

        {/* Verification Status Legend */}
        <div className="gov-card p-4 space-y-2">
          <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider block">
            Verification Result Statuses (Standardized Taxonomy)
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <StatusBadge status="VERIFIED" />
            <StatusBadge status="MISMATCH_DETECTED" />
            <StatusBadge status="EXPIRED" />
            <StatusBadge status="VERIFICATION_PENDING" />
            <StatusBadge status="SOURCE_UNAVAILABLE" />
            <StatusBadge status="MANUAL_REVIEW_REQUIRED" />
          </div>
        </div>

        {/* Dense Sources Table */}
        <div className="gov-card p-0 overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th scope="col">Source ID</th>
                <th scope="col">Authority / Registry Name</th>
                <th scope="col">Jurisdiction</th>
                <th scope="col">Verified Attributes</th>
                <th scope="col">API Availability</th>
                <th scope="col">Last Synchronization</th>
                <th scope="col">Current Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_VERIFICATION_SOURCES.map((src) => (
                <tr key={src.id}>
                  <td className="font-mono font-semibold text-[#0B1F4B]">{src.id}</td>
                  <td className="font-medium text-[#1A1D23]">{src.name}</td>
                  <td className="text-[#5B6472]">{src.jurisdiction}</td>
                  <td className="text-xs text-[#5B6472]">
                    <ul className="list-disc pl-4 space-y-0.5 m-0">
                      {src.verifiedAttributes.map((attr, idx) => (
                        <li key={idx}>{attr}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="font-mono text-xs">{src.apiHealth}</td>
                  <td className="font-mono text-xs text-[#5B6472]">{src.lastSync}</td>
                  <td>
                    <StatusBadge status={src.status} size="xs" />
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
