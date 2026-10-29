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
  ResponsiveContainer
} from 'recharts'
import { AlertTriangle, Clock, CheckCircle2, RefreshCw, Download, ArrowUpRight, ShieldCheck } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

export default function AdminOverview() {
  const [timeRange, setTimeRange] = useState('30D')

  // 6 Plain Bordered Stat Boxes
  const kpis = [
    {
      label: 'Applications Processed',
      value: '1,248',
      subtext: 'Cycle 2026-27 to date',
      color: '#0B1F4B',
    },
    {
      label: 'Avg Verification Time',
      value: '4.2 mins',
      subtext: 'Target SLA < 15.0 mins',
      color: '#1F3A7A',
    },
    {
      label: 'Auto-Cleared % (≥75)',
      value: '68.4%',
      subtext: '854 applications verified',
      color: '#1F5E34',
    },
    {
      label: 'Routed to Officer % (50-74)',
      value: '24.8%',
      subtext: '310 applications under review',
      color: '#8A5A0B',
    },
    {
      label: 'Source Verification Rate',
      value: '99.1%',
      subtext: '8 external state/national APIs',
      color: '#0B1F4B',
    },
    {
      label: 'Alert Timeliness',
      value: '98.7%',
      subtext: 'Statutory deadline adherence',
      color: '#1F5E34',
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

  const registryLatencyData = [
    { source: 'UGC Central', latency: 180, target: 300 },
    { source: 'Fire Safety', latency: 410, target: 500 },
    { source: 'Bhoomi Land', latency: 620, target: 800 },
    { source: 'DTCP Urban', latency: 340, target: 500 },
    { source: 'NAD / DigiLocker', latency: 120, target: 200 },
    { source: 'CBDT PAN', latency: 95, target: 150 },
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
    {
      stage: 'Faculty Cadre & Experience Scrutiny',
      pending: 19,
      avgWait: '18.1 hrs',
      oldestFile: 'AICTE-2026-0007',
      primaryBlocker: 'Emeritus faculty appointment letter validation',
      responsibleBureau: 'Regulation Bureau',
      priorityAction: 'Officer review in Tier-2 Scrutiny Queue',
      status: 'NEEDS_REVIEW',
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── 1. KPI STRIP (6 Plain Bordered Stat Boxes) ─────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#D0D5DD] p-3 rounded-[4px] space-y-1"
          >
            <span className="text-[11px] font-mono text-[#5B6472] uppercase block truncate">
              {k.label}
            </span>
            <span className="text-xl font-bold font-mono text-[#0B1F4B] block">
              {k.value}
            </span>
            <span className="text-[10px] text-[#5B6472] block truncate">
              {k.subtext}
            </span>
          </div>
        ))}
      </div>

      {/* ── 2. CHARTS SECTION (Navy + Muted Greys, Labelled Axes, No Gradients) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Volume Trend (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-[#D0D5DD] p-4 rounded-[4px] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D0D5DD] pb-2 gap-2">
            <div>
              <h3 className="text-xs font-semibold text-[#0B1F4B] uppercase tracking-wide">
                Daily Intake & Routing Volume (Last 7 Days)
              </h3>
              <p className="text-[11px] text-[#5B6472]">
                Breakdown of Auto-Cleared (≥75), Officer Scrutiny (50-74), and Deficient (&lt;50)
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-[#5B6472] font-mono">Period: 23-Oct to 29-Oct-2026</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#5B6472' }}
                  tickLine={{ stroke: '#D0D5DD' }}
                  axisLine={{ stroke: '#D0D5DD' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#5B6472' }}
                  tickLine={{ stroke: '#D0D5DD' }}
                  axisLine={{ stroke: '#D0D5DD' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D0D5DD',
                    borderRadius: '2px',
                    fontSize: '11px',
                    boxShadow: 'none',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Bar dataKey="cleared" name="Auto-Cleared (≥75)" fill="#0B1F4B" />
                <Bar dataKey="officerReview" name="Needs Review (50-74)" fill="#C99A3A" />
                <Bar dataKey="deficient" name="Deficient (<50)" fill="#B85C5C" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Score Distribution (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#D0D5DD] p-4 rounded-[4px] space-y-3">
          <div className="border-b border-[#D0D5DD] pb-2">
            <h3 className="text-xs font-semibold text-[#0B1F4B] uppercase tracking-wide">
              Trust Score Band Distribution
            </h3>
            <p className="text-[11px] text-[#5B6472]">
              Statutory Routing Thresholds: 50 & 75
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={scoreBandDistribution}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#5B6472' }}
                  tickLine={{ stroke: '#D0D5DD' }}
                  axisLine={{ stroke: '#D0D5DD' }}
                />
                <YAxis
                  type="category"
                  dataKey="band"
                  width={110}
                  tick={{ fontSize: 10, fill: '#1A1D23' }}
                  tickLine={{ stroke: '#D0D5DD' }}
                  axisLine={{ stroke: '#D0D5DD' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D0D5DD',
                    borderRadius: '2px',
                    fontSize: '11px',
                    boxShadow: 'none',
                  }}
                />
                <Bar dataKey="count" name="Applications" fill="#0B1F4B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: External Registry Latency Response */}
      <div className="bg-white border border-[#D0D5DD] p-4 rounded-[4px] space-y-3">
        <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-2">
          <div>
            <h3 className="text-xs font-semibold text-[#0B1F4B] uppercase tracking-wide">
              Verification Engine Latency (ms) vs Statutory SLA Ceiling
            </h3>
            <p className="text-[11px] text-[#5B6472]">
              Real-time response times of 6 external government verification sources
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#1F5E34] font-semibold">
            All Gateways Within Operational Tolerance
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={registryLatencyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" vertical={false} />
              <XAxis
                dataKey="source"
                tick={{ fontSize: 11, fill: '#5B6472' }}
                tickLine={{ stroke: '#D0D5DD' }}
                axisLine={{ stroke: '#D0D5DD' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#5B6472' }}
                tickLine={{ stroke: '#D0D5DD' }}
                axisLine={{ stroke: '#D0D5DD' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D0D5DD',
                  borderRadius: '2px',
                  fontSize: '11px',
                  boxShadow: 'none',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Bar dataKey="latency" name="Actual Latency (ms)" fill="#0B1F4B" />
              <Bar dataKey="target" name="SLA Ceiling (ms)" fill="#D0D5DD" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 3. BOTTLENECKS TABLE ────────────────────────────────────────── */}
      <div className="bg-white border border-[#D0D5DD] rounded-[4px] overflow-hidden">
        <div className="bg-[#F4F6F9] px-4 py-3 border-b border-[#D0D5DD] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#0B1F4B] uppercase tracking-wide">
              Operational Bottlenecks & Scrutiny Delay Log
            </h3>
            <p className="text-[11px] text-[#5B6472]">
              Identified process stages where applications exceed median turnaround benchmarks
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#8A5A0B] font-bold">
            4 Active Bottlenecks Identified
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
