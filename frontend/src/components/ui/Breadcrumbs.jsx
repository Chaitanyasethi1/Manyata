import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="bg-[#EDF2F7] border-b border-[#D0D5DD] px-4 py-2 text-xs text-[#5B6472]">
      <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-1.5">
        <Link to="/" className="text-[#1F3A7A] hover:underline flex items-center gap-1 font-medium">
          <Home className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Home</span>
        </Link>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <div key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-[#98A2B3] shrink-0" strokeWidth={1.5} />
              {isLast || !item.to ? (
                <span className="font-semibold text-[#1A1D23]" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="text-[#1F3A7A] hover:underline font-medium">
                  {item.label}
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
