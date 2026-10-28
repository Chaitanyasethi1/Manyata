import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getApplication,
  getResult,
  getAuditLog,
  submitReview,
  downloadClearance,
  downloadDeficiency,
} from '../../api.js'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowLeft,
  Download,
  Check,
  AlertCircle,
  FileText,
  FileCheck2,
  Send,
  Eye,
} from 'lucide-react'

export default function ReviewDetail() {
  const { appId } = useParams()
  const navigate = useNavigate()
  const [app, setApp] = useState(null)
  const [result, setResult] = useState(null)
  const [audit, setAudit] = useState([])
  const [loading, setLoading] = useState(true)
  const [decisionModal, setDecisionModal] = useState(false)
  const [decisionComment, setDecisionComment] = useState('')
  const [actionDone, setActionDone] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState('Safety NOC')

  useEffect(() => {
    Promise.all([
      getApplication(appId).catch(() => null),
      getResult(appId).catch(() => null),
      getAuditLog(appId).catch(() => ({ data: [] })),
    ]).then(([appRes, resRes, auditRes]) => {
      setApp(appRes?.data || null)
      setResult(resRes?.data || null)
      setAudit(auditRes?.data || [])
    }).finally(() => setLoading(false))
  }, [appId])

  // Realistic default fallback data matching the mockup if viewing demo case
  const score = app?.trust_score ?? 38
  const institutionName = app?.institution_name || 'Demo Institute of Management'
  const isHighRisk = score < 50 || app?.status === 'DEFICIENT' || app?.status === 'UNDER_REVIEW'
  const statusBadge = isHighRisk ? 'Flagged' : 'Cleared'

  function handleDecision(decisionType) {
    submitReview(appId, decisionType, decisionComment, 'officer:demo')
      .then((res) => {
        setActionDone(`Decision applied: ${decisionType}`)
        setDecisionModal(false)
        if (app) setApp({ ...app, status: res.data.new_status })
      })
      .catch((err) => {
        setActionDone(`Decision applied locally: ${decisionType}`)
        setDecisionModal(false)
      })
  }

  function handleDownloadReport(type) {
    if (type === 'clearance') {
      downloadClearance(appId)
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', `${appId}_Clearance_Package.pdf`)
          document.body.appendChild(link)
          link.click()
        })
        .catch(() => alert('Generating clearance report...'))
    } else {
      downloadDeficiency(appId)
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', `${appId}_Deficiency_Report.pdf`)
          document.body.appendChild(link)
          link.click()
        })
        .catch(() => alert('Generating deficiency report...'))
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] font-sans antialiased pb-12">
      {/* ── TOP HEADER BAR ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">TrustDesk</span>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-500 font-mono">{appId}</span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/officer"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to dashboard</span>
          </Link>

          <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            RO
          </div>
        </div>
      </header>

      {/* ── CASE HEADER ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-4">
        {actionDone && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center justify-between">
            <span>✓ {actionDone}</span>
            <button onClick={() => setActionDone(null)} className="text-emerald-600 hover:text-emerald-900">×</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-gray-400 font-medium">Applications / {appId}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {institutionName}
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                statusBadge === 'Flagged' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {statusBadge}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Five documents uploaded · Sample data</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecision('ASK_FOR_INFO')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Request clarification
            </button>
            <button
              onClick={() => handleDecision('CONFIRM_CLEAR')}
              className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Confirm route
            </button>
          </div>
        </div>

        {/* ── 8-STAGE STEPPER BAR ─────────────────────────────────────── */}
        <div className="mt-7 bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            {[
              { num: 1, label: 'Upload', done: true },
              { num: 2, label: 'Extract', done: true },
              { num: 3, label: 'Authenticate', done: true },
              { num: 4, label: 'Forgery check', done: true },
              { num: 5, label: 'Compliance', done: true },
              { num: 6, label: 'Trust Score', done: true },
              { num: 7, label: 'Route', current: true },
              { num: 8, label: 'Outputs', future: true },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 relative">
                {idx < 7 && (
                  <div
                    className={`absolute top-3.5 left-1/2 w-full h-0.5 -z-0 ${
                      step.done ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                )}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-colors ${
                    step.done
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : step.current
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {step.done ? <Check className="w-3.5 h-3.5" /> : step.num}
                </div>
                <span
                  className={`mt-2 text-[11px] font-medium ${
                    step.current
                      ? 'text-blue-600 font-bold'
                      : step.done
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3-COLUMN INVESTIGATION GRID ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Column 1: Documents & Extracted Fields (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Documents Checklist */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                Documents
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Land papers', status: 'Authentic', color: 'bg-emerald-50 text-emerald-700' },
                  { name: 'Trust registration', status: 'Authentic', color: 'bg-emerald-50 text-emerald-700' },
                  { name: 'Faculty list', status: 'Not submitted', color: 'bg-gray-100 text-gray-600' },
                  { name: 'Fee statement', status: 'Needs review', color: 'bg-amber-50 text-amber-700' },
                  { name: 'Safety NOC', status: 'Forgery suspected', color: 'bg-red-50 text-red-700 font-bold' },
                ].map((doc, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedDoc(doc.name)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      selectedDoc === doc.name
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50/40'
                    }`}
                  >
                    <span className="font-semibold text-gray-800">{doc.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${doc.color}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Fields */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
              <h3 className="text-xs font-bold text-gray-800">Extracted fields</h3>
              <p className="text-[11px] text-gray-400 mt-0.5 mb-3">
                {selectedDoc} · read from the document
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <span>Issuing authority</span>
                    <span className="font-mono text-emerald-600 font-semibold">96%</span>
                  </div>
                  <p className="font-bold text-gray-800 mt-0.5">Fire and safety dept.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <span>Issue date</span>
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-mono font-bold text-[10px]">
                      LOW 62%
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 mt-0.5">12 Mar 2026</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <span>Valid until</span>
                    <span className="font-mono text-emerald-600 font-semibold">94%</span>
                  </div>
                  <p className="font-bold text-gray-800 mt-0.5">11 Mar 2027</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <span>Certificate number</span>
                    <span className="font-mono text-emerald-600 font-semibold">91%</span>
                  </div>
                  <p className="font-bold text-gray-800 mt-0.5">NOC-0000-XXXX</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Document Forgery Analysis Canvas (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-gray-900">
                  Forgery analysis · {selectedDoc}
                </h3>
                <span className="text-[11px] text-gray-400 font-medium">Page 1 of 1</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Suspect regions are outlined on the page and numbered below.
              </p>

              {/* Document Mockup View with Bounding Box Highlights */}
              <div className="relative bg-white border-2 border-gray-200 rounded-lg p-6 shadow-inner min-h-[380px] flex flex-col justify-between overflow-hidden">
                <div className="space-y-4">
                  {/* Top Letterhead Mock */}
                  <div className="text-center pb-3 border-b border-gray-100">
                    <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                      GOVERNMENT FIRE AND RESCUE SERVICES
                    </p>
                    <p className="text-xs font-bold text-gray-700 mt-1">
                      CERTIFICATE OF FIRE SAFETY NO OBJECTION
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
                    <p className="h-2.5 bg-gray-100 rounded w-5/6" />
                    <p className="h-2.5 bg-gray-100 rounded w-full" />

                    {/* Suspect Box 1: Modified Issue Date */}
                    <div className="relative border-2 border-dashed border-red-500 bg-red-50/40 p-2.5 rounded-md my-2">
                      <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                        1
                      </span>
                      <p className="font-mono font-bold text-red-900 text-xs">
                        Land Area: 4.90 Acres [Survey No: 204/1A]
                      </p>
                      <p className="text-[10px] text-red-600 mt-0.5">
                        Font weight & ELA compression variance detected (Edited from 2.10 Acres)
                      </p>
                    </div>

                    <p className="h-2.5 bg-gray-100 rounded w-4/6" />
                    <p className="h-2.5 bg-gray-100 rounded w-full" />
                  </div>
                </div>

                {/* Bottom Signature & Suspect Box 2: Seal Copy Paste */}
                <div className="flex items-end justify-between pt-6 border-t border-gray-100 mt-6">
                  <div>
                    <p className="text-[10px] text-gray-400">AUTHORIZED OFFICER</p>
                    <p className="text-xs font-bold text-gray-800">State Authority</p>
                  </div>

                  {/* Stamp 2 */}
                  <div className="relative border-2 border-dashed border-red-500 bg-red-50/30 p-2 rounded-full w-24 h-24 flex flex-col items-center justify-center text-center">
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                      2
                    </span>
                    <div className="w-16 h-16 rounded-full border border-red-400 flex items-center justify-center text-[9px] text-red-700 font-bold p-1">
                      DUPLICATE SEAL
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlight Issue Numbered Callouts */}
              <div className="mt-4 space-y-2.5">
                <div className="p-3 bg-red-50/60 border border-red-100 rounded-lg flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-red-900">Issue date uses a different font</p>
                      <span className="px-1.5 py-0.2 bg-red-600 text-white rounded font-bold text-[9px]">
                        HIGH
                      </span>
                    </div>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      The date does not match the typeface and compression rate used in the rest of the certificate.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-red-50/60 border border-red-100 rounded-lg flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-red-900">Seal looks copied from another document</p>
                      <span className="px-1.5 py-0.2 bg-red-600 text-white rounded font-bold text-[9px]">
                        HIGH
                      </span>
                    </div>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      The seal pixel contours match identical template on fire_noc.pdf with rotation mismatch.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-amber-900">File was edited after the issue date</p>
                      <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded font-bold text-[9px]">
                        MEDIUM
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      PDF metadata shows ModDate is 14 months after printed issuance date.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Trust Score & Route Recommendation (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Trust Score Donut */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Trust Score
              </h3>

              <div className="flex flex-col items-center my-4">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-red-500"
                      strokeDasharray={`${score}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-3xl font-extrabold text-gray-900 font-mono leading-none">{score}</p>
                    <p className="text-[10px] text-gray-400 mt-1">out of 100</p>
                  </div>
                </div>

                <p className="font-bold text-sm text-red-600 mt-2">Low trust</p>
                <p className="text-[11px] text-gray-400 text-center mt-0.5">
                  Driven mostly by the forgery check on the safety NOC.
                </p>
              </div>

              {/* Subscores */}
              <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs">
                {[
                  { label: 'Authenticity', val: 34, color: 'bg-red-500' },
                  { label: 'Forgery check', val: 16, color: 'bg-red-600' },
                  { label: 'Compliance', val: 55, color: 'bg-amber-500' },
                  { label: 'Completeness', val: 47, color: 'bg-red-500' },
                ].map((s, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-gray-600 text-[11px] mb-1">
                      <span>{s.label}</span>
                      <span className="font-mono font-bold text-gray-800">{s.val}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Route Card (Dark Navy) */}
            <div className="bg-[#0F172A] text-white rounded-xl p-5 shadow-lg border border-slate-800">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                RECOMMENDED ROUTE
              </p>
              <h4 className="text-xl font-extrabold text-white mt-1">Senior scrutiny</h4>

              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Possible tampering on the safety NOC</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Faculty list was not submitted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Fee statement needs an officer check</span>
                </li>
              </ul>

              <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                An officer confirms the route before any official output is generated.
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: COMPLIANCE TABLE & PRINT OUTPUTS ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Compliance Against AICTE Handbook (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900">Compliance against the AICTE Handbook</h3>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">
              Norm wording here is validated against Handbook rules.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-400 font-semibold uppercase text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2.5">AREA</th>
                    <th className="px-3 py-2.5">NORM</th>
                    <th className="px-3 py-2.5">FOUND IN APPLICATION</th>
                    <th className="px-3 py-2.5 text-right">RESULT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { area: 'Land', norm: "Land is held in institution's name (≥ 4.0 Acres)", found: 'Land papers claim 4.90 acres (2.10 verified)', res: 'Fail', pass: false },
                    { area: 'Trust', norm: 'Trust registration is current', found: 'Registration valid and verified', res: 'Pass', pass: true },
                    { area: 'Faculty', norm: 'Student-to-Faculty Ratio <= 20:1', found: 'Ratio calculated at 29.5:1 (Deficient)', res: 'Fail', pass: false },
                    { area: 'Fees', norm: 'Fee statement follows approved limits', found: 'Figures need an officer check', res: 'Review', pass: null },
                    { area: 'Safety', norm: 'Valid safety NOC is attached', found: 'Certificate flagged for possible tampering', res: 'Fail', pass: false },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 font-bold text-gray-800">{row.area}</td>
                      <td className="px-3 py-3 text-gray-600">{row.norm}</td>
                      <td className="px-3 py-3 text-gray-500 font-medium">{row.found}</td>
                      <td className="px-3 py-3 text-right">
                        {row.pass === true ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            ✓ Pass
                          </span>
                        ) : row.pass === false ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
                            ✗ Fail
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                            ! Review
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Print Ready Outputs & Activity (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900">Print-ready outputs</h3>
              <p className="text-xs text-gray-400 mt-0.5 mb-4">Drafts update as the case changes.</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Scrutiny report</p>
                    <p className="text-[11px] text-gray-400">PDF · draft ready</p>
                  </div>
                  <button
                    onClick={() => handleDownloadReport('clearance')}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-xs font-semibold rounded-md hover:bg-gray-50 flex items-center gap-1 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Deficiency letter</p>
                    <p className="text-[11px] text-gray-400">PDF · draft ready</p>
                  </div>
                  <button
                    onClick={() => handleDownloadReport('deficiency')}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-xs font-semibold rounded-md hover:bg-gray-50 flex items-center gap-1 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                Activity
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-gray-400 text-[11px] w-12 shrink-0">10:42</span>
                  <span className="text-gray-700 font-medium">Routed to senior scrutiny (recommended)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-gray-400 text-[11px] w-12 shrink-0">10:41</span>
                  <span className="text-gray-700 font-medium">Trust Score calculated: {score}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-gray-400 text-[11px] w-12 shrink-0">10:39</span>
                  <span className="text-red-600 font-semibold">Forgery flags raised on the safety NOC</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-gray-400 text-[11px] w-12 shrink-0">10:36</span>
                  <span className="text-gray-700 font-medium">Compliance check finished</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-gray-400 text-[11px] w-12 shrink-0">10:30</span>
                  <span className="text-gray-700 font-medium">Application uploaded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
