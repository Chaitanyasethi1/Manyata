import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FileCheck,
  ShieldAlert,
  Database,
  Scale,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  FileSearch,
  History,
  Lock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Layers,
  Building,
  Check,
  Info
} from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import TrustScoreBar from '../../components/ui/TrustScoreBar.jsx'

export default function Home() {
  const { t } = useTranslation()

  // ── 1. Interactive Phase Stepper State (Auto-advances every 5s) ──────────
  const [activePhase, setActivePhase] = useState(0)
  const [isStepperPaused, setIsStepperPaused] = useState(false)

  const phases = [
    {
      id: 1,
      title: 'Application Intake',
      subtitle: 'Phase 1: Institutional Intake',
      desc: 'Institution submits 5 core statutory documents (Affidavit, Fire NOC, Land Title, Building Plan, Faculty Roster) in digital PDF format.',
      action: 'Validates file integrity, checksums, and auto-classifies document categories using header/layout signatures.',
    },
    {
      id: 2,
      title: 'Multi-Stage AI Validation',
      subtitle: 'Phase 2: Validation Engine',
      desc: 'Parallel execution of PyMuPDF text extraction, OCR bounding box localization, Error Level Analysis (ELA) for image compression anomalies, and automated cross-checks against 8 government registries.',
      action: 'Cross-verifies registration numbers, validity dates, land survey extents, and digital signature certificates.',
    },
    {
      id: 3,
      title: 'Scoring & Routing',
      subtitle: 'Phase 3: Weighted Trust Scoring',
      desc: 'Computes a composite Trust Score (0-100) based on Authenticity (40%), Forgery Indicators (35%), and Handbook Compliance (25%).',
      action: 'Automatically routes to: Cleared (>=75), Needs Review (50-74), or Deficient (<50). Score is capped below 50 if critical tamper anomaly exists.',
    },
    {
      id: 4,
      title: 'Output Generation',
      subtitle: 'Phase 4: Statutory Documents',
      desc: 'Produces formal, actionable regulatory outputs: print-ready Deficiency Notices with violated Handbook clauses or Clearance Packages with verifiable QR code.',
      action: 'Eliminates vague rejections by providing exact clause citations, evidence extracts, and remediation checklists.',
    },
    {
      id: 5,
      title: 'Scrutiny & Monitoring',
      subtitle: 'Phase 5: Governance & Audit',
      desc: 'Reviewing officers evaluate flagged cases in a side-by-side evidence console before taking statutory action. All actions permanently logged in immutable audit trail.',
      action: 'Guarantees human-in-the-loop governance: AI output is strictly decision-support only.',
    },
  ]

  useEffect(() => {
    if (isStepperPaused) return
    const timer = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % phases.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isStepperPaused, phases.length])

  // ── 2. Interactive "Try a Sample Validation" Demo State ──────────────────
  const [selectedPreset, setSelectedPreset] = useState('expired_noc') // clean | expired_noc | tampered_affidavit
  const [demoState, setDemoState] = useState('idle') // idle | running | complete
  const [demoProgressStep, setDemoProgressStep] = useState(0)
  const [animatedScore, setAnimatedScore] = useState(0)

  const demoPresets = {
    clean: {
      name: 'Apex Institute of Engineering',
      id: 'AICTE-2026-0001',
      category: 'Extension of Approval (EoA)',
      targetScore: 94,
      status: 'CLEARED',
      findings: [
        { severity: 'VERIFIED', text: 'State Fire NOC validity verified via KSFES Gateway until 31-Mar-2027' },
        { severity: 'VERIFIED', text: 'Land Khata 42/1 matches 5.25 Acres in Revenue Registry' },
        { severity: 'VERIFIED', text: 'Faculty Cadre Ratio conforms to AICTE APH 2026 Clause 5.1 (1:15)' },
      ],
    },
    expired_noc: {
      name: 'Greenfield Polytechnic Institute',
      id: 'AICTE-2026-0002',
      category: 'Extension of Approval (EoA)',
      targetScore: 64,
      status: 'NEEDS_REVIEW',
      findings: [
        { severity: 'CRITICAL', text: 'State Fire NOC validity date mismatch: document indicates 28-Nov-2026 while issuing registry reports expiry on 28-Oct-2026 (Clause 4.3.2)' },
        { severity: 'MAJOR', text: 'Land survey sub-division 14/2B demarcation sketch lacks Tahsildar seal' },
        { severity: 'VERIFIED', text: 'Cadre ratio and laboratory carpet areas confirmed compliant' },
      ],
    },
    tampered_affidavit: {
      name: 'Kaveri Academy of Technical Studies',
      id: 'AICTE-2026-0005',
      category: 'Extension of Approval (EoA)',
      targetScore: 38,
      status: 'DEFICIENT',
      findings: [
        { severity: 'CRITICAL', text: 'Error Level Analysis (ELA) detected compression discontinuity on notary seal (Tamper indicator)' },
        { severity: 'CRITICAL', text: 'Floor Area Ratio (FAR) deficit of 820 Sq.m under APH 2026 Clause 4.2.1' },
        { severity: 'MAJOR', text: 'Non-agricultural land conversion order certificate expired' },
      ],
    },
  }

  function runDemo() {
    setDemoState('running')
    setDemoProgressStep(1)
    setAnimatedScore(0)

    setTimeout(() => setDemoProgressStep(2), 600)
    setTimeout(() => setDemoProgressStep(3), 1200)
    setTimeout(() => setDemoProgressStep(4), 1800)
    setTimeout(() => setDemoProgressStep(5), 2400)

    setTimeout(() => {
      setDemoState('complete')
      const target = demoPresets[selectedPreset].targetScore
      let current = 0
      const stepInterval = setInterval(() => {
        current += 2
        if (current >= target) {
          setAnimatedScore(target)
          clearInterval(stepInterval)
        } else {
          setAnimatedScore(current)
        }
      }, 20)
    }, 3000)
  }

  function resetDemo() {
    setDemoState('idle')
    setDemoProgressStep(0)
    setAnimatedScore(0)
  }

  const currentPresetData = demoPresets[selectedPreset]

  return (
    <div className="space-y-0">
      {/* ── 1. SIGNATURE HERO SECTION (Deep Navy + Subtle Tonal Gradient + Coded Product Preview) ── */}
      <section
        className="relative text-white overflow-hidden border-b border-[#081738]"
        style={{
          background: 'linear-gradient(135deg, #0B1F4B 0%, #12306E 100%)',
        }}
        aria-labelledby="hero-heading"
      >
        {/* Subtle geometric line pattern (Chakra-style concentric circles at 6% opacity) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-[0.06] flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 500 500" className="w-[600px] h-[600px] stroke-white fill-none stroke-[1.2]">
            <circle cx="250" cy="250" r="60" />
            <circle cx="250" cy="250" r="110" />
            <circle cx="250" cy="250" r="160" />
            <circle cx="250" cy="250" r="210" />
            <circle cx="250" cy="250" r="240" strokeDasharray="6 6" />
            <line x1="10" y1="250" x2="490" y2="250" />
            <line x1="250" y1="10" x2="250" y2="490" />
            <line x1="80" y1="80" x2="420" y2="420" />
            <line x1="80" y1="420" x2="420" y2="80" />
          </svg>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <span className="gov-eyebrow text-[#E07B00]">
              SMART INDIA HACKATHON 2026 · PS: SIH26261 · THEME: SMART AUTOMATION
            </span>

            <h1
              id="hero-heading"
              className="font-serif text-3xl sm:text-4xl lg:text-[46px] leading-[1.15] text-white tracking-tight font-semibold"
            >
              AI-Assisted Application Validation, Document Authentication &{' '}
              <span className="relative inline-block text-white">
                Regulatory Compliance
                <span className="absolute bottom-1 left-0 w-full h-[3px] bg-[#E07B00]" />
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-xl font-normal">
              Built for AICTE (Regulation Bureau). Automates document classification, OCR extraction, forensic anomaly indicators, and issuing authority verification while keeping final regulatory determination with competent authorities.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/login"
                className="gov-btn gov-btn-primary !bg-[#071533] !border-white/20 !px-5 !py-2.5 !text-sm text-white hover:!bg-[#1F3A7A]"
              >
                <span>Login to Portal</span>
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>

              <Link
                to="/how-it-works"
                className="gov-btn !bg-white/10 !border-white/20 !text-white !px-5 !py-2.5 !text-sm hover:!bg-white/20"
              >
                <span>View How It Works</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center gap-4 text-xs text-gray-300">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#E07B00]" strokeWidth={1.5} />
                <span>Decision-Support Architecture</span>
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#138808]" strokeWidth={1.5} />
                <span>GIGW 3.0 / NIC Compliant</span>
              </span>
            </div>
          </div>

          {/* Right Hero: Signature Product Preview Card with Perspective Tilt */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[440px]">
              {/* Layered Background Card for Depth */}
              <div
                className="absolute inset-0 bg-[#071533]/80 border border-white/10 rounded-[8px] transform translate-x-3 translate-y-3 pointer-events-none"
                style={{ transform: 'rotate(2deg) scale(0.96)' }}
                aria-hidden="true"
              />

              {/* Main Realistic Validation Report Card (Perspective Tilt) */}
              <div
                className="relative bg-white text-[#1A1D23] rounded-[8px] border border-[#D0D5DD] p-5 shadow-2xl transition-transform duration-300 hover:rotate-0"
                style={{
                  transform: 'perspective(1000px) rotateY(-4deg)',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)',
                }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between border-b border-[#D0D5DD] pb-3 mb-3">
                  <div>
                    <span className="font-mono text-[10px] text-[#5B6472] uppercase font-bold tracking-wider block">
                      AICTE Evaluation Dossier
                    </span>
                    <h2 className="text-xs font-bold text-[#0B1F4B] mt-0.5 font-mono">
                      AICTE-2026-0002
                    </h2>
                    <p className="text-[11px] text-[#5B6472] truncate max-w-[220px]">
                      Greenfield Polytechnic Institute
                    </p>
                  </div>

                  <span className="text-[10px] bg-[#FBF3DC] text-[#8A5A0B] border border-[#C99A3A] px-2 py-0.5 rounded-[2px] font-bold">
                    NEEDS REVIEW
                  </span>
                </div>

                {/* Score & Threshold Bar */}
                <div className="bg-[#F4F6F9] p-3 rounded-[4px] border border-[#D0D5DD] mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#1A1D23]">Trust Score</span>
                    <span className="font-mono text-base font-bold text-[#0B1F4B]">68 / 100</span>
                  </div>
                  <TrustScoreBar score={68} isCapped={false} />
                  <div className="flex justify-between text-[10px] font-mono text-[#5B6472] mt-1">
                    <span>Deficient (&lt;50)</span>
                    <span className="text-[#8A5A0B] font-bold">Review (50-74)</span>
                    <span>Cleared (≥75)</span>
                  </div>
                </div>

                {/* 3 Sample Findings */}
                <div className="space-y-1.5 mb-3 text-[11px]">
                  <div className="p-2 rounded-[2px] bg-[#F6E7E7] border border-[#B85C5C] text-[#8F2D2D] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>Fire NOC validity date mismatch against State Registry</span>
                  </div>

                  <div className="p-2 rounded-[2px] bg-[#FBF3DC] border border-[#C99A3A] text-[#8A5A0B] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>Land survey sub-division missing revenue official seal</span>
                  </div>

                  <div className="p-2 rounded-[2px] bg-[#E6F2EA] border border-[#4C8A62] text-[#1F5E34] flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>Cadre ratio and laboratory carpet areas confirmed compliant</span>
                  </div>
                </div>

                {/* Timestamp Row */}
                <div className="pt-2 border-t border-[#D0D5DD] flex items-center justify-between text-[10px] text-[#5B6472] font-mono">
                  <span>Verified via issuing authority</span>
                  <span className="font-bold text-[#0B1F4B]">14:32:08 IST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST STRIP (4 Factual Pillars) ─────────────────────────────────── */}
      <section className="bg-white border-b border-[#D0D5DD] py-4" aria-label="Key Governance Pillars">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Human-in-the-Loop Review', desc: 'No automated adverse decisions without officer review', icon: ShieldCheck },
            { title: 'Evidence-Linked Findings', desc: 'Every flag cites exact Handbook clause & document coordinates', icon: FileSearch },
            { title: 'Full National Audit Trail', desc: 'Cryptographically hashed timeline of all system and officer actions', icon: History },
            { title: 'Role-Based Access Control', desc: 'Segregated access for Applicants, Evaluators, and Admins', icon: Lock },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="flex items-start gap-3 p-2">
                <div className="gov-icon-container">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide">
                    {item.title}
                  </h2>
                  <p className="text-[11px] text-[#5B6472] mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 3. MANDATORY CORE NOTICE BOX ────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-6" aria-label="Statutory Principle">
        <div className="gov-notice flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1F3A7A] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <h2 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide">
              Mandatory Statutory Scrutiny Mandate
            </h2>
            <p className="text-xs text-[#1A1D23] mt-1 leading-relaxed">
              AI-generated results are decision-support outputs only. Statutory scrutiny, physical inspection, and final decisions remain with competent AICTE authorities. Flags represent preliminary indicators requiring human verification, never proven forgery.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. "TRY A SAMPLE VALIDATION" (Interactive Signature Wow Demo) ────── */}
      <section className="bg-white border-y border-[#D0D5DD] py-16" aria-labelledby="demo-heading">
        <div className="max-w-[1200px] mx-auto px-4 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="gov-eyebrow">INTERACTIVE ENGINE DEMONSTRATOR</span>
            <h2 id="demo-heading" className="font-serif text-2xl sm:text-3xl font-semibold text-[#0B1F4B]">
              Experience Manyata's Decision-Support Engine
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6472]">
              Select a synthetic application scenario below to trigger real-time simulated extraction, cross-registry verification, and handbook compliance analysis.
            </p>
          </div>

          {/* Preset Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'clean',
                label: 'Scenario A: Fully Compliant File',
                institution: 'Apex Institute of Engineering',
                issue: 'All 5 statutory documents verified against official state databases. No anomalies.',
                expected: 'Eligible for Fast-Track Clearance (Score 94)',
                badge: 'CLEARED',
              },
              {
                id: 'expired_noc',
                label: 'Scenario B: Fire NOC Expiry Discrepancy',
                institution: 'Greenfield Polytechnic Institute',
                issue: 'Fire NOC validity date on document differs from official State Fire Department database record.',
                expected: 'Assigned to Scrutiny Officer (Score 64)',
                badge: 'NEEDS_REVIEW',
              },
              {
                id: 'tampered_affidavit',
                label: 'Scenario C: Anomaly Flagged Affidavit',
                institution: 'Kaveri Academy of Technical Studies',
                issue: 'Error Level Analysis (ELA) detects seal inconsistency; Land FAR deficit violates Handbook norm.',
                expected: 'Capped below 50 -> Deficiency Notice (Score 38)',
                badge: 'DEFICIENT',
              },
            ].map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  if (demoState !== 'running') {
                    setSelectedPreset(preset.id)
                    resetDemo()
                  }
                }}
                className={`gov-card gov-card-interactive p-4 rounded-[8px] border-2 transition-all cursor-pointer ${
                  selectedPreset === preset.id
                    ? 'border-[#0B1F4B] bg-[#F4F6F9]'
                    : 'border-[#D0D5DD] bg-white hover:border-[#1F3A7A]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-[#5B6472]">
                    {preset.label}
                  </span>
                  <StatusBadge status={preset.badge} />
                </div>
                <h3 className="text-xs font-bold text-[#0B1F4B]">{preset.institution}</h3>
                <p className="text-[11px] text-[#5B6472] mt-1 leading-snug">{preset.issue}</p>
                <p className="text-[11px] font-semibold text-[#1F3A7A] mt-2 pt-2 border-t border-[#D0D5DD]">
                  {preset.expected}
                </p>
              </div>
            ))}
          </div>

          {/* Execution Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#F4F6F9] border border-[#D0D5DD] rounded-[8px]">
            <div>
              <span className="text-xs font-semibold text-[#1A1D23] block">
                Selected: <span className="text-[#0B1F4B] font-bold">{currentPresetData.name}</span> ({currentPresetData.id})
              </span>
              <span className="text-[11px] text-[#5B6472]">
                Demo operates on synthetic anonymized documents. No live regulatory actions are taken.
              </span>
            </div>

            <div className="flex items-center gap-2">
              {demoState === 'complete' && (
                <button
                  onClick={resetDemo}
                  className="gov-btn gov-btn-secondary !text-xs !py-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Reset Demo</span>
                </button>
              )}
              <button
                onClick={runDemo}
                disabled={demoState === 'running'}
                className="gov-btn gov-btn-primary !text-xs !py-2 !px-4"
              >
                {demoState === 'running' ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                    <span>Executing 5-Phase Scrutiny...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
                    <span>Run Verification Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Staged Execution Progress Simulation */}
          {demoState === 'running' && (
            <div className="p-6 bg-white border border-[#D0D5DD] rounded-[8px] space-y-4">
              <span className="text-xs font-semibold text-[#0B1F4B] uppercase tracking-wide block">
                Pipeline Execution Status
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { step: 1, label: 'Document Classification' },
                  { step: 2, label: 'OCR & Text Extraction' },
                  { step: 3, label: 'Cross-Registry Verification' },
                  { step: 4, label: 'Forensic ELA Tamper Scan' },
                  { step: 5, label: 'APH Compliance Scoring' },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-2.5 rounded-[4px] border transition-colors ${
                      demoProgressStep >= s.step
                        ? 'bg-[#E6F2EA] text-[#1F5E34] border-[#4C8A62] font-semibold'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    <span className="font-mono text-[10px] block">Stage {s.step}</span>
                    <span className="text-[11px] block mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Demo Result Display */}
          {demoState === 'complete' && (
            <div className="p-6 bg-white border border-[#D0D5DD] rounded-[8px] space-y-4 animate-fade-in-rise">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D0D5DD] gap-3">
                <div>
                  <span className="text-[11px] font-mono text-[#5B6472] uppercase font-bold">
                    Scrutiny Assessment Output
                  </span>
                  <h3 className="text-base font-bold text-[#0B1F4B] mt-0.5">
                    {currentPresetData.name} · <span className="font-mono">{currentPresetData.id}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Trust Score</span>
                    <span className="text-2xl font-bold font-mono text-[#0B1F4B]">{animatedScore} / 100</span>
                  </div>
                  <StatusBadge status={currentPresetData.status} />
                </div>
              </div>

              {/* Threshold indicator bar */}
              <div className="max-w-xl">
                <TrustScoreBar score={animatedScore} isCapped={currentPresetData.targetScore < 50} />
              </div>

              {/* Findings List */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-[#1A1D23] uppercase tracking-wide block">
                  Identified Verification Findings & Evidence
                </span>
                {currentPresetData.findings.map((f, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-[4px] border text-xs flex items-start gap-2 ${
                      f.severity === 'CRITICAL'
                        ? 'bg-[#F6E7E7] text-[#8F2D2D] border-[#B85C5C]'
                        : f.severity === 'MAJOR'
                        ? 'bg-[#FBF3DC] text-[#8A5A0B] border-[#C99A3A]'
                        : 'bg-[#E6F2EA] text-[#1F5E34] border-[#4C8A62]'
                    }`}
                  >
                    <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded-[2px] bg-white/80 shrink-0">
                      {f.severity}
                    </span>
                    <span className="leading-relaxed">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. "HOW IT WORKS" INTERACTIVE 5-PHASE STEPPER ────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-16 space-y-8" aria-labelledby="stepper-heading">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="gov-eyebrow">REGULATORY PROCESSING LIFECYCLE</span>
          <h2 id="stepper-heading" className="font-serif text-2xl sm:text-3xl font-semibold text-[#0B1F4B]">
            How Manyata Scrutinizes Applications
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6472]">
            Follow the automated 5-phase verification sequence from document intake to statutory clearance.
          </p>
        </div>

        {/* Stepper Navigation Strip */}
        <div
          className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-[#D0D5DD] pb-4"
          onMouseEnter={() => setIsStepperPaused(true)}
          onMouseLeave={() => setIsStepperPaused(false)}
        >
          {phases.map((p, index) => (
            <button
              key={p.id}
              onClick={() => setActivePhase(index)}
              className={`p-3 text-left rounded-[4px] border transition-all ${
                activePhase === index
                  ? 'bg-[#0B1F4B] text-white border-[#0B1F4B] shadow-sm'
                  : 'bg-white text-[#5B6472] border-[#D0D5DD] hover:bg-gray-50'
              }`}
            >
              <span className="font-mono text-[10px] font-bold block uppercase opacity-80">
                Phase {p.id}
              </span>
              <span className="text-xs font-semibold block mt-0.5 leading-snug">
                {p.title}
              </span>
            </button>
          ))}
        </div>

        {/* Active Phase Details & Animated Mini-Diagram */}
        <div
          className="gov-card p-6 bg-white border-[#D0D5DD] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          onMouseEnter={() => setIsStepperPaused(true)}
          onMouseLeave={() => setIsStepperPaused(false)}
        >
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-block px-2 py-0.5 bg-[#F0F4FA] text-[#0B1F4B] text-[11px] font-mono font-bold rounded-[2px]">
              {phases[activePhase].subtitle}
            </div>

            <h3 className="font-serif text-xl font-semibold text-[#0B1F4B]">
              {phases[activePhase].title}
            </h3>

            <p className="text-xs sm:text-sm text-[#1A1D23] leading-relaxed">
              {phases[activePhase].desc}
            </p>

            <div className="p-3 bg-[#F4F6F9] border-l-4 border-[#0B1F4B] text-xs text-[#5B6472] rounded-[2px]">
              <strong className="text-[#0B1F4B]">Technical Processing:</strong> {phases[activePhase].action}
            </div>
          </div>

          {/* Animated Mini-Diagram on Right */}
          <div className="lg:col-span-5 bg-[#F8FAFC] border border-[#D0D5DD] p-4 rounded-[8px] flex items-center justify-center min-h-[220px]">
            <svg viewBox="0 0 320 180" className="w-full h-auto text-[#0B1F4B]">
              {/* Box 1: Document Upload */}
              <rect x="10" y="70" width="70" height="40" rx="4" fill="#FFFFFF" stroke="#0B1F4B" strokeWidth="1.5" />
              <text x="45" y="88" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#0B1F4B">Documents</text>
              <text x="45" y="100" fontSize="7" textAnchor="middle" fill="#5B6472">5 PDFs</text>

              {/* Arrow 1 */}
              <line x1="80" y1="90" x2="110" y2="90" stroke="#0B1F4B" strokeWidth="1.5" markerEnd="url(#arrow)" />

              {/* Box 2: AI Engine */}
              <rect x="110" y="45" width="90" height="90" rx="4" fill="#EBF0FA" stroke="#0B1F4B" strokeWidth="1.5" />
              <text x="155" y="65" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#0B1F4B">AI VALIDATION</text>
              <text x="155" y="80" fontSize="7" textAnchor="middle" fill="#5B6472">OCR & Layout</text>
              <text x="155" y="95" fontSize="7" textAnchor="middle" fill="#5B6472">ELA Forensic</text>
              <text x="155" y="110" fontSize="7" textAnchor="middle" fill="#5B6472">Registry APIs</text>

              {/* Arrow 2 */}
              <line x1="200" y1="90" x2="230" y2="90" stroke="#0B1F4B" strokeWidth="1.5" />

              {/* Box 3: Bands */}
              <g transform="translate(230, 45)">
                <rect x="0" y="0" width="80" height="24" rx="2" fill="#E6F2EA" stroke="#4C8A62" strokeWidth="1" />
                <text x="40" y="15" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#1F5E34">Cleared (≥75)</text>

                <rect x="0" y="32" width="80" height="24" rx="2" fill="#FBF3DC" stroke="#C99A3A" strokeWidth="1" />
                <text x="40" y="47" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#8A5A0B">Review (50-74)</text>

                <rect x="0" y="64" width="80" height="24" rx="2" fill="#F6E7E7" stroke="#B85C5C" strokeWidth="1" />
                <text x="40" y="79" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#8F2D2D">Deficient (&lt;50)</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ── 6. CORE CAPABILITIES (4 Large Cards) ─────────────────────────────── */}
      <section className="bg-white border-y border-[#D0D5DD] py-16" aria-labelledby="capabilities-heading">
        <div className="max-w-[1200px] mx-auto px-4 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="gov-eyebrow">CORE MODULES</span>
            <h2 id="capabilities-heading" className="font-serif text-2xl sm:text-3xl font-semibold text-[#0B1F4B]">
              Engineered for Technical Approval Rigour
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6472]">
              Four integrated pillars that transform document scrutiny from manual sampling into automated verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Application Intake & Auto-Classification',
                desc: 'Identifies document formats, extracts registration numbers, and verifies mandatory schedules per approval category.',
                link: '/categories',
                icon: FileCheck,
              },
              {
                title: 'Forensic Tamper & Forgery Indicators',
                desc: 'Applies Error Level Analysis (ELA) and seal keypoint hashing to flag altered dates or duplicate stamps as preliminary indicators.',
                link: '/how-it-works',
                icon: ShieldAlert,
              },
              {
                title: 'Cross-Registry Verification',
                desc: 'Interfaces directly with Bhoomi Land Records, State Fire Services, DTCP, NAD DigiLocker, and University Registries.',
                link: '/sources',
                icon: Database,
              },
              {
                title: 'AICTE Handbook Norm Compliance',
                desc: 'Verifies Floor Area Ratio (FAR), Student-to-Faculty Ratios (SFR), and laboratory carpet area against APH 2026 clauses.',
                link: '/about',
                icon: Scale,
              },
            ].map((card, i) => {
              const Icon = card.icon
              return (
                <div key={i} className="gov-card gov-card-interactive flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="gov-icon-container">
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-bold text-[#0B1F4B] leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#5B6472] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#D0D5DD]">
                    <Link to={card.link} className="gov-btn-tertiary">
                      <span>See in portal</span>
                      <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 7. "BEFORE VS WITH MANYATA" (Qualitative Comparison Table) ──────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-16 space-y-6" aria-labelledby="compare-heading">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="gov-eyebrow">REGULATORY PROCESS RE-ENGINEERING</span>
          <h2 id="compare-heading" className="font-serif text-2xl sm:text-3xl font-semibold text-[#0B1F4B]">
            Manual Scrutiny vs Assisted Verification
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6472]">
            Qualitative analysis of procedural enhancements achieved through automated decision-support.
          </p>
        </div>

        <div className="bg-white border border-[#D0D5DD] rounded-[8px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="gov-table w-full text-left">
              <thead>
                <tr>
                  <th scope="col" className="w-1/4">Evaluation Dimension</th>
                  <th scope="col" className="w-3/8">Traditional Manual Scrutiny</th>
                  <th scope="col" className="w-3/8 !bg-[#12306E]">With Manyata Decision-Support</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    dim: 'Document Inspection Speed',
                    manual: 'Physical page-by-page inspection requiring 4-6 hours per multi-programme application.',
                    manyata: 'Automated extraction of critical fields across all documents within 4 minutes.',
                  },
                  {
                    dim: 'Cross-checking with Government Databases',
                    manual: 'Manual sampling or correspondence letters to State Fire & Land offices taking weeks.',
                    manyata: 'Direct API queries to Bhoomi, KSFES, DTCP, and NAD with sub-second response.',
                  },
                  {
                    dim: 'Tamper & Document Alteration Detection',
                    manual: 'Visual inspection often unable to detect modified validity dates or reused digital seals.',
                    manyata: 'Error Level Analysis (ELA) flags image compression discontinuities for officer verification.',
                  },
                  {
                    dim: 'Statutory Deficiencies Formulation',
                    manual: 'Generic rejection letters causing confusion and repetitive appeals.',
                    manyata: 'Print-ready Deficiency Notices with exact AICTE Handbook clause citations and fix steps.',
                  },
                  {
                    dim: 'Statutory Decision Authority',
                    manual: 'Full human responsibility resting on scrutiny committee members.',
                    manyata: 'Preserved entirely: Final decisions remain exclusively with competent authorities.',
                  },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-xs text-[#0B1F4B] whitespace-nowrap bg-gray-50/50">
                      {row.dim}
                    </td>
                    <td className="text-xs text-[#5B6472] leading-relaxed">
                      {row.manual}
                    </td>
                    <td className="text-xs font-medium text-[#0B1F4B] bg-[#F4F6F9]/60 leading-relaxed">
                      {row.manyata}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 8. VERIFICATION SOURCES CHIPS ───────────────────────────────────── */}
      <section className="bg-white border-y border-[#D0D5DD] py-16" aria-labelledby="sources-heading">
        <div className="max-w-[1200px] mx-auto px-4 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="gov-eyebrow">FEDERATED INTEGRATION</span>
            <h2 id="sources-heading" className="font-serif text-2xl sm:text-3xl font-semibold text-[#0B1F4B]">
              Integrated Issuing Authority Sources
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6472]">
              Six standardized verification outcomes monitored across state and national repositories.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto pt-2">
            <StatusBadge status="VERIFIED" />
            <StatusBadge status="MISMATCH_DETECTED" />
            <StatusBadge status="EXPIRED" />
            <StatusBadge status="VERIFICATION_PENDING" />
            <StatusBadge status="SOURCE_UNAVAILABLE" />
            <StatusBadge status="MANUAL_REVIEW_REQUIRED" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 text-center">
            {[
              { name: 'State Land Registries', type: 'Bhoomi / Bhulekh' },
              { name: 'Fire Services NOCs', type: 'Directorate DBs' },
              { name: 'Municipal Sanctions', type: 'DTCP / BBMP / DDA' },
              { name: 'National Depository', type: 'NAD / DigiLocker' },
              { name: 'Affiliation Orders', type: 'University Gateways' },
              { name: 'Corporate Registry', type: 'MCA21 / Societies' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-[#F4F6F9] border border-[#D0D5DD] rounded-[4px]">
                <span className="font-semibold text-xs text-[#0B1F4B] block">{item.name}</span>
                <span className="text-[10px] text-[#5B6472] font-mono block mt-0.5">{item.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CTA BAND (Navy Background) ────────────────────────────────────── */}
      <section className="bg-[#0B1F4B] text-white py-12 px-4" aria-label="Portal Access Call to Action">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white">
              Built for Transparent, Traceable & Explainable Regulatory Processing
            </h2>
            <p className="text-xs text-gray-300">
              Prototype developed for Smart India Hackathon 2026. AICTE Regulation Bureau Scrutiny Desk.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="gov-btn gov-btn-secondary !bg-white !text-[#0B1F4B] !border-white !px-6 !py-2.5 !text-sm font-bold hover:!bg-gray-100"
            >
              <span>Login to Portal</span>
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
