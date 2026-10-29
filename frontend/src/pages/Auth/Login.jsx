import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, School, Landmark, KeyRound, Lock, RotateCcw, ArrowRight, Info, CheckCircle2 } from 'lucide-react'
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'

export default function Login({ setRole }) {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('officer')
  const [identifier, setIdentifier] = useState('officer.scrutiny@aicte-india.org')
  const [password, setPassword] = useState('••••••••••••')
  const [captchaCode, setCaptchaCode] = useState('7B9M4')
  const [captchaInput, setCaptchaInput] = useState('7B9M4')
  const [error, setError] = useState('')

  const ROLES = [
    {
      id: 'officer',
      label: 'AICTE Scrutiny Officer',
      desc: 'Regulation Bureau Review Desk',
      icon: Shield,
      defaultUser: 'officer.scrutiny@aicte-india.org',
      target: '/officer',
    },
    {
      id: 'institution',
      label: 'Institution User',
      desc: 'Applicant College / Polytechnic',
      icon: School,
      defaultUser: '1-3847291048',
      target: '/institution',
    },
    {
      id: 'admin',
      label: 'Executive Admin HQ',
      desc: 'National Governance & Audit',
      icon: Landmark,
      defaultUser: 'director.approvals@aicte-india.org',
      target: '/admin',
    },
  ]

  function selectRole(r) {
    setSelectedRole(r.id)
    setIdentifier(r.defaultUser)
    setError('')
  }

  function refreshCaptcha() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    let res = ''
    for (let i = 0; i < 5; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(res)
    setCaptchaInput(res) // pre-filled for convenience in hackathon demo
  }

  function handleLogin(e) {
    e.preventDefault()
    if (!identifier.trim()) {
      setError('Please provide an official User ID or Email.')
      return
    }
    if (captchaInput.toUpperCase() !== captchaCode) {
      setError('Invalid CAPTCHA code entered. Please re-enter.')
      return
    }

    if (setRole) setRole(selectedRole)
    const active = ROLES.find((r) => r.id === selectedRole) || ROLES[0]
    navigate(active.target)
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Portal Authentication' }]} />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="border-b border-[#D0D5DD] pb-3 text-center sm:text-left">
          <span className="text-xs font-semibold text-[#0B1F4B] uppercase tracking-wider">
            AICTE Manyata Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0B1F4B] tracking-tight mt-0.5">
            Single Sign-On & Verification Authentication
          </h1>
          <p className="text-xs text-[#5B6472] mt-1">
            Access to institutional application dossier, scrutiny queues, and regulatory audit reports.
          </p>
        </div>

        {/* ── DEMO CREDENTIALS BOX FOR SIH JURY ────────────────────────────── */}
        <div className="gov-card p-4 bg-[#F8FAFC] border-[#1F3A7A] space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#D0D5DD]">
            <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#E07B00]" strokeWidth={1.5} />
              SIH 2026 Evaluator Quick-Access Profiles
            </span>
            <span className="text-[11px] font-mono text-[#138808] font-bold">Active Demo Pass</span>
          </div>
          <p className="text-xs text-[#5B6472]">
            Click any profile below to automatically populate credentials and route to the corresponding view:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {ROLES.map((r) => {
              const Icon = r.icon
              const isSelected = selectedRole === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectRole(r)}
                  className={`p-2 text-left rounded-[2px] border text-xs transition-colors flex items-start gap-2 ${
                    isSelected
                      ? 'bg-[#0B1F4B] text-white border-[#0B1F4B]'
                      : 'bg-white text-[#1A1D23] border-[#D0D5DD] hover:border-[#0B1F4B]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <span className="font-semibold block">{r.label}</span>
                    <span className={`text-[10px] block ${isSelected ? 'text-gray-300' : 'text-[#5B6472]'}`}>
                      {r.desc}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── FORM CARD ────────────────────────────────────────────────────── */}
        <form onSubmit={handleLogin} className="gov-card p-6 space-y-4">
          <div className="pb-3 border-b border-[#D0D5DD]">
            <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider">
              Selected Role: {ROLES.find((r) => r.id === selectedRole)?.label}
            </span>
          </div>

          {error && (
            <div className="gov-notice-danger text-xs p-2.5 rounded-[2px]" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="user-id" className="block text-xs font-semibold text-[#1A1D23] mb-1">
              Official User ID / Permanent Institution ID / Email
            </label>
            <input
              id="user-id"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="gov-input font-mono"
              required
            />
          </div>

          <div>
            <label htmlFor="user-pwd" className="block text-xs font-semibold text-[#1A1D23] mb-1">
              Access Token / Password
            </label>
            <input
              id="user-pwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="gov-input font-mono"
              required
            />
          </div>

          {/* CAPTCHA Row */}
          <div>
            <label htmlFor="captcha-in" className="block text-xs font-semibold text-[#1A1D23] mb-1">
              Security Code (CAPTCHA)
            </label>
            <div className="flex items-center gap-3">
              <div
                className="px-3 py-1.5 bg-[#E5E7EB] border border-[#98A2B3] text-[#0B1F4B] font-mono font-bold text-base tracking-widest select-none rounded-[2px]"
                aria-label={`CAPTCHA code: ${captchaCode}`}
              >
                {captchaCode}
              </div>

              <button
                type="button"
                onClick={refreshCaptcha}
                className="gov-btn gov-btn-muted !p-1.5"
                title="Generate New CAPTCHA"
              >
                <RotateCcw className="w-4 h-4 text-[#5B6472]" strokeWidth={1.5} />
              </button>

              <input
                id="captcha-in"
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Enter CAPTCHA"
                className="gov-input font-mono w-40"
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="gov-btn gov-btn-primary w-full !py-2.5">
              <span>Sign In to Manyata Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
            </button>
          </div>

          {/* Security Notice */}
          <div className="pt-3 border-t border-[#D0D5DD] text-[11px] text-[#5B6472] leading-tight flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-[#0B1F4B] shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>
              Role-based access control and access logging enabled in compliance with National Informatics Centre (NIC) and AICTE Cyber Directives. All IP addresses are logged.
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
