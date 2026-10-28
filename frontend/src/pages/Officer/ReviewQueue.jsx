import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listApplications, listAlerts, getStats } from '../../api.js'
import {
  ShieldCheck,
  Search,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  FileCheck,
  Sliders,
  ExternalLink,
  Users,
  Building,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'

export default function ReviewQueue({ role, setRole }) {
  const navigate = useNavigate()
  const [apps, setApps] = useState([])
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

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

  // Augmented list combining backend DB apps + mockup demo rows for complete fidelity
  const displayApps = [
    ...apps.map((a, idx) => {
      const score = a.trust_score ?? 85
      let route = 'Fast track'
      let stage = 'Routed'
      let statusTag = 'Verified'
      if (score < 50 || a.status === 'DEFICIENT') {
        route = 'Senior scrutiny'
        stage = 'Forgery check'
        statusTag = 'Flagged'
      } else if (score < 75 || a.status === 'UNDER_REVIEW') {
        route = 'Standard review'
        stage = 'Compliance check'
        statusTag = 'Needs review'
      }
      return {
        id: a.application_id,
        institution: a.institution_name,
        updated: a.updated_at ? `${new Date(a.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '10 min ago',
        stage: stage,
        score: score,
        route: route,
        statusTag: statusTag,
      }
    }),
    // Include mockup placeholder rows if needed to populate rich list
    {
      id: 'APP-0412',
      institution: 'Sample Institute of Technology',
      updated: '2 min ago',
      stage: 'Routed',
      score: 91,
      route: 'Fast track',
      statusTag: 'Verified',
    },
    {
      id: 'APP-0413',
      institution: 'Example College of Engineering',
      updated: '9 min ago',
      stage: 'Compliance check',
      score: 74,
      route: 'Standard review',
      statusTag: 'Needs review',
    },
    {
      id: 'APP-0414',
      institution: 'Demo Institute of Management',
      updated: '14 min ago',
      stage: 'Forgery check',
      score: 38,
      route: 'Senior scrutiny',
      statusTag: 'Flagged',
    },
    {
      id: 'APP-0415',
      institution: 'Sample Polytechnic',
      updated: '21 min ago',
      stage: 'Extracting',
      score: null,
      route: 'Pending',
      statusTag: 'Processing',
    },
    {
      id: 'APP-0416',
      institution: 'Example School of Pharmacy',
      updated: '40 min ago',
      stage: 'Scored',
      score: 67,
      route: 'Standard review',
      statusTag: 'Needs review',
    },
  ]

  // Filter based on search query
  const filteredApps = displayApps.filter((a) =>
    a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.institution.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const defaultAlerts = [
    {
      level: 'HIGH',
      time: '14 min ago',
      title: 'Possible tampering detected in safety NOC',
      appId: 'APP-0414',
      desc: 'Land deed and Fire NOC signature / seal variance detected by ELA.',
    },
    {
      level: 'MEDIUM',
      time: '35 min ago',
      title: 'Fee statement does not match the norms it claims',
      appId: 'APP-0413',
      desc: 'Tuition disclosure discrepancy against AICTE Chapter IV ceiling.',
    },
    {
      level: 'MEDIUM',
      time: '1 h ago',
      title: 'Faculty list missing, application incomplete',
      appId: 'APP-0416',
      desc: 'Mandatory faculty appointment roster not attached.',
    },
    {
      level: 'LOW',
      time: '3 h ago',
      title: 'Review deadline approaching',
      appId: 'APP-0409',
      desc: 'Officer scrutiny SLA expires in under 4 hours.',
    },
    {
      level: 'LOW',
      time: '5 h ago',
      title: 'Documents re-uploaded by institution',
      appId: 'APP-0411',
      desc: 'Applicant submitted updated Fire NOC certificate.',
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#1E293B] font-sans antialiased">
      {/* ── LEFT DARK NAVY SIDEBAR ─────────────────────────────────── */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
        <div>
          {/* Logo & Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight leading-none">
                TrustDesk
              </h1>
              <p className="text-xs text-slate-400 mt-1">Application validation</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'applications'
                  ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Applications</span>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                248
              </span>
            </button>

            <button
              onClick={() => setActiveTab('document_review')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'document_review'
                  ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4" />
                <span>Document review</span>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                37
              </span>
            </button>

            <button
              onClick={() => setActiveTab('compliance')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'compliance'
                  ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4" />
                <span>Compliance</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'alerts'
                  ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <span>Alerts</span>
              </div>
              <span className="text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full font-mono font-bold">
                9
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'reports'
                  ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Reports and outputs</span>
              </div>
            </button>
          </nav>

          {/* Quick Portal Jump Buttons */}
          <div className="px-4 mt-6">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Switch Portal View
            </p>
            <div className="space-y-1.5">
              <button
                onClick={() => { setRole('admin'); navigate('/admin') }}
                className="w-full text-left px-2.5 py-1.5 text-xs rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-between"
              >
                <span>🏛️ AICTE Admin HQ</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => { setRole('institution'); navigate('/institution') }}
                className="w-full text-left px-2.5 py-1.5 text-xs rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-between"
              >
                <span>🎓 Institution Portal</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          Design mock with sample data. Names, IDs and numbers are placeholders.
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Applications overview
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Every application from upload to decision-ready output, in one view.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID or institution"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Officer Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                RO
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-gray-800 leading-tight">Reviewing officer</p>
                <p className="text-[11px] text-gray-400">Scrutiny desk</p>
              </div>
            </div>
          </div>
        </header>

        {/* Body Content */}
        <div className="p-8 space-y-7 max-w-7xl">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-gray-500">Applications in pipeline</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2 font-mono">248</p>
              <p className="text-xs text-gray-400 mt-1">Across 7 stages</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-gray-500">Awaiting officer review</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2 font-mono">37</p>
              <p className="text-xs text-gray-400 mt-1">Routed to a review path</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-gray-500">Forgery flags</p>
              <p className="text-3xl font-extrabold text-red-600 mt-2 font-mono">12</p>
              <p className="text-xs text-gray-400 mt-1">Need senior scrutiny</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-gray-500">Deadline alerts</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2 font-mono">9</p>
              <p className="text-xs text-gray-400 mt-1">Review time running short</p>
            </div>
          </div>

          {/* 7-Stage Pipeline Tracker Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-700 tracking-wide">
                Where applications are now
              </h3>
              <span className="text-xs text-gray-400">Count of applications at each stage</span>
            </div>
            <div className="grid grid-cols-7 gap-3 text-center">
              {[
                { count: 24, label: 'Uploaded' },
                { count: 31, label: 'Extracting' },
                { count: 28, label: 'Authenticating' },
                { count: 19, label: 'Forgery check' },
                { count: 42, label: 'Compliance check' },
                { count: 36, label: 'Scored' },
                { count: 68, label: 'Routed' },
              ].map((stage, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-1">
                  <p className="text-lg font-bold text-gray-800 font-mono">{stage.count}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">{stage.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Column Split: Applications Table (65%) & Alerts (35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Applications Table (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Applications</h3>
                <Link to="/officer" className="text-xs text-blue-600 hover:underline font-medium">
                  View all
                </Link>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-400 font-semibold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Institution</th>
                      <th className="px-4 py-3">Stage</th>
                      <th className="px-4 py-3">Trust Score</th>
                      <th className="px-4 py-3">Route</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredApps.map((a) => {
                      const scoreVal = a.score
                      const scoreColor =
                        scoreVal === null
                          ? 'bg-gray-200 text-gray-400'
                          : scoreVal >= 75
                          ? 'bg-emerald-500'
                          : scoreVal >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'

                      const routeBadge =
                        a.route === 'Fast track'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : a.route === 'Senior scrutiny'
                          ? 'bg-red-50 text-red-700 border-red-200 font-semibold'
                          : a.route === 'Standard review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-gray-50 text-gray-500 border-gray-200'

                      return (
                        <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium text-blue-600">
                            <Link to={`/officer/${a.id}`} className="hover:underline">
                              {a.id}
                            </Link>
                          </td>
                          <td className="px-4 py-3 max-w-[190px]">
                            <p className="font-semibold text-gray-800 truncate">{a.institution}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Updated {a.updated}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 font-medium">
                            {a.stage}
                          </td>
                          <td className="px-4 py-3">
                            {scoreVal !== null ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-mono text-gray-900 w-6">
                                  {scoreVal}
                                </span>
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${scoreColor} rounded-full`}
                                    style={{ width: `${scoreVal}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-300 font-mono">--</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 text-[10px] rounded border ${routeBadge}`}>
                              {a.route}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to={`/officer/${a.id}`}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Inspect
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Alerts Panel (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-xs p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-600" />
                  Alerts
                </h3>
                <button className="text-xs text-blue-600 hover:underline font-medium">
                  View all
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {defaultAlerts.map((alt, idx) => {
                  const badgeStyle =
                    alt.level === 'HIGH'
                      ? 'bg-red-600 text-white'
                      : alt.level === 'MEDIUM'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-400 text-white'

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50/70 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeStyle}`}>
                          {alt.level}
                        </span>
                        <span className="text-[11px] text-gray-400">{alt.time}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 leading-snug">
                        {alt.title}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        {alt.desc}
                      </p>
                      <div className="mt-2 pt-1.5 border-t border-gray-200/50 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-blue-600 font-medium">
                          {alt.appId}
                        </span>
                        <Link
                          to={`/officer/${alt.appId}`}
                          className="text-gray-400 hover:text-blue-600 flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
