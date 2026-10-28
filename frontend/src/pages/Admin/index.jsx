import { useEffect, useState } from 'react'
import { listApplications, listAlerts, getStats } from '../../api.js'
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileText,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Search,
  Users,
  Settings,
  ChevronRight,
  Layers,
  History,
} from 'lucide-react'
import StatusChart from './StatusChart.jsx'
import ApplicationsTable from './ApplicationsTable.jsx'
import AuditPanel from './AuditPanel.jsx'

export default function AdminPortal() {
  const [tab, setTab] = useState('overview')
  const [apps, setApps] = useState([])
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      listApplications().catch(() => ({ data: [] })),
      listAlerts().catch(() => ({ data: [] })),
      getStats().catch(() => ({ data: null })),
    ]).then(([appsRes, alertsRes, statsRes]) => {
      setApps(appsRes.data || [])
      setAlerts(alertsRes.data || [])
      setStats(statsRes.data || null)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with National Portal Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 tracking-wide uppercase">
            <span>Ministry of Education · Govt of India</span>
            <span>•</span>
            <span>National Verification Grid</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Landmark className="w-6 h-6 text-blue-700" />
            AICTE Executive Command Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time regulatory compliance monitoring, fraud prevention & approval governance
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Executive Overview', icon: Layers },
            { id: 'apps',     label: 'Applications Directory', icon: FileText },
            { id: 'audit',    label: 'Audit & Compliance Log', icon: History },
          ].map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                  tab === t.id
                    ? 'bg-white text-blue-900 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards (Matching Image 2 Mockup) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total Applications
                </p>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  Σ
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-3xl font-black text-gray-900 font-mono">1,240</p>
                <span className="text-xs text-emerald-600 font-bold flex items-center">
                  +12% <TrendingUp className="w-3 h-3 ml-0.5" />
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">vs. previous 30 days</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cleared</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-3xl font-black text-emerald-600 font-mono">860</p>
                <span className="text-xs text-emerald-600 font-bold flex items-center">
                  +18% <TrendingUp className="w-3 h-3 ml-0.5" />
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">69.4% approval velocity</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Flagged</p>
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-3xl font-black text-red-600 font-mono">210</p>
                <span className="text-xs text-red-500 font-bold">+5%</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">16.9% severe defect rate</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</p>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-3xl font-black text-amber-600 font-mono">170</p>
                <span className="text-xs text-gray-400 font-medium">+0%</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">13.7% in verification pipeline</p>
            </div>
          </div>

          {/* 3-Panel Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Status Donut & Breakdown (4 cols) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Application Status</h3>
                <p className="text-xs text-gray-400 mb-4">Live distribution across 1,240 records</p>
                <StatusChart />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-gray-100">
                <div className="p-2 bg-emerald-50/60 rounded border border-emerald-100">
                  <span className="text-emerald-700 font-bold">Cleared</span>
                  <p className="text-base font-extrabold text-emerald-900 mt-0.5 font-mono">860 (69%)</p>
                </div>
                <div className="p-2 bg-red-50/60 rounded border border-red-100">
                  <span className="text-red-700 font-bold">Flagged</span>
                  <p className="text-base font-extrabold text-red-900 mt-0.5 font-mono">210 (17%)</p>
                </div>
              </div>
            </div>

            {/* Bottlenecks List (4 cols) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Bottlenecks
                </h3>
                <button className="text-xs text-blue-600 hover:underline">View All</button>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { title: 'Missing Affiliation Letter', apps: 40, delay: '3.2 days' },
                  { title: 'Incomplete Faculty Details', apps: 21, delay: '2.8 days' },
                  { title: 'Invalid Document Format', apps: 18, delay: '2.4 days' },
                  { title: 'High-Risk Score (AI Analysis)', apps: 24, delay: '1.9 days' },
                ].map((b, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{b.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{b.apps} applications affected</p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      +{b.delay}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Escalations List (4 cols) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Escalations
                </h3>
                <button className="text-xs text-blue-600 hover:underline">View All</button>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { title: 'Repeated Document Mismatch', apps: 15, action: 'Needs Manual Review' },
                  { title: 'Suspicious Affiliation', apps: 12, action: 'Sent to Expert Panel' },
                  { title: 'Fake Document Indicators', apps: 9, action: 'Legal Verification' },
                  { title: 'Policy Violation', apps: 7, action: 'Requires Director Signoff' },
                ].map((e, i) => (
                  <div key={i} className="p-3 bg-red-50/40 rounded-lg border border-red-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-red-900">{e.title}</p>
                      <p className="text-[11px] text-red-600/80 mt-0.5">{e.action}</p>
                    </div>
                    <span className="text-xs font-bold text-red-700 font-mono">
                      {e.apps} apps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'apps' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <ApplicationsTable apps={apps} />
        </div>
      )}

      {tab === 'audit' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <AuditPanel />
        </div>
      )}
    </div>
  )
}
