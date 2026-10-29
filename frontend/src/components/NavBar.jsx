import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, School, Landmark, Home, LogOut, LogIn } from 'lucide-react'

const PORTALS = [
  { id: 'officer',     label: 'Officer (TrustDesk)', icon: ShieldCheck, path: '/officer'     },
  { id: 'admin',       label: 'Admin HQ',            icon: Landmark,    path: '/admin'       },
  { id: 'institution', label: 'College Portal',      icon: School,      path: '/institution' },
]

export default function NavBar({ role, setRole }) {
  const navigate = useNavigate()
  const location = useLocation()

  function switchPortal(p) {
    setRole(p.id)
    navigate(p.path)
  }

  const currentPath = location.pathname
  const isPublicPage = currentPath === '/' || currentPath === '/login'

  const activeId = currentPath.startsWith('/officer')
    ? 'officer'
    : currentPath.startsWith('/admin')
    ? 'admin'
    : currentPath.startsWith('/institution')
    ? 'institution'
    : ''

  return (
    <nav className="bg-[#0B2545] text-white border-b border-blue-900/60 shadow-md sticky top-0 z-50">
      <div className="w-full px-6 flex items-center justify-between h-14">
        {/* Brand with AICTE Emblem Branding */}
        <div className="flex items-center gap-3">
          <Link to="/" className="w-8 h-8 rounded-full bg-amber-400 text-[#0B2545] font-extrabold text-xs flex items-center justify-center shadow-inner hover:scale-105 transition-transform">
            AICTE
          </Link>
          <div>
            <Link to="/" className="font-bold text-sm tracking-tight text-white hover:text-amber-300 transition-colors flex items-center gap-2">
              <span>All India Council for Technical Education</span>
              <span className="text-[10px] bg-blue-900/90 text-blue-200 px-2 py-0.5 rounded font-mono font-medium border border-blue-700/50">
                SIH26261
              </span>
            </Link>
            <p className="text-[11px] text-blue-200/70 leading-none hidden sm:block">
              AI-Powered Application Validation, Document Authentication & Compliance Engine
            </p>
          </div>
        </div>

        {/* Navigation & Portals */}
        <div className="flex items-center gap-3">
          {/* Home Link */}
          <Link
            to="/"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentPath === '/' ? 'text-amber-400 bg-white/10' : 'text-blue-200/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          {/* 3 Portals Switcher */}
          <div className="flex items-center gap-1 bg-[#081B33] p-1 rounded-lg border border-blue-900/80">
            {PORTALS.map((p) => {
              const Icon = p.icon
              const isActive = activeId === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => switchPortal(p)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40'
                      : 'text-blue-200/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{p.label}</span>
                </button>
              )
            })}
          </div>

          {/* Login / Logout Link */}
          {isPublicPage ? (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-[#0B2545] font-bold text-xs hover:bg-amber-300 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          ) : (
            <Link
              to="/login"
              title="Sign Out to Login Page"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-red-300 hover:bg-red-950/30 text-xs font-medium transition-colors border border-transparent hover:border-red-900/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
