import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Landmark,
  School,
  FileCheck2,
  ScanLine,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
  Award,
  Layers,
  Lock,
  ExternalLink,
  ChevronRight,
  Cpu,
  Fingerprint,
  FileSearch,
  Scale,
} from 'lucide-react'

export default function LandingPage({ setRole }) {
  const navigate = useNavigate()

  function quickLogin(targetRole, path) {
    setRole(targetRole)
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* ── TOP ANNOUNCEMENT BAR ────────────────────────────────────────── */}
      <div className="bg-[#07172B] text-slate-300 text-[11px] px-6 py-2 border-b border-blue-900/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Smart India Hackathon 2026</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Problem Statement SIH26261 · AICTE Verification Engine</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Official Portal: Government of India</span>
          <span className="text-slate-600">|</span>
          <Link to="/login" className="text-amber-400 hover:underline font-semibold flex items-center gap-1">
            <span>Official Login</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <header className="relative bg-gradient-to-b from-[#0B2545] via-[#0F3A78] to-[#0D3063] text-white pt-14 pb-20 px-6 overflow-hidden">
        {/* Background decorative grid and glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-400/30 text-xs font-semibold text-blue-200 shadow-sm backdrop-blur-md">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-[#0B2545] font-black text-[10px] flex items-center justify-center">
              IN
            </span>
            <span>All India Council for Technical Education (AICTE)</span>
            <span className="text-amber-400">★ MANYATA</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            AI-Powered Application Validation & <span className="text-amber-400">Forgery Detection</span> System
          </h1>

          <p className="text-base sm:text-lg text-blue-100/80 max-w-2xl mx-auto leading-relaxed font-normal">
            Automating institutional document scrutiny with multi-stage Computer Vision, Error Level Analysis (ELA),
            and regulatory compliance checking against the AICTE Approval Process Handbook.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => quickLogin('officer', '/officer')}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-[#0B2545] rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-[#0B2545]" />
              <span>Launch Officer Console (TrustDesk)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => quickLogin('admin', '/admin')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-bold text-sm flex items-center gap-2 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Landmark className="w-4 h-4 text-blue-300" />
              <span>AICTE Admin HQ Dashboard</span>
            </button>

            <button
              onClick={() => quickLogin('institution', '/institution')}
              className="px-6 py-3.5 bg-blue-900/60 hover:bg-blue-900/90 border border-blue-400/30 text-blue-100 rounded-xl font-bold text-sm flex items-center gap-2 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <School className="w-4 h-4 text-emerald-300" />
              <span>Institution Portal</span>
            </button>
          </div>

          {/* Live Trust Metrics Strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
              <p className="text-2xl font-black text-white font-mono">1,240+</p>
              <p className="text-xs text-blue-200 mt-0.5">Applications Scrutinized</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
              <p className="text-2xl font-black text-emerald-400 font-mono">860 (69%)</p>
              <p className="text-xs text-blue-200 mt-0.5">Cleared & Fast-Tracked</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
              <p className="text-2xl font-black text-red-400 font-mono">210 (17%)</p>
              <p className="text-xs text-blue-200 mt-0.5">Tampered / Fraud Flagged</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
              <p className="text-2xl font-black text-amber-400 font-mono">99.4%</p>
              <p className="text-xs text-blue-200 mt-0.5">OCR & Compliance Accuracy</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── 8-STAGE AUTOMATION PIPELINE SHOWCASE ────────────────────────── */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-700 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            System Workflow Architecture
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            From Upload to Decision-Ready Output, In One Flow
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Documents are read, authenticated, checked for image tampering, and evaluated against statutory rules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              num: '1',
              title: 'Upload Intake',
              desc: 'Institutions submit land deed, trust certificate, faculty lists, and safety NOCs.',
              output: 'Validated Application Bundle',
              icon: FileText,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              num: '2',
              title: 'OCR & Extraction',
              desc: 'High-accuracy OCR extracts land area, surveyor numbers, student counts, and validity dates.',
              output: 'Structured Field JSON',
              icon: FileSearch,
              color: 'text-indigo-600 bg-indigo-50',
            },
            {
              num: '3',
              title: 'Authenticity Checks',
              desc: 'Cross-verifies registration authorities, QR codes, expiry timelines, and entity names.',
              output: 'Document Integrity Score',
              icon: Fingerprint,
              color: 'text-emerald-600 bg-emerald-50',
            },
            {
              num: '4',
              title: 'Forgery Detection',
              desc: 'Error Level Analysis (ELA) and copy-move algorithms detect edited text & duplicate seals.',
              output: 'Visual Heatmap & Bounding Boxes',
              icon: ScanLine,
              color: 'text-red-600 bg-red-50',
            },
            {
              num: '5',
              title: 'Handbook Compliance',
              desc: 'Rules Engine tests claims against AICTE norms (SFR <= 20:1, Land Area >= 4.0 Acres).',
              output: 'Statutory Pass / Fail Matrix',
              icon: Scale,
              color: 'text-purple-600 bg-purple-50',
            },
            {
              num: '6',
              title: 'Trust Score Engine',
              desc: 'Weighted multi-factor score (0-100) combining authenticity, forgery, and compliance.',
              output: 'Composite Trust Score',
              icon: Award,
              color: 'text-amber-600 bg-amber-50',
            },
            {
              num: '7',
              title: 'Smart Routing',
              desc: 'Automatically triages into Fast Track (≥75), Standard Review (50-74), or Senior Scrutiny (<50).',
              output: 'Target Scrutiny Queue',
              icon: Layers,
              color: 'text-cyan-600 bg-cyan-50',
            },
            {
              num: '8',
              title: 'Output Generation',
              desc: 'Instant PDF export of official AICTE Scrutiny Reports, Deficiency Notices, and Checklists.',
              output: 'Print-Ready Official PDF',
              icon: FileCheck2,
              color: 'text-teal-600 bg-teal-50',
            },
          ].map((stage, idx) => {
            const Icon = stage.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center font-mono">
                      {stage.num}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stage.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400 font-medium">Produces:</span>{' '}
                  <span className="font-semibold text-slate-700">{stage.output}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 3 DISTINCT PORTALS ACCESS SECTION ──────────────────────────── */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Role-Based Access Control
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              Explore the 3 Working Portals
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Each portal caters to a distinct role with tailored views, metrics, and workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Portal 1: Officer TrustDesk */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-blue-400 flex items-center justify-center mb-4 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                    OFFICER VIEW
                  </span>
                  <span className="text-xs text-slate-400">Scrutiny Desk</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">TrustDesk Officer Console</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Deep-dive into flagged applications with split-screen document viewer, red bounding box forgery highlights,
                  AICTE Handbook clause checks, and one-click scrutiny decisions.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Live 7-Stage pipeline tracker</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>ELA & stamp copy-paste alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Official decision approval bar</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => quickLogin('officer', '/officer')}
                className="mt-6 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Enter TrustDesk</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Portal 2: Admin HQ */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0F3A78] text-white flex items-center justify-center mb-4 shadow-md">
                  <Landmark className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                    HQ VIEW
                  </span>
                  <span className="text-xs text-slate-400">National Analytics</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">AICTE Executive Command</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  National command dashboard for education authorities: 1,240 applications overview, status distribution donuts,
                  bottlenecks, escalation matrices, and complete immutable audit logs.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Multi-facet State & Program filtering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Bottlenecks & Escalations feed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Full regulatory audit trail</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => quickLogin('admin', '/admin')}
                className="mt-6 w-full py-2.5 px-4 bg-[#0F3A78] hover:bg-[#0B2545] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Open Executive HQ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Portal 3: Institution Portal */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md">
                  <School className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    COLLEGE VIEW
                  </span>
                  <span className="text-xs text-slate-400">Applicant Self-Service</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">Institution Portal</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Colleges and polytechnics can submit approval applications, upload mandatory documents, track real-time verification stages,
                  respond to deficiencies, and download clearance packages.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Drag-and-drop document upload</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Real-time status tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Clearance certificate download</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => quickLogin('institution', '/institution')}
                className="mt-6 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Access College Portal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="mt-auto bg-[#07172B] text-slate-400 text-xs py-8 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-[#07172B] font-black text-[9px] flex items-center justify-center">
              AICTE
            </div>
            <span>Manyata · SIH26261 Automated Regulatory Validation System</span>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-500">
            <span>Synthetic Sample Data Only</span>
            <span>•</span>
            <Link to="/login" className="text-slate-400 hover:text-white">Officer Login</Link>
            <span>•</span>
            <Link to="/officer" className="text-slate-400 hover:text-white">TrustDesk</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
