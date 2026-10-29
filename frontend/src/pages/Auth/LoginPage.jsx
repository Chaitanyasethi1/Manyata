import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  Landmark,
  School,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'

export default function LoginPage({ setRole }) {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('officer')
  const [email, setEmail] = useState('officer.scrutiny@aicte-india.org')
  const [password, setPassword] = useState('••••••••••••')
  const [loading, setLoading] = useState(false)

  const ROLES = [
    {
      id: 'officer',
      label: 'Scrutiny Officer',
      subtext: 'TrustDesk Verification Queue',
      icon: ShieldCheck,
      color: 'border-blue-600 bg-blue-50/50 text-blue-900',
      badge: 'bg-blue-100 text-blue-800',
      defaultEmail: 'officer.scrutiny@aicte-india.org',
      targetPath: '/officer',
    },
    {
      id: 'admin',
      label: 'AICTE Executive HQ',
      subtext: 'Command Dashboard & Governance',
      icon: Landmark,
      color: 'border-indigo-600 bg-indigo-50/50 text-indigo-900',
      badge: 'bg-indigo-100 text-indigo-800',
      defaultEmail: 'director.approvals@aicte-india.org',
      targetPath: '/admin',
    },
    {
      id: 'institution',
      label: 'Institutional Applicant',
      subtext: 'College Approval & Submissions',
      icon: School,
      color: 'border-emerald-600 bg-emerald-50/50 text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800',
      defaultEmail: 'principal@apexengg.ac.in',
      targetPath: '/institution',
    },
  ]

  function selectProfile(r) {
    setSelectedRole(r.id)
    setEmail(r.defaultEmail)
  }

  function handleLogin(e) {
    if (e) e.preventDefault()
    setLoading(true)
    const active = ROLES.find((r) => r.id === selectedRole) || ROLES[0]
    setRole(active.id)
    setTimeout(() => {
      navigate(active.targetPath)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-[#07172B] text-slate-200 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* ── TOP HEADER ────────────────────────────────────────────── */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80">
        <Link
          to="/"
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-400 text-[#07172B] font-black text-xs flex items-center justify-center">
            AICTE
          </div>
          <span className="text-xs font-bold text-white tracking-tight">Manyata Portal</span>
        </div>
      </header>

      {/* ── CENTER LOGIN CARD ─────────────────────────────────────── */}
      <div className="max-w-md w-full mx-auto px-6 py-10">
        <div className="bg-[#0B1E36] border border-blue-900/50 rounded-2xl p-7 shadow-2xl shadow-black/40">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Sign in to AICTE Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your authorization role to enter the verification grid
            </p>
          </div>

          {/* 1-Click Role Profiles Switcher */}
          <div className="space-y-2 mb-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Role Profile
            </p>
            {ROLES.map((r) => {
              const Icon = r.icon
              const isSelected = selectedRole === r.id
              return (
                <div
                  key={r.id}
                  onClick={() => selectProfile(r)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600/15 text-white ring-1 ring-blue-500/50'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {r.label}
                      </p>
                      <p className="text-[10px] text-slate-400">{r.subtext}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Credentials Inputs (Pre-filled for Hackathon demo) */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Official Email ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Access Token / Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Quick Demo Tag */}
            <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-900/60 text-[11px] text-blue-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                SIH26261 Evaluator Pass Enabled
              </span>
              <span className="text-[10px] bg-blue-900/60 text-blue-200 px-1.5 py-0.5 rounded font-mono">
                Active
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-[#07172B] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <span>Authenticating credentials...</span>
              ) : (
                <>
                  <span>Sign In & Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-slate-800/80">
        All India Council for Technical Education · Ministry of Education, Govt of India
      </footer>
    </div>
  )
}
