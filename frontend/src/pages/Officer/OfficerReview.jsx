import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Layers,
  FileText,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Download,
  Info,
  Check,
  Building,
  Calendar,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles
} from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import TrustScoreGauge from '../../components/ui/TrustScoreGauge.jsx'
import { mockApplications } from '../../data/mockData.js'

export default function OfficerReview() {
  const { appId } = useParams()
  const navigate = useNavigate()

  // Selected case
  const currentApp = mockApplications.find(a => a.id === appId) || mockApplications[1] // fallback to AICTE-2026-0002

  const [activeDoc, setActiveDoc] = useState('fire_noc')
  const [activePage, setActivePage] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [activeTab, setActiveTab] = useState('extracted') // extracted | flags | compliance | audit
  const [pulsingFlagId, setPulsingFlagId] = useState(null)

  const [highlightBoundingBoxes, setHighlightBoundingBoxes] = useState(true)
  const [showElaHeatmap, setShowElaHeatmap] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)

  // Decision state
  const [officerRemarks, setOfficerRemarks] = useState('')
  const [remarksError, setRemarksError] = useState(false)
  const [decisionDone, setDecisionDone] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  // Document list with thumbnails
  const documents = [
    { id: 'fire_noc', name: 'Karnataka Fire Safety NOC', pages: 2, status: 'MISMATCH_DETECTED' },
    { id: 'land_title', name: 'Land Conversion Order (Form A-1)', pages: 4, status: 'VERIFIED' },
    { id: 'affidavit', name: 'Statutory Affidavit (Format A-3)', pages: 3, status: 'MANUAL_REVIEW_REQUIRED' },
    { id: 'faculty_roster', name: 'Faculty Cadre & Ratio Roster', pages: 8, status: 'VERIFIED' },
  ]

  // Extracted fields for the selected document
  const extractedFields = [
    {
      field: 'Issuing Authority',
      docValue: 'Karnataka State Fire & Emergency Services',
      registryValue: 'Karnataka State Fire & Emergency Services',
      source: 'State Fire Services Registry',
      status: 'MATCH', // MATCH (green check) | MISMATCH (red cross) | PENDING (amber clock)
    },
    {
      field: 'NOC Certificate Number',
      docValue: 'KSFES-BLR-2024-NOC-77821',
      registryValue: 'KSFES-BLR-2024-NOC-77821',
      source: 'State Fire Services Registry',
      status: 'MATCH',
    },
    {
      field: 'Validity End Date',
      docValue: '28-Nov-2026',
      registryValue: '28-Oct-2026 (Expired in DB)',
      source: 'State Fire Services Registry',
      status: 'MISMATCH',
      flagId: 'FLG-NOC-01',
    },
    {
      field: 'Building Height & Plinth',
      docValue: '14.8 Meters / 3,420 Sq.m',
      registryValue: '14.8 Meters / 3,420 Sq.m',
      source: 'BBMP Urban Town Planning DB',
      status: 'MATCH',
      flagId: 'FLG-PLINTH-01',
    },
    {
      field: 'Demarcation Land Survey No.',
      docValue: 'Survey No. 42/1 (3.42 Acres)',
      registryValue: 'Survey No. 42/1 (Awaiting Demarcation Seal)',
      source: 'Karnataka Bhoomi Gateway',
      status: 'PENDING',
      flagId: 'FLG-LND-02',
    },
  ]

  // Flags list
  const flags = [
    {
      id: 'FLG-NOC-01',
      severity: 'CRITICAL',
      clause: 'AICTE APH 2026-27 Clause 4.3.2(b)',
      reason: 'State Fire NOC validity date mismatch against issuing department registry.',
      evidence: 'Document shows 28-Nov-2026; Official registry reports expiry on 28-Oct-2026.',
      actionNeeded: 'Verify whether fresh renewal receipt was submitted or if document requires re-certification.',
    },
    {
      id: 'FLG-LND-02',
      severity: 'MAJOR',
      clause: 'AICTE APH 2026-27 Clause 2.1.4',
      reason: 'Land survey sub-division 14/2B requires certified demarcation sketch by Tahsildar.',
      evidence: 'Demarcation sketch attached lacks seal of Taluk Land Records Survey Officer.',
      actionNeeded: 'Require certified revenue map before final approval clearance.',
    },
  ]

  // Compliance rules
  const complianceRules = [
    { clause: 'Clause 4.3.2(b)', norm: 'Fire & Life Safety NOC Validity', status: 'NON_COMPLIANT', detail: 'Expiry date conflicts with issuing portal ledger.' },
    { clause: 'Clause 2.1.4', norm: 'Clear Land Title & Demarcation', status: 'CONDITIONAL', detail: 'Survey boundary certified by Tehsildar pending upload.' },
    { clause: 'Clause 5.1', norm: 'Student-to-Faculty Ratio (SFR <= 20:1)', status: 'COMPLIANT', detail: 'Calculated 16.9:1 conforming to AICTE norms.' },
    { clause: 'Clause 6.4', norm: 'Computer Laboratory Carpet Area', status: 'COMPLIANT', detail: '340 Sq.m provided vs 300 Sq.m required.' },
  ]

  function handleFlagClick(flagId) {
    setPulsingFlagId(flagId)
    setTimeout(() => setPulsingFlagId(null), 2500)
  }

  function initiateAction(actionType) {
    if (!officerRemarks.trim() || officerRemarks.trim().length < 15) {
      setRemarksError(true)
      return
    }
    setRemarksError(false)
    setPendingAction(actionType)
    setShowConfirmModal(true)
  }

  function confirmDecision() {
    setDecisionDone(pendingAction)
    setShowConfirmModal(false)
  }

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER BAR ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-[#D0D5DD] rounded-[8px] shadow-sm">
        <div className="space-y-1">
          <Link
            to="/officer"
            className="inline-flex items-center gap-1 text-xs text-[#1F3A7A] hover:underline font-medium mb-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Return to Review Queue</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl font-semibold text-[#0B1F4B]">
              Officer Scrutiny Dossier: <span className="font-mono">{currentApp.id}</span>
            </h1>
            <StatusBadge status={decisionDone ? (decisionDone === 'CLEARED' ? 'CLEARED' : 'DEFICIENT') : currentApp.status} />
          </div>
          <p className="text-xs text-[#5B6472]">
            {currentApp.institution} · AICTE ID: <span className="font-mono">{currentApp.aicteId}</span> · {currentApp.category}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#F4F6F9] px-4 py-2 border border-[#D0D5DD] rounded-[4px]">
          <div className="text-right">
            <span className="text-[10px] font-mono text-[#5B6472] uppercase block">Trust Score</span>
            <span className="font-mono text-xl font-bold text-[#0B1F4B]">{currentApp.score}/100</span>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-[2px] bg-[#FBF3DC] text-[#8A5A0B] border border-[#C99A3A]">
            NEEDS REVIEW
          </span>
        </div>
      </div>

      {decisionDone && (
        <div className="bg-[#E6F2EA] border-l-4 border-[#1F5E34] p-4 text-xs text-[#1F5E34] rounded-[4px] flex items-center justify-between animate-fade-in-rise">
          <div>
            <p className="font-bold">Official Scrutiny Determination Recorded</p>
            <p className="text-[12px] text-[#1A1D23] mt-0.5">
              Determination: <strong>{decisionDone}</strong> · Scrutiny Officer: S. K. Ramanathan (Joint Director) · Chained to National Audit Trail.
            </p>
            <p className="text-[11px] text-[#5B6472] mt-0.5 font-mono">Remarks: {officerRemarks}</p>
          </div>
          <button
            onClick={() => navigate('/officer')}
            className="px-3 py-1 bg-[#1F5E34] text-white text-xs rounded-[2px] font-semibold hover:bg-[#184828]"
          >
            Back to Queue
          </button>
        </div>
      )}

      {/* ── TRUE SPLIT VIEW LAYOUT ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Document Viewer with Thumbnails & Zoom Controls */}
        <div className="lg:col-span-6 space-y-3">
          <div className="gov-card p-0 rounded-[8px] overflow-hidden flex flex-col h-[750px] bg-white">
            {/* Document Header & Thumbnails Strip */}
            <div className="bg-[#F8FAFC] border-b border-[#D0D5DD] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#5B6472] uppercase font-bold">
                  Submitted Statutory Document Viewer
                </span>
                <span className="text-[11px] font-mono text-[#5B6472]">
                  Doc: {activeDoc} (Page {activePage} of 2)
                </span>
              </div>

              {/* Document Selector Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {documents.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setActiveDoc(d.id)
                      setActivePage(1)
                    }}
                    className={`px-2.5 py-1 text-xs border rounded-[2px] font-medium whitespace-nowrap transition-colors ${
                      activeDoc === d.id
                        ? 'bg-[#0B1F4B] text-white border-[#0B1F4B]'
                        : 'bg-white text-[#5B6472] border-[#D0D5DD] hover:bg-gray-50'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              {/* Page Thumbnails & Zoom Toolbar */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-xs">
                {/* Thumbnails */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#5B6472]">Pages:</span>
                  <button
                    onClick={() => setActivePage(1)}
                    className={`px-2 py-0.5 text-xs font-mono rounded-[2px] border ${
                      activePage === 1 ? 'bg-[#0B1F4B] text-white font-bold' : 'bg-white text-[#5B6472] border-[#D0D5DD]'
                    }`}
                  >
                    P1
                  </button>
                  <button
                    onClick={() => setActivePage(2)}
                    className={`px-2 py-0.5 text-xs font-mono rounded-[2px] border ${
                      activePage === 2 ? 'bg-[#0B1F4B] text-white font-bold' : 'bg-white text-[#5B6472] border-[#D0D5DD]'
                    }`}
                  >
                    P2
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 15, 70))}
                    className="p-1 border border-[#D0D5DD] rounded-[2px] hover:bg-gray-100"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5 text-[#5B6472]" />
                  </button>
                  <span className="font-mono text-[10px] text-[#5B6472] w-12 text-center">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 15, 140))}
                    className="p-1 border border-[#D0D5DD] rounded-[2px] hover:bg-gray-100"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#5B6472]" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="p-1 border border-[#D0D5DD] rounded-[2px] hover:bg-gray-100 ml-1"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#5B6472]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Overlays Toggle Bar */}
            <div className="px-3 py-2 bg-white border-b border-[#D0D5DD] flex items-center justify-between text-xs text-[#1A1D23]">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highlightBoundingBoxes}
                    onChange={(e) => setHighlightBoundingBoxes(e.target.checked)}
                    className="rounded-[2px] text-[#0B1F4B]"
                  />
                  <span className="text-[11px] font-medium">Highlight OCR Bounding Boxes</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showElaHeatmap}
                    onChange={(e) => setShowElaHeatmap(e.target.checked)}
                    className="rounded-[2px] text-[#0B1F4B]"
                  />
                  <span className="text-[11px] font-medium">Forensic ELA Heatmap</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMetadata}
                    onChange={(e) => setShowMetadata(e.target.checked)}
                    className="rounded-[2px] text-[#0B1F4B]"
                  />
                  <span className="text-[11px] font-medium">Digital Cert Meta</span>
                </label>
              </div>
            </div>

            {/* Document Canvas Container with Zoom Scaling */}
            <div className="flex-1 bg-[#525659] p-4 overflow-auto flex justify-center items-start">
              <div
                className="w-full max-w-[500px] bg-white min-h-[640px] p-6 shadow-md border border-[#D0D5DD] text-[#1A1D23] font-sans relative transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {/* Government Header Banner */}
                <div className="text-center border-b-2 border-[#0B1F4B] pb-3 mb-4">
                  <div className="w-10 h-10 border border-[#0B1F4B] mx-auto rounded-full flex items-center justify-center font-bold text-[10px] text-[#0B1F4B] mb-1">
                    SEAL
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1F4B]">
                    Government of Karnataka
                  </h3>
                  <h4 className="text-[11px] font-semibold text-[#1A1D23]">
                    Karnataka State Fire and Emergency Services Department
                  </h4>
                  <p className="text-[10px] text-[#5B6472]">
                    Office of the Chief Fire Officer · Bangalore West Zone
                  </p>
                </div>

                {/* Document Body with Highlight Bounding Boxes */}
                <div className="space-y-3 text-[11px] leading-relaxed">
                  <div className="flex justify-between text-[10px] font-mono text-[#5B6472] pb-1 border-b border-gray-100">
                    <span>Ref: KSFES/CFO/BWZ/2024/77821</span>
                    <span>Dated: 29-Nov-2024</span>
                  </div>

                  <p className="font-bold text-center underline uppercase text-[11px] text-[#0B1F4B]">
                    No Objection Certificate (Renewal)
                  </p>

                  <p>
                    Subject: Issuance of Fire Safety & Life Safety NOC for educational building premises of{' '}
                    <strong>Greenfield Polytechnic Institute</strong>, Survey No. 42/1, Kengeri Hobli, Bangalore.
                  </p>

                  {/* Bounding Box 1: Flagged Date Anomaly */}
                  <div
                    className={`p-2 border rounded-[2px] relative transition-all duration-300 ${
                      highlightBoundingBoxes
                        ? 'border-[#B85C5C] bg-[#F6E7E7]/40'
                        : 'border-transparent'
                    } ${pulsingFlagId === 'FLG-NOC-01' ? 'ring-4 ring-[#8F2D2D] animate-pulse bg-[#F6E7E7]' : ''}`}
                  >
                    {highlightBoundingBoxes && (
                      <span className="absolute -top-2.5 right-2 bg-[#8F2D2D] text-white text-[9px] font-mono px-1.5 py-0.2 rounded-[2px]">
                        Anomaly: Registry Mismatch (FLG-NOC-01)
                      </span>
                    )}
                    <p className="text-[11px]">
                      "The clearance is hereby granted for educational occupancy subject to adherence with NBC 2016 Part 4. This certificate is valid for a period of two years ending on{' '}
                      <strong className="underline text-[#8F2D2D] bg-[#FBF3DC] px-1 font-bold">28-Nov-2026</strong>."
                    </p>
                  </div>

                  {/* Bounding Box 2: Plinth Area */}
                  <div
                    className={`p-2 border rounded-[2px] relative transition-all ${
                      highlightBoundingBoxes
                        ? 'border-[#4C8A62] bg-[#E6F2EA]/40'
                        : 'border-transparent'
                    } ${pulsingFlagId === 'FLG-PLINTH-01' ? 'ring-4 ring-[#1F5E34] animate-pulse bg-[#E6F2EA]' : ''}`}
                  >
                    {highlightBoundingBoxes && (
                      <span className="absolute -top-2.5 right-2 bg-[#1F5E34] text-white text-[9px] font-mono px-1.5 py-0.2 rounded-[2px]">
                        Verified: Plinth & Height Valid
                      </span>
                    )}
                    <p className="text-[11px]">
                      Plinth Area: <strong>3,420 Sq. Metres</strong> · Building Height: <strong>14.8 Metres</strong> · Access Road Width: <strong>12.0 Metres</strong>.
                    </p>
                  </div>

                  {/* ELA Heatmap Overlay Simulation */}
                  {showElaHeatmap && (
                    <div className="absolute inset-0 bg-[#0B1F4B]/80 text-white p-6 flex flex-col justify-center items-center text-center space-y-2 pointer-events-none">
                      <div className="w-12 h-12 rounded-full border-2 border-red-400 flex items-center justify-center font-mono font-bold text-xs bg-red-950/60 text-red-300">
                        ELA
                      </div>
                      <p className="font-semibold text-xs text-red-200">
                        Error Level Analysis (ELA) Compression Discontinuity
                      </p>
                      <p className="text-[11px] text-gray-200 max-w-xs">
                        High frequency gradient shift in the "28-Nov-2026" text block indicating local alteration from 28-Oct-2026.
                      </p>
                    </div>
                  )}

                  {/* Digital Signature Meta */}
                  {showMetadata && (
                    <div className="mt-4 p-3 bg-gray-50 border border-[#D0D5DD] rounded-[2px] text-[10px] font-mono space-y-1 text-[#1A1D23]">
                      <p className="font-bold text-[#0B1F4B]">PDF Digital Certificate & Producer Metadata:</p>
                      <p>Producer: Adobe Acrobat Pro 2024</p>
                      <p>CreationDate: 2024-11-29T10:14:22+05:30</p>
                      <p>ModDate: 2026-10-15T18:22:04+05:30 (Post-issuance alteration)</p>
                      <p>e-Sign Cert: CN=CFO BANGALORE WEST (Expired 2025)</p>
                    </div>
                  )}
                </div>

                {/* Footer seal */}
                <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-end text-[10px]">
                  <div>
                    <span className="font-mono text-[#5B6472]">Place: Bangalore</span><br />
                    <span className="font-mono text-[#5B6472]">Date: 29-Nov-2024</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">Chief Fire Officer</span><br />
                    <span className="text-[#5B6472]">Bangalore West Zone</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): 4 Tabs (Extracted vs Source / Flags / Compliance / Audit) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="gov-card p-0 rounded-[8px] overflow-hidden bg-white">
            {/* Tabs Bar */}
            <div className="flex items-center border-b border-[#D0D5DD] bg-[#F8FAFC] text-xs font-semibold overflow-x-auto">
              {[
                { id: 'extracted', label: 'Extracted vs Source' },
                { id: 'flags', label: `Flags (${flags.length})` },
                { id: 'compliance', label: 'Handbook Compliance' },
                { id: 'audit', label: 'Audit Lineage' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#0B1F4B] text-[#0B1F4B] bg-white font-bold'
                      : 'border-transparent text-[#5B6472] hover:text-[#1A1D23] hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: EXTRACTED VS SOURCE (Match / Mismatch / Pending Rows) */}
            {activeTab === 'extracted' && (
              <div className="p-4 space-y-3">
                <span className="text-[11px] font-mono text-[#5B6472] uppercase block">
                  Field-by-Field Automated Comparison
                </span>

                <div className="overflow-x-auto">
                  <table className="gov-table w-full text-left">
                    <thead>
                      <tr>
                        <th scope="col">Reconciled Field</th>
                        <th scope="col">Document OCR Value</th>
                        <th scope="col">Issuing Authority Value</th>
                        <th scope="col" className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extractedFields.map((f, i) => (
                        <tr
                          key={i}
                          onClick={() => f.flagId && handleFlagClick(f.flagId)}
                          className={f.flagId ? 'cursor-pointer hover:bg-gray-50' : ''}
                        >
                          <td className="font-medium text-xs text-[#1A1D23] whitespace-nowrap">
                            {f.field}
                            <span className="block text-[10px] text-[#5B6472] font-normal">{f.source}</span>
                          </td>
                          <td className="font-mono text-xs text-[#1A1D23]">
                            {f.docValue}
                          </td>
                          <td className="font-mono text-xs text-[#1A1D23]">
                            {f.registryValue}
                          </td>
                          <td className="text-center whitespace-nowrap">
                            {f.status === 'MATCH' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1F5E34] bg-[#E6F2EA] px-2 py-0.5 rounded-[2px] border border-[#4C8A62]">
                                <Check className="w-3.5 h-3.5" />
                                <span>Match</span>
                              </span>
                            )}
                            {f.status === 'MISMATCH' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8F2D2D] bg-[#F6E7E7] px-2 py-0.5 rounded-[2px] border border-[#B85C5C]">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Mismatch</span>
                              </span>
                            )}
                            {f.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A5A0B] bg-[#FBF3DC] px-2 py-0.5 rounded-[2px] border border-[#C99A3A]">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pending</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: FLAGS & ANOMALIES (Clicking highlights matching box) */}
            {activeTab === 'flags' && (
              <div className="p-4 space-y-3">
                <span className="text-[11px] font-mono text-[#5B6472] uppercase block">
                  Click a flag to highlight and pulse the matching region on the document canvas
                </span>

                <div className="space-y-3">
                  {flags.map((flag) => (
                    <div
                      key={flag.id}
                      onClick={() => handleFlagClick(flag.id)}
                      className={`p-3.5 rounded-[4px] border cursor-pointer transition-all ${
                        pulsingFlagId === flag.id
                          ? 'ring-2 ring-[#0B1F4B] bg-[#F4F6F9]'
                          : 'bg-[#F8FAFC] border-[#D0D5DD] hover:border-[#0B1F4B]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-[#0B1F4B]">{flag.id}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-[2px] ${
                          flag.severity === 'CRITICAL'
                            ? 'bg-[#F6E7E7] text-[#8F2D2D] border border-[#B85C5C]'
                            : 'bg-[#FBF3DC] text-[#8A5A0B] border border-[#C99A3A]'
                        }`}>
                          {flag.severity} FLAG
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-[#1A1D23]">{flag.reason}</p>
                      <p className="text-[11px] font-mono text-[#1F3A7A] mt-0.5">{flag.clause}</p>

                      <div className="p-2 bg-white border border-[#D0D5DD] rounded-[2px] text-[11px] text-[#5B6472] mt-2">
                        <strong>Evidence:</strong> {flag.evidence}
                      </div>

                      <p className="text-[11px] text-[#1A1D23] mt-2">
                        <strong>Recommendation:</strong> {flag.actionNeeded}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: HANDBOOK COMPLIANCE */}
            {activeTab === 'compliance' && (
              <div className="p-4 space-y-3">
                <span className="text-[11px] font-mono text-[#5B6472] uppercase block">
                  AICTE Approval Process Handbook (APH) 2026-27 Norms
                </span>

                <div className="space-y-2">
                  {complianceRules.map((rule, idx) => (
                    <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#D0D5DD] rounded-[4px] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#0B1F4B]">{rule.norm}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-[2px] ${
                          rule.status === 'COMPLIANT'
                            ? 'bg-[#E6F2EA] text-[#1F5E34] border border-[#4C8A62]'
                            : rule.status === 'NON_COMPLIANT'
                            ? 'bg-[#F6E7E7] text-[#8F2D2D] border border-[#B85C5C]'
                            : 'bg-[#FBF3DC] text-[#8A5A0B] border border-[#C99A3A]'
                        }`}>
                          {rule.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#1F3A7A]">{rule.clause}</p>
                      <p className="text-[11px] text-[#5B6472]">{rule.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: AUDIT LINEAGE */}
            {activeTab === 'audit' && (
              <div className="p-4 space-y-3">
                <span className="text-[11px] font-mono text-[#5B6472] uppercase block">
                  Case Lineage & Chained Events
                </span>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#F8FAFC] border border-[#D0D5DD] rounded-[2px]">
                    <span className="font-mono text-[10px] text-[#5B6472]">29-Oct 14:10 IST</span>
                    <p className="font-semibold text-xs text-[#0B1F4B] mt-0.5">Automated Cross-Registry Query Issued</p>
                    <p className="text-[11px] text-[#5B6472]">Bhoomi & Fire safety APIs queried via National Gateway.</p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] border border-[#D0D5DD] rounded-[2px]">
                    <span className="font-mono text-[10px] text-[#5B6472]">28-Oct 18:20 IST</span>
                    <p className="font-semibold text-xs text-[#0B1F4B] mt-0.5">Application Ingested</p>
                    <p className="text-[11px] text-[#5B6472]">5 statutory documents received and SHA-256 hashed.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM ACTION BAR (Officer Decision Console) ───────────────── */}
      <div className="sticky bottom-4 z-20 bg-white border-2 border-[#0B1F4B] p-4 rounded-[8px] shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#D0D5DD] gap-2">
          <div>
            <h3 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide">
              Officer Statutory Determination Console
            </h3>
            <p className="text-[11px] text-[#8F2D2D] font-medium mt-0.5">
              Notice: Human verification required before any adverse regulatory action. AI flags are preliminary indicators only.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#5B6472]">
            Competent Authority Desk · Rule 12(3)
          </span>
        </div>

        {/* Remarks Input */}
        <div>
          <textarea
            rows={2}
            value={officerRemarks}
            onChange={(e) => {
              setOfficerRemarks(e.target.value)
              if (e.target.value.trim().length >= 15) setRemarksError(false)
            }}
            placeholder="Enter statutory scrutiny observations, handbook clause citations, or grounds for regulatory decision (min 15 characters required)..."
            className={`w-full p-2.5 text-xs border rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B1F4B] ${
              remarksError ? 'border-[#8F2D2D] bg-[#F6E7E7]/20' : 'border-[#D0D5DD]'
            }`}
          />
          {remarksError && (
            <p className="text-[10px] text-[#8F2D2D] mt-0.5 font-medium">
              Statutory requirement: Please enter substantive officer remarks (at least 15 characters) before recording a determination.
            </p>
          )}
        </div>

        {/* Action Buttons Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => initiateAction('DEFICIENT')}
              className="px-3.5 py-1.5 text-xs font-bold bg-[#F6E7E7] text-[#8F2D2D] border border-[#B85C5C] rounded-[4px] hover:bg-[#ebd4d4] transition-colors"
            >
              Confirm Deficient
            </button>

            <button
              onClick={() => initiateAction('CLEARED')}
              className="px-3.5 py-1.5 text-xs font-bold bg-[#E6F2EA] text-[#1F5E34] border border-[#4C8A62] rounded-[4px] hover:bg-[#d6ebd9] transition-colors"
            >
              Confirm Clear
            </button>

            <button
              onClick={() => initiateAction('EVIDENCE')}
              className="px-3.5 py-1.5 text-xs font-bold bg-[#F4F6F9] text-[#1F3A7A] border border-[#1F3A7A] rounded-[4px] hover:bg-gray-100 transition-colors"
            >
              Request Additional Evidence
            </button>

            <button
              onClick={() => initiateAction('INSPECTION')}
              className="px-3.5 py-1.5 text-xs font-bold bg-[#FBF3DC] text-[#8A5A0B] border border-[#C99A3A] rounded-[4px] hover:bg-[#f3e7c4] transition-colors"
            >
              Recommend Physical Inspection
            </button>
          </div>

          <span className="text-[11px] text-[#5B6472] font-mono">
            Evaluator: S. K. Ramanathan
          </span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D0D5DD] rounded-[8px] max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#0B1F4B] uppercase tracking-wide border-b border-gray-200 pb-2">
              Confirm Statutory Determination
            </h3>
            <p className="text-xs text-[#1A1D23] leading-relaxed">
              You are about to record a regulatory decision of <strong>{pendingAction}</strong> for application{' '}
              <strong className="font-mono">{currentApp.id}</strong> ({currentApp.institution}).
            </p>
            <div className="bg-[#F4F6F9] p-3 border border-[#D0D5DD] text-[11px] text-[#5B6472] rounded-[4px]">
              <strong>Recorded Remarks:</strong> "{officerRemarks}"
            </div>
            <p className="text-[11px] text-[#8F2D2D]">
              This determination will be digitally timestamped and submitted to the National AICTE Central Scrutiny Registry.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 text-xs border border-[#D0D5DD] rounded-[4px] text-[#5B6472] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecision}
                className="px-4 py-1.5 text-xs font-semibold bg-[#0B1F4B] text-white rounded-[4px] hover:bg-[#1F3A7A]"
              >
                Confirm & Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
