import { useParams, Link } from 'react-router-dom'
import { MOCK_APPLICATIONS } from '../../data/mockData.js'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, Download, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function ClearancePackagePage() {
  const { appId } = useParams()
  const app = MOCK_APPLICATIONS.find((a) => a.applicationId === appId) || MOCK_APPLICATIONS[0]

  function handlePrint() {
    window.print()
  }

  const qrData = `AICTE-CLEARANCE|${app.applicationId}|${app.institutionId}|AY:2026-27|SCORE:${app.trustScore}|STATUS:CLEARED|HASH:8f2a1b9c3d4e`

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D0D5DD] no-print">
        <Link to="/institution" className="gov-btn gov-btn-muted !text-xs">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
          <span>Back to Tracker</span>
        </Link>

        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="gov-btn gov-btn-primary !text-xs">
            <Download className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
            <span>Download Clearance PDF</span>
          </button>
        </div>
      </div>

      {/* ── PRINT-READY CLEARANCE RECOMMENDATION PACKAGE (A4 Format) ────────── */}
      <div className="print-page bg-white border border-[#D0D5DD] p-8 max-w-4xl mx-auto space-y-6 font-serif text-[#1A1D23] shadow-xs">
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
          <h1 className="text-base font-bold text-[#1F5E34] uppercase pt-2 tracking-wide font-sans">
            CLEARANCE RECOMMENDATION DOSSIER · AY 2026-27
          </h1>
          <p className="text-xs font-mono font-bold text-[#0B1F4B]">
            F.No. AICTE/AB/CLEARED/2026/{app.applicationId} · EXTENSION OF APPROVAL
          </p>
        </div>

        {/* Credentials & QR Code Header Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#F8FAFC] border border-[#D0D5DD] font-sans">
          <div className="space-y-1 text-xs">
            <p><strong>Approved Institution:</strong> {app.institutionName}</p>
            <p><strong>Permanent AICTE ID:</strong> <span className="font-mono">{app.institutionId}</span></p>
            <p><strong>Category:</strong> {app.category}</p>
            <p><strong>Composite Trust Score:</strong> <span className="font-mono font-bold text-[#1F5E34]">{app.trustScore} / 100 (CLEARED)</span></p>
            <p><strong>Citizen Charter SLA:</strong> Fast-Track Compliance Cleared</p>
          </div>

          <div className="text-center shrink-0 p-2 bg-white border border-[#D0D5DD] rounded-[2px]">
            <QRCodeSVG value={qrData} size={90} level="M" />
            <span className="text-[9px] font-mono text-[#5B6472] block mt-1">Scan for Digital Verification</span>
          </div>
        </div>

        {/* Compiled Verified Documents Table */}
        <div className="space-y-2 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B1F4B]">
            Schedule of Scrutinized & Authority-Verified Documents
          </h2>

          <table className="gov-table !text-xs">
            <thead>
              <tr>
                <th scope="col" className="w-20">Doc Code</th>
                <th scope="col">Document Title</th>
                <th scope="col">Verified Government Registry</th>
                <th scope="col">Validity Status</th>
                <th scope="col">Result</th>
              </tr>
            </thead>
            <tbody>
              {app.documents.map((d) => (
                <tr key={d.id}>
                  <td className="font-mono font-bold text-[#0B1F4B]">{d.id}</td>
                  <td className="font-medium">{d.name}</td>
                  <td className="text-[#5B6472]">{d.source}</td>
                  <td className="font-mono text-xs">{d.expiry}</td>
                  <td className="font-semibold text-[#1F5E34]">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#138808]" strokeWidth={1.5} />
                      <span>VERIFIED</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Programme Approval Grid */}
        <div className="space-y-2 font-sans text-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B1F4B]">
            Approved Courses & Intake Capacity for Academic Year 2026-27
          </h2>

          <div className="p-3 bg-[#F8FAFC] border border-[#D0D5DD] rounded-[2px] space-y-1">
            {app.programmes.map((p, i) => (
              <div key={i} className="flex items-center justify-between pb-1 border-b border-gray-200 last:border-0">
                <span className="font-medium text-[#1A1D23]">{p}</span>
                <span className="font-mono font-bold text-[#0B1F4B]">Status: Continued</span>
              </div>
            ))}
          </div>
        </div>

        {/* Authority Certification Sign-off */}
        <div className="pt-6 flex justify-between items-end text-xs font-sans border-t border-gray-300">
          <div>
            <p className="text-[11px] text-[#5B6472]">
              Cryptographically signed by Manyata Verification Engine
            </p>
            <p className="text-[10px] text-[#5B6472]">
              Security Certificate ID: <span className="font-mono">AICTE-CERT-2026-992140</span>
            </p>
          </div>

          <div className="text-center space-y-1">
            <div className="w-32 border-b border-black mx-auto mb-1" />
            <p className="font-bold text-[#0B1F4B]">Advisor (Approval Bureau)</p>
            <p className="text-[11px] text-[#5B6472]">AICTE Regulation Directorate, New Delhi</p>
          </div>
        </div>
      </div>
    </div>
  )
}
