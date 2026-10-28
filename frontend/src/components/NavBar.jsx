import { Link, useNavigate } from 'react-router-dom'

const ROLES = [
  { id: 'institution', label: 'Institution',  path: '/institution' },
  { id: 'officer',     label: 'Officer',       path: '/officer'     },
  { id: 'admin',       label: 'Admin',         path: '/admin'       },
]

export default function NavBar({ role, setRole }) {
  const navigate = useNavigate()

  function switchRole(r) {
    setRole(r.id)
    navigate(r.path)
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Brand */}
        <Link to="/" className="font-bold text-lg tracking-tight text-gray-800">
          AICTE Validator
          <span className="ml-2 text-xs font-normal text-gray-400">
            SIH26261 — SAMPLE
          </span>
        </Link>

        {/* Role switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => switchRole(r)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                role === r.id
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
