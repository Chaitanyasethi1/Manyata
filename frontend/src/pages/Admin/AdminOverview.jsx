import { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Download,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers,
  FileCheck
} from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

export default function AdminOverview() {
  const [timeRange, setTimeRange] = useState('30D')

  // Sparkline miniature data
  const sparklineTotal = [{ v: 800 }, { v: 920 }, { v: 1050 }, { v: 1180 }, { v: 1248 }]
  const sparklineTime = [{ v: 6.2 }, { v: 5.4 }, { v: 4.8 }, { v: 4.4 }, { v: 4.2 }]
  const sparklineClear = [{ v: 62 }, { v: 64 }, { v: 66 }, { v: 67 }, { v: 68.4 }]
  const sparklineReview = [{ v: 28 }, { v: 26 }, { v: 25 }, { v: 25 }, { v: 24.8 }]
  const sparklineSources = [{ v: 98.2 }, { v: 98.6 }, { v: 98.8 }, { v: 99.0 }, { v: 99.1 }]
  const sparklineSLA = [{ v: 97.4 }, { v: 97.8 }, { v: 98.2 }, { v: 98.5 }, { v: 98.7 }]

  // 6 Plain Bordered Stat Boxes with Sparklines
  const kpis = [
    {
      label: 'Applications Processed',
      value: '1,248',
      subtext: 'Cycle 2026-27 to date',
      color: '#0B1F4B',
      data: sparklineTotal,
    },
    {
      label: 'Avg Verification Time',
      value: '4.2 mins',
      subtext: 'Target SLA < 15.0 mins',
      color: '#1F3A7A',
      data: sparklineTime,
    },
    {
      label: 'Auto-Cleared % (≥75)',
      value: '68.4%',
      subtext: '854 applications verified',
      color: '#1F5E34',
      data: sparklineClear,
    },
    {
      label: 'Routed to Officer % (50-74)',
      value: '24.8%',
      subtext: '310 applications under review',
      color: '#8A5A0B',
      data: sparklineReview,
    },
    {
      label: 'Source Verification Rate',
      value: '99.1%',
      subtext: '8 external state/national APIs',
      color: '#0B1F4B',
      data: sparklineSources,
    },
    {
      label: 'Alert Timeliness',
      value: '98.7%',
      subtext: 'Statutory deadline adherence',
      color: '#1F5E34',
      data: sparklineSLA,
    },
  ]

  // Clean Chart Data (Navy #0B1F4B + Muted Greys #98A2B3, No Gradients)
  const volumeData = [
    { date: '23-Oct', total: 64, cleared: 45, officerReview: 14, deficient: 5 },
    { date: '24-Oct', total: 82, cleared: 58, officerReview: 18, deficient: 6 },
    { date: '25-Oct', total: 95, cleared: 66, officerReview: 22, deficient: 7 },
    { date: '26-Oct', total: 110, cleared: 76, officerReview: 26, deficient: 8 },
    { date: '27-Oct', total: 135, cleared: 92, officerReview: 33, deficient: 10 },
    { date: '28-Oct', total: 148, cleared: 102, officerReview: 36, deficient: 10 },
    { date: '29-Oct', total: 124, cleared: 86, officerReview: 31, deficient: 7 },
  ]

  const scoreBandDistribution = [
    { band: 'Below 50 (Deficient)', count: 84, fill: '#8F2D2D' },
    { band: '50-74 (Needs Review)', count: 310, fill: '#8A5A0B' },
    { band: '75-84 (Cleared - Standard)', count: 520, fill: '#4C8A62' },
    { band: '85-100 (Cleared - Fast Track)', count: 334, fill: '#1F5E34' },
  ]

  const liveAuditEvents = [
    {
      time: '16:15 IST',
      text: 'Officer S. K. Ramanathan recorded determination for AICTE-2026-0002',
      badge: 'OFFICER',
    },
    {
      time: '15:50 IST',
      text: 'Bhoomi Karnataka Gateway queried: 3.42 Acres land parcel validated',
      badge: 'GATEWAY',
    },
    {
      time: '14:32 IST',
      text: 'KSFES Fire Safety API: Date mismatch detected on KSFES-77821',
      badge: 'ANOMALY',
    },
    {
      time: '11:24 IST',
      text: 'Automated Clearance Package compiled for Greenfield Polytechnic',
      badge: 'CLEARED',
    },
  ]

  // Bottlenecks Table Data
  const bottlenecks = [
    {
      stage: 'State Fire NOC Reconciliation',
      pending: 48,
      avgWait: '22.4 hrs',
      oldestFile: 'AICTE-2026-0002',
      primaryBlocker: 'State portal maintenance & altered certificate dates',
      responsibleBureau: 'State Coordination Cell',
      priorityAction: 'Direct API retry & Regional Fire Officer memo',
      status: 'NEEDS_REVIEW',
    },
    {
      stage: 'Land Title & Survey Demarcation',
      pending: 36,
      avgWait: '34.8 hrs',
      oldestFile: 'AICTE-2026-0005',
      primaryBlocker: 'Sub-division sketch missing revenue officer digital seal',
      responsibleBureau: 'Infrastructure Bureau',
      priorityAction: 'Issue 15-day deficiency notice under Clause 4.2.1',
      status: 'DEFICIENT',
    },
    {
      stage: 'University Affiliation Reconciliation',
      pending: 22,
      avgWait: '14.2 hrs',
      oldestFile: 'AICTE-2026-0004',
      primaryBlocker: 'Batch SFTP synchronization scheduled window',
      responsibleBureau: 'Academic Bureau',
      priorityAction: 'On-demand manual fetch from affiliating university',
      status: 'VERIFICATION_PENDING',
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── HEADER BLOCK ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D0D5DD] p-5 rounded-[8px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="gov-eyebrow text-[#0B1F4B]">EXECUTIVE COMMAND HQ</span>
          <h1 className="font-serif text-2xl font-semibold text-[#0B1F4B] tracking-tight mt-0.5">
            National Approval Operations & Scrutiny Metrics
          </h1>
          <p className="text-xs text-[#5B6472] mt-1 max-w-2xl">
            Real-time regulatory compliance governance, automated cross-verification throughput, and regional scrutiny desk performance for AICTE Cycle 2026-27.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#1F5E34] bg-[#E6F2EA] px-3 py-1.5 rounded-[4px] border border-[#4C8A62]">
            System Status: 100% Operational
          </span>
        </div>
      </div>

      {/* ── 1. KPI STRIP (6 Plain Bordered Stat Boxes with Tiny Sparklines) ──── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k, idx) => (
          <div
            key={idx}
            className="gov-card p-3 rounded-[8px] space-y-1 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-[#5B6472] uppercase block truncate">
                {k.label}
              </span>
              <span className="text-xl font-bold font-mono text-[#0B1F4B] block mt-0.5">
                {k.value}
              </span>
              <span className="text-[10px] text-[#5B6472] block truncate">
                {k.subtext}
              </span>
            </div>

            <div className="w-full h-8 pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={k.data}>
                  <Area type="monotone" dataKey="v" stroke={k.color} fill="#EBF0FA" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2. CHARTS + RIGHT TIMELINE PANEL (2-Column Layout) ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Clean Charts (Navy + Muted Greys, Labelled Axes) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chart 1: Volume Trend */}
          <div className="gov-card p-4 rounded-[8px] space-y-3 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D0D5DD] pb-2 gap-2">
              <div>
                <h3 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide">
                  Daily Intake & Clearance Throughput (Last 7 Days)
                </h3>
                <p className="text-[11px] text-[#5B6472]">
                  Auto-Cleared (≥75) vs Officer Scrutiny (50-74) vs Deficient (&lt;50)
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#5B6472]">Period: 23-Oct to 29-Oct-2026</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5B6472' }} axisLine={{ stroke: '#D0D5DD' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#5B6472' }} axisLine={{ stroke: '#D0D5DD' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D0D5DD',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="cleared" name="Auto-Cleared (≥75)" fill="#0B1F4B" />
                  <Bar dataKey="officerReview" name="Needs Review (50-74)" fill="#C99A3A" />
                  <Bar dataKey="deficient" name="Deficient (<50)" fill="#B85C5C" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Trust Score Band Distribution */}
          <div className="gov-card p-4 rounded-[8px] space-y-3 bg-white">
            <div className="border-b border-[#D0D5DD] pb-2">
              <h3 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide">
                Trust Score Band Distribution
              </h3>
              <p className="text-[11px] text-[#5B6472]">
                Statutory Routing Thresholds: 50 & 75
              </p>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={scoreBandDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#5B6472' }} axisLine={{ stroke: '#D0D5DD' }} />
                  <YAxis type="category" dataKey="band" width={120} tick={{ fontSize: 10, fill: '#1A1D23' }} axisLine={{ stroke: '#D0D5DD' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D0D5DD',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" name="Applications" fill="#0B1F4B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): National Activity and Alerts Live Feed Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="gov-card p-4 rounded-[8px] space-y-3 bg-white">
            <div className="flex items-center justify-between pb-2 border-b border-[#D0D5DD]">
              <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#E07B00]" strokeWidth={1.5} />
                National Scrutiny Live Feed
              </span>
              <span className="text-[10px] font-mono text-[#1F5E34] font-bold">LIVE STREAM</span>
            </div>

            <div className="space-y-3 text-xs">
              {liveAuditEvents.map((item, idx) => (
                <div key={idx} className="pb-2.5 border-b border-gray-100 last:border-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#5B6472]">{item.time}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] bg-gray-100 text-[#0B1F4B]">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#1A1D23] leading-snug">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#D0D5DD]">
              <span className="text-[11px] text-[#5B6472] block">
                Average regional throughput: 42 files/hour
              </span>
            </div>
          </div>

          {/* Regional Bureau Breakdown */}
          <div className="gov-card p-4 rounded-[8px] bg-[#F8FAFC] space-y-2.5">
            <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide block">
              Regional Bureau Scrutiny Queue
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>SWRO (Bengaluru):</span>
                <span className="font-mono font-bold text-[#0B1F4B]">142 files</span>
              </div>
              <div className="flex justify-between items-center">
                <span>WRO (Mumbai):</span>
                <span className="font-mono font-bold text-[#0B1F4B]">186 files</span>
              </div>
              <div className="flex justify-between items-center">
                <span>NRO (Kanpur):</span>
                <span className="font-mono font-bold text-[#0B1F4B]">118 files</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. BOTTLENECKS TABLE ────────────────────────────────────────── */}
      <div className="gov-card p-0 rounded-[8px] overflow-hidden bg-white">
        <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#D0D5DD] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide">
              Operational Bottlenecks & Scrutiny Delay Log
            </h3>
            <p className="text-[11px] text-[#5B6472]">
              Identified process stages where applications exceed median turnaround benchmarks
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#8A5A0B] font-bold">
            3 Active Bottlenecks Identified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="gov-table w-full text-left">
            <thead>
              <tr>
                <th scope="col">Verification Stage</th>
                <th scope="col">Pending Files</th>
                <th scope="col">Avg Wait Time</th>
                <th scope="col">Oldest Pending File</th>
                <th scope="col">Primary Root Cause</th>
                <th scope="col">Responsible Bureau</th>
                <th scope="col">Status</th>
                <th scope="col">Mandatory Resolution Step</th>
              </tr>
            </thead>
            <tbody>
              {bottlenecks.map((b, idx) => (
                <tr key={idx}>
                  <td className="font-semibold text-xs text-[#1A1D23] whitespace-nowrap">
                    {b.stage}
                  </td>
                  <td className="font-mono text-xs font-bold text-[#0B1F4B] whitespace-nowrap">
                    {b.pending} cases
                  </td>
                  <td className="font-mono text-xs text-[#8A5A0B] whitespace-nowrap">
                    {b.avgWait}
                  </td>
                  <td className="font-mono text-xs text-[#1F3A7A] whitespace-nowrap">
                    {b.oldestFile}
                  </td>
                  <td className="text-xs text-[#5B6472] max-w-xs">
                    <p className="text-[11px] leading-relaxed">{b.primaryBlocker}</p>
                  </td>
                  <td className="text-xs text-[#1A1D23] whitespace-nowrap">
                    {b.responsibleBureau}
                  </td>
                  <td className="whitespace-nowrap">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="text-xs text-[#1F3A7A] font-medium max-w-xs">
                    <p className="text-[11px] leading-relaxed">{b.priorityAction}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
