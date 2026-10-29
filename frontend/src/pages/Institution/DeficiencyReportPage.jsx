import { useParams, Link } from 'react-router-dom'
import { MOCK_APPLICATIONS } from '../../data/mockData.js'
import { Printer, RotateCcw, ArrowLeft, ShieldAlert } from 'lucide-react'

export default function DeficiencyReportPage() {
  const { appId } = useParams()
  const app = MOCK_APPLICATIONS.find((a) => a.applicationId === appId) || MOCK_APPLICATIONS[4]

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden on print) */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D0D5DD] no-print">
        <Link to="/institution" className="gov-btn gov-btn-muted !text-xs">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
          <span>Back to Tracker</span>
        </Link>

        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="gov-btn gov-btn-secondary !text-xs">
            <Printer className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
            <span>Print Official Notice (A4)</span>
          </button>

          <Link to="/institution/documents" className="gov-btn gov-btn-primary !text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
            <span>Correct and Resubmit</span>
          </Link>
        </div>
      </div>

      {/* ── PRINT-READY OFFICIAL GOVERNMENT DEFICIENCY NOTICE (A4 Format) ─────── */}
      <div className="print-page bg-white border border-[#D0D5DD] p-8 max-w-4xl mx-auto space-y-6 shadow-xs font-serif text-[#1A1D23]">
        {/* Government Header */}
        <div className="text-center pb-4 border-b-2 border-black space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0B1F4B]">
            ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
          </p>
          <p className="text-[11px] text-[#5B6472]">
            (A Statutory Body under Ministry of Education, Government of India)
          </p>
          <p className="text-[10px] text-[#5B6472]">
            Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 · Website: www.aicte-india.org
          </p>
          <h1 className="text-base font-bold text-black uppercase pt-2 tracking-wide font-sans">
            FORMAL SCRUTINY DEFICIENCY NOTICE
          </h1>
          <p className="text-xs font-mono font-bold text-[#8F2D2D]">
            F.No. AICTE/AB/SCRUTINY/2026/{app.applicationId} · URGENT REGULATORY SCRUTINY
          </p>
        </div>

        {/* Dispatch Info */}
        <div className="flex justify-between text-xs pt-1 border-b border-gray-200 pb-2 font-sans">
          <div>
            <p><strong>To:</strong> The Principal / Management,</p>
            <p className="font-semibold">{app.institutionName}</p>
            <p className="text-[#5B6472]">Permanent AICTE ID: {app.institutionId}</p>
          </div>
          <div className="text-right">
            <p><strong>Date:</strong> 29 October 2026</p>
            <p><strong>Subject:</strong> Extension of Approval 2026-27</p>
            <p className="text-[#8F2D2D] font-bold">Statutory Response Window: 15 Days</p>
          </div>
        </div>

        {/* Official Body Text */}
        <div className="text-xs space-y-3 leading-relaxed font-sans">
          <p>
            Sir / Madam,
          </p>
          <p>
            With reference to your application <strong>{app.applicationId}</strong> submitted for Extension of Approval (EoA) for Academic Year 2026-27, automated regulatory scrutiny and Error Level Analysis (ELA) conducted under Problem Statement SIH26261 have identified <strong>critical statutory non-compliances and document integrity anomalies</strong>.
          </p>
          <p>
            In accordance with Chapter II & VI of the AICTE Approval Process Handbook 2026-27, the approval process cannot proceed in the presence of unverified claims or suspected document modifications. You are hereby issued this Deficiency Notice.
          </p>
        </div>

        {/* Detailed Flags Table */}
        <div className="space-y-2 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B1F4B]">
            Annexure A: Schedule of Observed Deficiencies & Violated Clauses
          </h2>

          <table className="gov-table !text-xs">
            <thead>
              <tr>
                <th scope="col" className="w-16">Item</th>
                <th scope="col" className="w-48">Violated Handbook Clause</th>
                <th scope="col">Observed Defect & Evidence Analysis</th>
                <th scope="col" className="w-48">Mandatory Action Required</th>
              </tr>
            </thead>
            <tbody>
              {app.findings.map((f, i) => (
                <tr key={f.id}>
                  <td className="font-mono font-bold text-center">{i + 1}</td>
                  <td className="font-semibold text-[#8F2D2D]">{f.clause}</td>
                  <td className="space-y-1">
                    <p className="font-medium text-[#1A1D23]">{f.reason}</p>
                    <p className="text-[11px] font-mono text-[#5B6472] bg-gray-50 p-1 border border-gray-200">
                      Evidence: {f.evidence}
                    </p>
                  </td>
                  <td className="text-[11px] font-medium text-[#0B1F4B]">{f.suggestedFix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simulated Evidence Snapshots Block */}
        <div className="gov-card p-4 bg-[#F8FAFC] border-dashed space-y-2 font-sans">
          <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider block">
            Annexure B: Optical Evidence & Error Level Analysis (ELA) Extracts
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white border border-[#D0D5DD] rounded-[2px] space-y-1">
              <span className="font-bold text-[#8F2D2D] block">1. Land Area Digit Tamper Region</span>
              <p className="text-[11px] text-[#5B6472]">
                Deed Page 3, Coordinate Block (X: 240, Y: 410, W: 180, H: 45). ELA compression sigma variance 4.8. Claimed 4.90 Acres vs Sub-Registrar Book Entry 2.10 Acres.
              </p>
            </div>
            <div className="p-3 bg-white border border-[#D0D5DD] rounded-[2px] space-y-1">
              <span className="font-bold text-[#8F2D2D] block">2. Fire Safety Duplicate Stamp</span>
              <p className="text-[11px] text-[#5B6472]">
                Page 1 Seal Region (X: 420, Y: 680, W: 90, H: 90). Duplicate visual hash matched against 2024 municipal stamp archive with 97.4% geometric confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Signature & Competent Authority Notice */}
        <div className="pt-6 flex justify-between items-end text-xs font-sans border-t border-gray-300">
          <div>
            <p className="text-[11px] text-[#5B6472]">
              Generated by Manyata Regulation Scrutiny Engine
            </p>
            <p className="text-[10px] text-[#5B6472]">
              Tamper verification checksum: <span className="font-mono">8f92a10b4c89e210</span>
            </p>
          </div>

          <div className="text-center space-y-1">
            <div className="w-32 border-b border-black mx-auto mb-1" />
            <p className="font-bold text-[#0B1F4B]">Competent Authority</p>
            <p className="text-[11px] text-[#5B6472]">Regulation Bureau, AICTE New Delhi</p>
          </div>
        </div>
      </div>
    </div>
  )
}
