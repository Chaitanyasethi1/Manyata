import { useParams, Link } from 'react-router-dom'
import { MOCK_APPLICATIONS } from '../../data/mockData.js'
import TrustScoreBar from '../../components/ui/TrustScoreBar.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { FileText, ArrowLeft, AlertTriangle, ShieldCheck, ExternalLink, Printer } from 'lucide-react'

export default function ValidationReportView() {
  const { appId } = useParams()
  const app = MOCK_APPLICATIONS.find((a) => a.applicationId === appId) || MOCK_APPLICATIONS[4] // default to 0005 for rich findings

  const isCapped = app.status === 'DEFICIENT' && app.trustScore < 50
  const capReason = 'Score mathematically capped at 49 due to critical tamper indicators (seal duplication / area alteration).'

  return (
    <div className="space-y-6">
      {/* Top Action & Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D0D5DD] gap-2">
        <div className="flex items-center gap-3">
          <Link to="/institution" className="gov-btn gov-btn-muted !text-xs !py-1 !px-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
            <span>Tracker</span>
          </Link>

          <div>
            <span className="text-[11px] font-mono text-[#5B6472] uppercase font-bold">
              AICTE Regulation Scrutiny Report
            </span>
            <h2 className="text-base font-semibold text-[#0B1F4B]">
              Dossier: {app.applicationId} · {app.institutionName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {app.status === 'DEFICIENT' && (
            <Link to={`/institution/deficiency/${app.applicationId}`} className="gov-btn gov-btn-danger !text-xs">
              <span>View Formal Deficiency Notice</span>
            </Link>
          )}

          {app.status === 'CLEARED' && (
            <Link to={`/institution/clearance/${app.applicationId}`} className="gov-btn gov-btn-primary !text-xs">
              <span>Download Clearance Package</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── OVERALL TRUST SCORE WITH HORIZONTAL BAR (50 and 75 THRESHOLDS) ── */}
      <TrustScoreBar score={app.trustScore} isCapped={isCapped} capReason={capReason} />

      {/* ── WEIGHTED SUB-SCORES TABLE ───────────────────────────────────────── */}
      <div className="gov-card p-0 overflow-hidden">
        <div className="p-3 bg-[#F8FAFC] border-b border-[#D0D5DD]">
          <h3 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider">
            Weighted Evaluation Sub-Scores Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th scope="col">Evaluation Module</th>
                <th scope="col">Weightage</th>
                <th scope="col">Evaluated Sub-Score</th>
                <th scope="col">Norm Basis</th>
                <th scope="col">Evaluation Summary</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold text-[#1A1D23]">Document Authenticity & Registry Cross-Check</td>
                <td className="font-mono text-xs">35%</td>
                <td className="font-mono font-bold text-xs text-[#0B1F4B]">{app.subScores.authenticity} / 100</td>
                <td className="text-xs text-[#5B6472]">State Land Bhoomi, Fire Services, MCA21 API</td>
                <td className="text-xs text-[#5B6472]">
                  {app.subScores.authenticity >= 75
                    ? 'All external authorities confirmed certificate numbers and validity.'
                    : 'Land deed or Fire NOC attributes mismatched against revenue registry.'}
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-[#1A1D23]">Image Integrity & Forgery Analysis (ELA)</td>
                <td className="font-mono text-xs">35%</td>
                <td className="font-mono font-bold text-xs text-[#0B1F4B]">{app.subScores.forgeryAnalysis} / 100</td>
                <td className="text-xs text-[#5B6472]">ELA compression variance, SIFT seal duplication hash</td>
                <td className="text-xs text-[#5B6472]">
                  {app.subScores.forgeryAnalysis >= 75
                    ? 'Zero compression anomalies; uniform pixel noise distribution.'
                    : 'Compression spikes detected on numerical survey boundaries and duplicate stamps.'}
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-[#1A1D23]">Approval Process Handbook Regulatory Compliance</td>
                <td className="font-mono text-xs">30%</td>
                <td className="font-mono font-bold text-xs text-[#0B1F4B]">{app.subScores.compliance} / 100</td>
                <td className="text-xs text-[#5B6472]">AICTE Handbook 2026-27 Chapters II to VI</td>
                <td className="text-xs text-[#5B6472]">
                  {app.subScores.compliance >= 75
                    ? 'Student-to-Faculty Ratio (SFR) and land acreage meet mandatory norms.'
                    : 'Student-to-Faculty Ratio or land acreage violates statutory threshold.'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FINDINGS LIST ──────────────────────────────────────────────────── */}
      <div className="gov-card p-5 space-y-4">
        <div className="pb-2 border-b border-[#D0D5DD] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0B1F4B] uppercase tracking-wider">
            Detailed Audit Findings & Statutory Clause References ({app.findings.length})
          </h3>
          <span className="text-xs text-[#5B6472]">Actionable Rectification Guidance</span>
        </div>

        {app.findings.length === 0 ? (
          <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] text-[#1F5E34] text-xs rounded-[2px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#138808]" strokeWidth={1.5} />
            <span>Zero statutory defects or integrity anomalies identified. Application conforms to all criteria.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {app.findings.map((f) => {
              const isCrit = f.severity === 'CRITICAL'
              return (
                <div
                  key={f.id}
                  className={`p-4 rounded-[2px] border text-xs space-y-2 ${
                    isCrit ? 'bg-[#FDF2F2] border-[#F6B8B8]' : 'bg-[#FFFBEB] border-[#FDE68A]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded-[2px] font-mono font-bold text-[10px] ${
                          isCrit ? 'bg-[#8F2D2D] text-white' : 'bg-[#8A5A0B] text-white'
                        }`}
                      >
                        {f.severity}
                      </span>
                      <span className="font-bold text-[#1A1D23]">{f.category}</span>
                      <span className="text-[#5B6472]">({f.id})</span>
                    </div>

                    <span className="font-mono text-[11px] text-[#0B1F4B] font-semibold">
                      {f.clause}
                    </span>
                  </div>

                  <p className="text-[#1A1D23] font-medium leading-relaxed">
                    <strong>Defect Observed:</strong> {f.reason}
                  </p>

                  <div className="p-2 bg-white/70 border border-black/10 rounded-[2px] text-[11px] text-[#5B6472] font-mono">
                    <strong>Evidence Extract:</strong> {f.evidence}
                  </div>

                  <div className="text-[11px] text-[#1A1D23] bg-white p-2 border border-black/10 rounded-[2px]">
                    <strong className="text-[#0B1F4B]">Suggested Regulatory Fix:</strong> {f.suggestedFix}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
