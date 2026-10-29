import { useParams, Link } from 'react-router-dom'
import { MOCK_APPLICATIONS } from '../../data/mockData.js'
import TrustScoreGauge from '../../components/ui/TrustScoreGauge.jsx'
import TrustScoreBar from '../../components/ui/TrustScoreBar.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { FileText, ArrowLeft, AlertTriangle, ShieldCheck, ExternalLink, Printer, CheckCircle2 } from 'lucide-react'

export default function ValidationReportView() {
  const { appId } = useParams()
  const app = MOCK_APPLICATIONS.find((a) => a.applicationId === appId) || MOCK_APPLICATIONS[1] // fallback to AICTE-2026-0002

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
              Dossier: <span className="font-mono">{app.applicationId}</span> · {app.institutionName}
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

      {/* ── 2-COLUMN GAUGE + WEIGHTED SUB-SCORES BREAKDOWN ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (4 cols): Semi-Circular Gauge Visual */}
        <div className="lg:col-span-4 gov-card p-6 rounded-[8px] flex flex-col justify-between items-center text-center bg-white">
          <div className="w-full">
            <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider block mb-1">
              Evaluated Trust Score
            </span>
            <p className="text-[11px] text-[#5B6472] mb-4">
              Composite score computed by Manyata Decision-Support Engine
            </p>

            <TrustScoreGauge score={app.trustScore} isCapped={isCapped} size={220} />
          </div>

          <div className="w-full mt-4 pt-3 border-t border-[#D0D5DD] text-[11px] text-[#5B6472]">
            <span>Decision Route: </span>
            <strong className="text-[#0B1F4B]">{app.route}</strong>
          </div>
        </div>

        {/* Right Column (8 cols): Sub-Score Table with Inline Progress Bars */}
        <div className="lg:col-span-8 gov-card p-5 rounded-[8px] space-y-4 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#D0D5DD]">
              <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider">
                Weighted Evaluation Sub-Scores Breakdown
              </span>
              <span className="text-[11px] font-mono text-[#5B6472]">3 Modules</span>
            </div>

            <div className="space-y-4 pt-3">
              {[
                {
                  label: 'Document Authenticity & Registry Cross-Check',
                  weight: '35%',
                  score: app.subScores?.authenticity ?? 85,
                  basis: 'State Land Bhoomi, Fire Services, MCA21 API',
                  desc: 'Cross-verifies claims extracted from certificate texts against official state registries.',
                },
                {
                  label: 'Image Integrity & Forgery Analysis (ELA)',
                  weight: '35%',
                  score: app.subScores?.forgeryAnalysis ?? 80,
                  basis: 'Error Level Analysis (ELA) variance, seal keypoint hash',
                  desc: 'Detects pixel compression spikes on validity dates and duplicate notary stamps.',
                },
                {
                  label: 'AICTE Handbook Regulatory Compliance',
                  weight: '30%',
                  score: app.subScores?.compliance ?? 78,
                  basis: 'AICTE Handbook 2026-27 Chapters II to VI',
                  desc: 'Scrutinizes Floor Area Ratio (FAR), cadre balance, and laboratory norms.',
                },
              ].map((m, idx) => (
                <div key={idx} className="space-y-1.5 p-3 bg-[#F4F6F9] rounded-[4px] border border-[#D0D5DD]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <span className="font-semibold text-[#0B1F4B]">{m.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#5B6472]">Weight: {m.weight}</span>
                      <span className="font-mono font-bold text-xs text-[#0B1F4B]">{m.score} / 100</span>
                    </div>
                  </div>

                  {/* Inline Progress Bar */}
                  <div className="w-full bg-gray-200 h-2 rounded-[2px] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        m.score >= 75 ? 'bg-[#1F5E34]' : m.score >= 50 ? 'bg-[#C99A3A]' : 'bg-[#8F2D2D]'
                      }`}
                      style={{ width: `${m.score}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-[#5B6472]">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] border-l-4 border-[#0B1F4B] text-[11px] text-[#5B6472] rounded-[2px]">
            <strong className="text-[#0B1F4B]">Regulatory Rule 12(3):</strong> If a critical anomaly (forgery indicator or duplicate seal) exists, composite score is capped at 49 regardless of weighted sub-score sum.
          </div>
        </div>
      </div>

      {/* ── FINDINGS LIST LINKED TO CLAUSES ──────────────────────────────────── */}
      <div className="gov-card p-5 rounded-[8px] space-y-4 bg-white">
        <div className="flex items-center justify-between pb-2 border-b border-[#D0D5DD]">
          <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider">
            Detailed Scrutiny Findings & Violated Clauses
          </span>
          <span className="text-[11px] font-mono text-[#5B6472]">
            {app.findings ? app.findings.length : 0} Findings Logged
          </span>
        </div>

        <div className="space-y-3">
          {(!app.findings || app.findings.length === 0) ? (
            <div className="p-4 bg-[#E6F2EA] text-[#1F5E34] border border-[#4C8A62] rounded-[4px] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero statutory anomalies found. Application eligible for automated clearance.</span>
            </div>
          ) : (
            app.findings.map((f, i) => (
              <div
                key={i}
                className={`p-4 rounded-[4px] border space-y-1.5 ${
                  f.severity === 'CRITICAL' || f.severity === 'HIGH'
                    ? 'bg-[#F6E7E7]/40 border-[#B85C5C]'
                    : f.severity === 'MEDIUM' || f.severity === 'MAJOR'
                    ? 'bg-[#FBF3DC]/60 border-[#C99A3A]'
                    : 'bg-[#F4F6F9] border-[#D0D5DD]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0B1F4B]">{f.id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-[2px] ${
                    f.severity === 'CRITICAL' || f.severity === 'HIGH'
                      ? 'bg-[#F6E7E7] text-[#8F2D2D] border border-[#B85C5C]'
                      : 'bg-[#FBF3DC] text-[#8A5A0B] border border-[#C99A3A]'
                  }`}>
                    {f.severity}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#1A1D23]">{f.reason}</p>
                <p className="text-[11px] font-mono text-[#1F3A7A]">{f.clause}</p>

                <div className="p-2 bg-white border border-[#D0D5DD] rounded-[2px] text-[11px] text-[#5B6472]">
                  <strong>Evidence Extract:</strong> {f.evidence}
                </div>

                <p className="text-[11px] text-[#1A1D23]">
                  <strong>Suggested Fix:</strong> {f.suggestedFix}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
