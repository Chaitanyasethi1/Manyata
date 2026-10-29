import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FileCheck,
  ShieldAlert,
  Database,
  Scale,
  ArrowRight,
  AlertCircle,
  LogIn,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Building,
} from 'lucide-react'

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* ── PLAIN HERO SECTION (No gradients, no soft shadows) ─────────────── */}
      <section className="bg-white border-b border-[#D0D5DD] py-8 px-4" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Title, Description, Buttons */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-block px-2.5 py-1 bg-[#F0F4FA] border border-[#D0D5DD] text-[#0B1F4B] text-xs font-semibold rounded-[2px]">
              AICTE Regulation Bureau · SIH 2026 Problem Statement SIH26261
            </div>

            <h1 id="hero-heading" className="text-2xl sm:text-3xl font-semibold text-[#0B1F4B] tracking-tight leading-snug">
              {t('hero.title', 'Statutory Verification & Regulatory Scrutiny Assistance')}
            </h1>

            <p className="text-sm text-[#5B6472] leading-relaxed max-w-2xl">
              {t('hero.desc', 'Automated document extraction, integrity inspection, and AICTE Approval Process Handbook compliance checks for institutional applications.')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/login" className="gov-btn gov-btn-primary">
                <LogIn className="w-4 h-4" strokeWidth={1.5} />
                <span>{t('hero.loginBtn', 'Login to Portal')}</span>
              </Link>
              <Link to="/how-it-works" className="gov-btn gov-btn-secondary">
                <span>{t('hero.howBtn', 'View How It Works')}</span>
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {/* Right Column: Process at a Glance (Simple bordered panel) */}
          <div className="lg:col-span-5 gov-card border-[#D0D5DD] p-4 bg-[#F8FAFC]">
            <h2 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider pb-2 border-b border-[#D0D5DD]">
              {t('hero.glanceTitle', 'Validation Process at a Glance')}
            </h2>

            <ol className="mt-3 space-y-2 text-xs text-[#1A1D23] list-none p-0 m-0">
              {[
                { phase: '1', title: 'Application Intake', desc: 'Institutional upload of 5 core statutory documents.' },
                { phase: '2', title: 'AI Validation Engine', desc: 'OCR extraction, authenticity checks, and ELA tamper flags.' },
                { phase: '3', title: 'Scoring & Routing', desc: 'Weighted Trust Score (0-100) mapped to 3 regulatory bands.' },
                { phase: '4', title: 'Output Generation', desc: 'Instant Deficiency Notices or Clearance Recommendation Packages.' },
                { phase: '5', title: 'Scrutiny & Monitoring', desc: 'Officer review desk and administrative audit trail.' },
              ].map((item) => (
                <li key={item.phase} className="flex items-start gap-2.5 p-1.5 border-b border-gray-100 last:border-0">
                  <span className="w-5 h-5 rounded-[2px] bg-[#0B1F4B] text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                    {item.phase}
                  </span>
                  <div>
                    <span className="font-semibold text-[#0B1F4B]">{item.title}:</span>{' '}
                    <span className="text-[#5B6472]">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── CORE PROMINENT NOTICE BOX ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4" aria-label="Regulatory Notice">
        <div className="gov-notice flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1F3A7A] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <h2 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide">
              Mandatory Regulatory Disclaimer & Decision Support Principle
            </h2>
            <p className="text-xs text-[#1A1D23] mt-1 leading-relaxed">
              {t('notice.disclaimer', 'AI-generated results are decision-support outputs only. Statutory scrutiny, physical inspection, and final decisions remain with competent AICTE authorities. Flags represent preliminary indicators requiring human verification, never proven forgery.')}
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT MANYATA DOES (4 Concise Blocks) ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4" aria-labelledby="features-heading">
        <div className="border-b border-[#D0D5DD] pb-2 mb-4">
          <h2 id="features-heading" className="text-lg font-semibold text-[#0B1F4B]">
            Core Scrutiny Assistance Modules
          </h2>
          <p className="text-xs text-[#5B6472]">
            System functions assisting the Regulation Bureau during institutional approval evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Application & Document Validation',
              desc: 'High-accuracy OCR extracts critical metadata including surveyor parcel numbers, trust deeds, and faculty rosters.',
              icon: FileCheck,
              clause: 'Clause 4.1 & 4.2',
            },
            {
              title: 'Anomaly & Potential Forgery Indicators',
              desc: 'Error Level Analysis (ELA) and copy-move detection identify digital manipulation and duplicate official stamps.',
              icon: ShieldAlert,
              clause: 'Clause 6.1 & 6.2',
            },
            {
              title: 'Verification via Issuing Authorities',
              desc: 'Cross-references claimed clearances against external digital databases (State Revenue, Fire Services, MCA21).',
              icon: Database,
              clause: 'Clause 3.4 Registry',
            },
            {
              title: 'Compliance & Infrastructure Assistance',
              desc: 'Automates formula checks for Student-to-Faculty Ratio (SFR <= 20:1) and minimum contiguous land requirements.',
              icon: Scale,
              clause: 'Clause 5.1 & 5.2',
            },
          ].map((block, idx) => {
            const Icon = block.icon
            return (
              <div key={idx} className="gov-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D0D5DD]">
                    <Icon className="w-5 h-5 text-[#0B1F4B]" strokeWidth={1.5} />
                    <span className="text-[10px] font-mono font-semibold text-[#5B6472] bg-gray-100 px-1.5 py-0.5 border border-[#D0D5DD] rounded-[2px]">
                      {block.clause}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#0B1F4B]">
                    {block.title}
                  </h3>
                  <p className="text-xs text-[#5B6472] mt-2 leading-relaxed">
                    {block.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── QUICK LINKS & SYNTHETIC NOTICES ROW ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Links Tiles (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-sm font-semibold text-[#0B1F4B] border-b border-[#D0D5DD] pb-1.5">
              Institutional Portals & Services
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/institution" className="gov-card p-3 hover:border-[#0B1F4B] transition-colors block text-inherit no-underline">
                <span className="text-xs font-semibold text-[#0B1F4B] flex items-center justify-between">
                  <span>Institution Portal</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#5B6472]" />
                </span>
                <p className="text-[11px] text-[#5B6472] mt-1">
                  Submit EoA 2026-27, upload documents, track scrutiny status.
                </p>
              </Link>

              <Link to="/officer" className="gov-card p-3 hover:border-[#0B1F4B] transition-colors block text-inherit no-underline">
                <span className="text-xs font-semibold text-[#0B1F4B] flex items-center justify-between">
                  <span>Scrutiny Officer Desk</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#5B6472]" />
                </span>
                <p className="text-[11px] text-[#5B6472] mt-1">
                  Examine flagged applications, inspect ELA bounding boxes.
                </p>
              </Link>

              <Link to="/admin" className="gov-card p-3 hover:border-[#0B1F4B] transition-colors block text-inherit no-underline">
                <span className="text-xs font-semibold text-[#0B1F4B] flex items-center justify-between">
                  <span>Executive Command HQ</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#5B6472]" />
                </span>
                <p className="text-[11px] text-[#5B6472] mt-1">
                  National verification analytics, bottlenecks, immutable audit trail.
                </p>
              </Link>

              <Link to="/categories" className="gov-card p-3 hover:border-[#0B1F4B] transition-colors block text-inherit no-underline">
                <span className="text-xs font-semibold text-[#0B1F4B] flex items-center justify-between">
                  <span>Application Categories</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#5B6472]" />
                </span>
                <p className="text-[11px] text-[#5B6472] mt-1">
                  Mandatory document schedules for EoA, New Programs, Intake Changes.
                </p>
              </Link>
            </div>
          </div>

          {/* Synthetic Official Notices (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-1.5">
              <h3 className="text-sm font-semibold text-[#0B1F4B]">
                Scrutiny Circulars & Regulatory Notices (Synthetic)
              </h3>
              <span className="text-[11px] text-[#5B6472]">Demonstration Feed</span>
            </div>

            <div className="gov-card p-0 overflow-hidden divide-y divide-[#D0D5DD]">
              {[
                {
                  date: '28 Oct 2026',
                  title: 'Extension of Approval (EoA) Scrutiny Cycle 2026-27 initiated for Technical Institutions.',
                  type: 'Circular',
                },
                {
                  date: '24 Oct 2026',
                  title: 'Mandatory verification of Fire Safety Certificates via State Emergency Services API integration.',
                  type: 'Mandate',
                },
                {
                  date: '19 Oct 2026',
                  title: 'Advisory on Student-to-Faculty Cadre ratios as specified in Handbook Chapter V.',
                  type: 'Advisory',
                },
              ].map((notice, i) => (
                <div key={i} className="p-3 text-xs flex items-start justify-between gap-3 hover:bg-gray-50">
                  <div>
                    <span className="text-[10px] font-mono text-[#5B6472] block">{notice.date} · {notice.type}</span>
                    <p className="font-medium text-[#1A1D23] mt-0.5">{notice.title}</p>
                  </div>
                  <span className="text-[11px] text-[#1F3A7A] hover:underline font-semibold shrink-0 cursor-pointer">
                    View Order
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
