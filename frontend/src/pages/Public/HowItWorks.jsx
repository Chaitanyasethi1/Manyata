import { Link } from 'react-router-dom'
import {
  FileUp,
  Cpu,
  Layers,
  FileCheck2,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Scale,
  ShieldAlert,
} from 'lucide-react'
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

export default function HowItWorks() {
  const breadcrumbs = [{ label: 'How It Works' }]

  const PHASES = [
    {
      num: 'Phase 1',
      title: 'Application Intake & Document Submission',
      icon: FileUp,
      objective: 'Receipt of institutional approval applications and mandatory regulatory documents.',
      details: [
        'Institution fills applicant profile with AICTE Permanent ID.',
        'Uploads 5 mandatory statutory documents (PDF/TIFF): Registered Land Deed, Trust Registration Deed, Fire Safety NOC, University Affiliation Letter, Faculty List.',
        'Client-side validation checks document type, resolution, and maximum file size (15MB).',
        'Unique Application ID generated (e.g., AICTE-2026-0005) with immutable timestamp.',
      ],
      output: 'Application Intake Bundle with checksums',
    },
    {
      num: 'Phase 2',
      title: 'Multi-Stage AI Validation Engine',
      icon: Cpu,
      objective: 'Parallel processing for optical extraction, document authenticity, and tamper detection.',
      details: [
        'OCR Extraction: Tesseract and PyMuPDF parse surveyor plot numbers, land acreage, validity dates, student census, and cadre counts.',
        'Authenticity Cross-Verification: Direct API calls to external government registries (Bhoomi Land Records, Fire Services NOC, MCA21).',
        'Forgery Analysis: Error Level Analysis (ELA) identifies JPEG/PDF compression variance; keypoint hashing detects copy-pasted official seals.',
        'Handbook Norms Check: Automated evaluation against AICTE Approval Process Handbook (SFR ceiling 20:1, land requirement >= 4.0 acres).',
      ],
      output: 'Structured Evidence JSON with localized bounding boxes and violation flags',
    },
    {
      num: 'Phase 3',
      title: 'Weighted Trust Scoring & Regulatory Routing',
      icon: Layers,
      objective: 'Computation of composite score and deterministic triage into three administrative review paths.',
      details: [
        'Weighted Composite Score = (Authenticity × 0.35) + (Forgery × 0.35) + (Compliance × 0.30).',
        'Critical Flag Cap: If a critical indicator exists (e.g. seal duplication or land area tampering), score is unconditionally capped at 49 regardless of other sub-scores.',
        'Triaged into: Cleared (>=75), Needs Review (50-74), or Deficient (<50).',
      ],
      output: 'Deterministic routing assignment to Fast-Track, Scrutiny Desk, or Deficiency Notice',
    },
    {
      num: 'Phase 4',
      title: 'Output Generation & Statutory Notice Issuance',
      icon: FileCheck2,
      objective: 'Production of verifiable statutory documents for applicant and scrutiny officer.',
      details: [
        'For Cleared applications: Clearance Recommendation Package with verified document list and cryptographic QR code.',
        'For Deficient applications: Formal Deficiency Report listing specific Handbook clause breaches, evidence extracts, and required fixes.',
        'For Needs Review applications: Scrutiny Dossier with side-by-side comparison for AICTE Officer evaluation.',
      ],
      output: 'Print-ready PDF notices and digital verification packages',
    },
    {
      num: 'Phase 5',
      title: 'Dashboard Monitoring & Regulatory Audit Trail',
      icon: BarChart3,
      objective: 'High-level executive oversight and immutable accountability.',
      details: [
        'AICTE Executive HQ monitors national processing velocity, bottleneck documents, and escalation queues.',
        'Immutable Audit Trail logs every automated stage transition, external source response, and officer decision.',
        'Ensures adherence to citizen charter timelines and SLA compliance.',
      ],
      output: 'National governance dashboard and auditable activity logs',
    },
  ]

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <div className="border-b border-[#D0D5DD] pb-4">
          <span className="text-xs font-semibold text-[#0B1F4B] uppercase tracking-wider">
            Architecture Specification
          </span>
          <h1 className="text-2xl font-semibold text-[#0B1F4B] tracking-tight mt-1">
            How Manyata Works: The 5-Phase Scrutiny Flow
          </h1>
          <p className="text-xs text-[#5B6472] mt-1 max-w-3xl leading-relaxed">
            Manyata operates as a strict decision-support pipeline for the AICTE Regulation Bureau.
            Below is the complete engineering architecture from intake to executive decision.
          </p>
        </div>

        {/* ── 3 REGULATORY SCORE BANDS EXPLANATION (Standardized Colors) ────────── */}
        <div className="gov-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#0B1F4B] uppercase tracking-wider">
            Composite Trust Score Routing Bands
          </h2>
          <p className="text-xs text-[#5B6472]">
            Every application receives a composite Trust Score from 0 to 100 based on verified attributes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Band 1: Deficient */}
            <div className="p-4 rounded-[2px] bg-[#F6E7E7] border border-[#B85C5C] text-[#8F2D2D] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">DEFICIENT</span>
                <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 rounded-[2px] border border-[#B85C5C]">
                  Score &lt; 50
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                Triggered by statutory non-compliance or critical tamper indicator (or capped due to seal/area anomaly).
                Application returned with formal Deficiency Notice.
              </p>
            </div>

            {/* Band 2: Needs Review */}
            <div className="p-4 rounded-[2px] bg-[#FBF3DC] border border-[#C99A3A] text-[#8A5A0B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">NEEDS REVIEW</span>
                <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 rounded-[2px] border border-[#C99A3A]">
                  Score 50 – 74
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                Moderate discrepancies observed (e.g. cadre ratio variance or pending university confirmation).
                Assigned to Scrutiny Officer for human evaluation.
              </p>
            </div>

            {/* Band 3: Cleared */}
            <div className="p-4 rounded-[2px] bg-[#E6F2EA] border border-[#4C8A62] text-[#1F5E34] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">CLEARED</span>
                <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 rounded-[2px] border border-[#4C8A62]">
                  Score ≥ 75
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                High consistency across all 5 documents, external registry sources confirmed, zero critical flags.
                Fast-track clearance package prepared.
              </p>
            </div>
          </div>

          <div className="gov-notice-warning text-xs mt-3">
            <strong>Critical Flag Capping Rule:</strong> If any critical forgery indicator or fraudulent seal detection is flagged by Phase 2, the composite score is mathematically capped at 49 to prevent fraudulent clearance, mandating senior scrutiny.
          </div>
        </div>

        {/* ── 5-PHASE STEPPER WORKFLOW ───────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[#0B1F4B]">
            Detailed 5-Phase Scrutiny Flow
          </h2>

          <div className="space-y-4">
            {PHASES.map((p, idx) => {
              const Icon = p.icon
              return (
                <div key={idx} className="gov-card p-5 border-[#D0D5DD]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D0D5DD]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[2px] bg-[#0B1F4B] text-white flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-[#5B6472] uppercase font-bold">
                          {p.num}
                        </span>
                        <h3 className="text-base font-semibold text-[#0B1F4B]">
                          {p.title}
                        </h3>
                      </div>
                    </div>

                    <div className="text-xs font-mono bg-[#F0F4FA] text-[#0B1F4B] px-2.5 py-1 rounded-[2px] border border-[#D0D5DD]">
                      Produces: <span className="font-semibold">{p.output}</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-[#1A1D23]">
                      <strong>Objective:</strong> {p.objective}
                    </p>
                    <ul className="text-xs text-[#5B6472] space-y-1 list-disc pl-5">
                      {p.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── RESUBMISSION LOOP DIAGRAM ─────────────────────────────────────── */}
        <div className="gov-card p-5 bg-[#F8FAFC] space-y-3">
          <h2 className="text-sm font-semibold text-[#0B1F4B] uppercase tracking-wider flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#0B1F4B]" strokeWidth={1.5} />
            Institutional Correction & Resubmission Loop
          </h2>
          <p className="text-xs text-[#5B6472] leading-relaxed">
            When an application is marked <strong>DEFICIENT</strong> or requires clarification, the institution can review the Deficiency Notice, rectify the documented breaches, upload replacement affidavits or valid NOCs, and resubmit within the statutory 15-day rectification window.
          </p>

          <div className="p-3 bg-white border border-[#D0D5DD] rounded-[2px] text-xs font-mono text-[#0B1F4B] flex flex-wrap items-center justify-between gap-2">
            <span>[Deficiency Notice Issued]</span>
            <span>➔</span>
            <span>[Institution Reviews Handbook Clause Fixes]</span>
            <span>➔</span>
            <span>[Re-upload Rectified Documents]</span>
            <span>➔</span>
            <span>[Re-trigger AI Scrutiny]</span>
          </div>
        </div>
      </div>
    </div>
  )
}
