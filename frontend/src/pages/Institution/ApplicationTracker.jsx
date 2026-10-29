import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  ChevronRight,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  FileCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { MOCK_APPLICATIONS } from '../../data/mockData.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

export default function ApplicationTracker() {
  const [selectedApp, setSelectedApp] = useState(MOCK_APPLICATIONS[0])

  // Tiny sparkline datasets
  const sparkline1 = [{ v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: 3 }]
  const sparkline2 = [{ v: 75 }, { v: 78 }, { v: 80 }, { v: 81 }, { v: 82.4 }]
  const sparkline3 = [{ v: 24 }, { v: 22 }, { v: 20 }, { v: 19 }, { v: 18 }]
  const sparkline4 = [{ v: 0 }, { v: 1 }, { v: 1 }, { v: 2 }, { v: 1 }]

  const timelineEvents = [
    {
      time: '29-Oct 14:32 IST',
      appId: 'AICTE-2026-0002',
      title: 'State Fire NOC Date Discrepancy Flagged',
      detail: 'KSFES Gateway reports certificate expired on 28-Oct-2026. Needs renewal upload.',
      type: 'ALERT',
    },
    {
      time: '29-Oct 11:24 IST',
      appId: 'AICTE-2026-0001',
      title: 'Automated Fast-Track Clearance Generated',
      detail: 'Trust Score 94/100 verified with zero anomalies. Ready for download.',
      type: 'SUCCESS',
    },
    {
      time: '28-Oct 18:20 IST',
      appId: 'AICTE-2026-0002',
      title: 'Bhoomi Land Revenue Sync Completed',
      detail: 'Survey 42/1 matched 4.80 Acres institutional land extent.',
      type: 'INFO',
    },
    {
      time: '27-Oct 14:10 IST',
      appId: 'AICTE-2026-0005',
      title: 'Deficiency Notice Issued Under Clause 4.2.1',
      detail: 'FAR shortfall and uncertified land sub-division require 15-day rectification.',
      type: 'DANGER',
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── HEADER BLOCK ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D0D5DD] p-5 rounded-[8px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="gov-eyebrow text-[#0B1F4B]">
            INSTITUTION SELF-SERVICE DESK · PERMANENT ID: 1-3847291048
          </span>
          <h1 className="font-serif text-2xl font-semibold text-[#0B1F4B] tracking-tight mt-0.5">
            Technical Approval Dossier & Application Tracker
          </h1>
          <p className="text-xs text-[#5B6472] mt-1 max-w-2xl">
            Monitor statutory milestone progression, Trust Score evaluations, and compliance notices for academic cycle 2026-27 under AICTE Approval Process Handbook norms.
          </p>
        </div>

        <Link
          to="/institution/new"
          className="gov-btn gov-btn-primary !px-4 !py-2 !text-xs font-semibold shrink-0"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Submit New Application</span>
        </Link>
      </div>

      {/* ── TOP KPI CARDS WITH TINY RECHARTS SPARKLINES ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="gov-card p-4 rounded-[8px] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#5B6472] uppercase block">
              Active Submissions
            </span>
            <span className="text-2xl font-bold font-mono text-[#0B1F4B]">3</span>
            <span className="text-[10px] text-[#1F5E34] font-medium block">
              +1 in scrutiny queue
            </span>
          </div>
          <div className="w-16 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline1}>
                <Area type="monotone" dataKey="v" stroke="#0B1F4B" fill="#EBF0FA" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="gov-card p-4 rounded-[8px] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#5B6472] uppercase block">
              Average Trust Score
            </span>
            <span className="text-2xl font-bold font-mono text-[#0B1F4B]">82.4</span>
            <span className="text-[10px] text-[#1F5E34] font-medium block">
              Eligible band standard
            </span>
          </div>
          <div className="w-16 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline2}>
                <Area type="monotone" dataKey="v" stroke="#1F5E34" fill="#E6F2EA" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="gov-card p-4 rounded-[8px] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#5B6472] uppercase block">
              SLA Window Limit
            </span>
            <span className="text-2xl font-bold font-mono text-[#0B1F4B]">18 Days</span>
            <span className="text-[10px] text-[#5B6472] font-medium block">
              Until portal lock
            </span>
          </div>
          <div className="w-16 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline3}>
                <Area type="monotone" dataKey="v" stroke="#1F3A7A" fill="#F0F4FA" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="gov-card p-4 rounded-[8px] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#5B6472] uppercase block">
              Deficiency / Actions
            </span>
            <span className="text-2xl font-bold font-mono text-[#8F2D2D]">1</span>
            <span className="text-[10px] text-[#8F2D2D] font-medium block">
              NOC clarification required
            </span>
          </div>
          <div className="w-16 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline4}>
                <Area type="monotone" dataKey="v" stroke="#8F2D2D" fill="#F6E7E7" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN LAYOUT: TRACKER TABLE + RIGHT TIMELINE PANEL ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Table + Milestone Stepper */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dense Applications Table */}
          <div className="gov-card p-0 overflow-hidden rounded-[8px]">
            <div className="p-3.5 bg-[#F8FAFC] border-b border-[#D0D5DD] flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider">
                Active Scrutiny Dossiers ({MOCK_APPLICATIONS.length})
              </span>
              <span className="text-xs text-[#5B6472]">Click row to inspect milestone progression</span>
            </div>

            <div className="overflow-x-auto">
              <table className="gov-table w-full text-left">
                <thead>
                  <tr>
                    <th scope="col">Application ID</th>
                    <th scope="col">Category</th>
                    <th scope="col">Submitted On</th>
                    <th scope="col">Status</th>
                    <th scope="col">Trust Score</th>
                    <th scope="col">SLA Timer</th>
                    <th scope="col" className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_APPLICATIONS.map((app) => {
                    const isSelected = selectedApp.applicationId === app.applicationId
                    return (
                      <tr
                        key={app.applicationId}
                        onClick={() => setSelectedApp(app)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? '!bg-[#EDF2F7] font-semibold' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="font-mono text-xs text-[#0B1F4B] font-bold whitespace-nowrap">
                          {app.applicationId}
                        </td>
                        <td className="text-xs text-[#1A1D23] whitespace-nowrap">
                          {app.category}
                        </td>
                        <td className="font-mono text-xs text-[#5B6472] whitespace-nowrap">
                          {app.submittedOn}
                        </td>
                        <td className="whitespace-nowrap">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="font-mono text-xs whitespace-nowrap">
                          <span className="font-bold text-[#0B1F4B]">{app.trustScore}</span> / 100
                        </td>
                        <td className="font-mono text-xs text-[#5B6472] whitespace-nowrap">
                          <span className="text-[#0B1F4B] font-semibold">{app.slaDaysRemaining}d</span> remaining
                        </td>
                        <td className="whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Link
                              to={`/institution/report/${app.applicationId}`}
                              className="gov-btn gov-btn-muted !text-xs !py-0.5 !px-2"
                              title="View Full Validation Report"
                            >
                              <Eye className="w-3 h-3" strokeWidth={1.5} />
                              <span>Report</span>
                            </Link>

                            {app.status === 'DEFICIENT' && (
                              <Link
                                to={`/institution/deficiency/${app.applicationId}`}
                                className="gov-btn gov-btn-danger !text-xs !py-0.5 !px-2"
                                title="View Official Deficiency Notice"
                              >
                                <span>Notice</span>
                              </Link>
                            )}

                            {app.status === 'CLEARED' && (
                              <Link
                                to={`/institution/clearance/${app.applicationId}`}
                                className="gov-btn gov-btn-primary !text-xs !py-0.5 !px-2"
                                title="Download Clearance Package"
                              >
                                <span>Clearance</span>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Milestone Stepper for Selected Application */}
          {selectedApp && (
            <div className="gov-card p-5 space-y-4 rounded-[8px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D0D5DD] gap-2">
                <div>
                  <span className="text-[11px] font-mono text-[#5B6472] uppercase font-bold block">
                    Statutory Progress Pipeline
                  </span>
                  <h3 className="text-sm font-bold text-[#0B1F4B] mt-0.5">
                    {selectedApp.applicationId} · {selectedApp.category}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#0B1F4B]">
                    Assigned: {selectedApp.route}
                  </span>
                </div>
              </div>

              {/* 5-Step Progress Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs pt-1">
                {[
                  { step: '1', title: 'Intake Verified', done: true, time: '29-Oct 10:14' },
                  { step: '2', title: 'AI Extraction', done: true, time: '29-Oct 10:16' },
                  { step: '3', title: 'Registry Sync', done: true, time: '29-Oct 10:18' },
                  {
                    step: '4',
                    title: 'Officer Scrutiny',
                    done: selectedApp.status === 'CLEARED',
                    current: selectedApp.status === 'NEEDS_REVIEW' || selectedApp.status === 'DEFICIENT',
                    time: selectedApp.status === 'CLEARED' ? 'Cleared' : 'In Review',
                  },
                  {
                    step: '5',
                    title: 'Final Approval',
                    done: selectedApp.status === 'CLEARED',
                    time: selectedApp.status === 'CLEARED' ? 'Approved' : 'Pending',
                  },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-2.5 rounded-[4px] border transition-colors ${
                      s.done
                        ? 'bg-[#E6F2EA] border-[#4C8A62] text-[#1F5E34]'
                        : s.current
                        ? 'bg-[#FBF3DC] border-[#C99A3A] text-[#8A5A0B] font-semibold'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold">Step {s.step}</span>
                      {s.done && <CheckCircle2 className="w-3 h-3 text-[#1F5E34]" />}
                      {s.current && <Clock className="w-3 h-3 text-[#8A5A0B] animate-spin" />}
                    </div>
                    <span className="text-xs font-medium block mt-1">{s.title}</span>
                    <span className="text-[10px] font-mono block opacity-80 mt-0.5">{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Activity and Alerts Timeline Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="gov-card p-4 rounded-[8px] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D0D5DD]">
              <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E07B00]" strokeWidth={1.5} />
                Activity & Statutory Timeline
              </span>
              <span className="text-[10px] font-mono text-[#5B6472]">Live Stream</span>
            </div>

            <div className="space-y-3 text-xs">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="pb-3 border-b border-gray-100 last:border-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#5B6472]">{evt.time}</span>
                    <span className="font-mono text-[10px] font-bold text-[#1F3A7A]">{evt.appId}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-[#1A1D23]">{evt.title}</h4>
                  <p className="text-[11px] text-[#5B6472] leading-snug">{evt.detail}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#D0D5DD]">
              <Link
                to="/institution/alerts"
                className="gov-btn-tertiary w-full justify-center !text-xs !py-1 text-[#1F3A7A]"
              >
                <span>View Full Compliance Calendar</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="gov-card p-4 rounded-[8px] bg-[#F8FAFC] space-y-2">
            <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide block">
              Statutory Verification Helpdesk
            </span>
            <p className="text-[11px] text-[#5B6472] leading-relaxed">
              Facing discrepancies in land survey numbers or fire safety NOC dates? Check our standard rectification SOPs before filing an appeal.
            </p>
            <Link
              to="/faqs"
              className="inline-flex items-center gap-1 text-xs text-[#1F3A7A] font-semibold hover:underline pt-1"
            >
              <span>Handbook Resolution Guide</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
