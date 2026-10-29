import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'

export default function NotFound() {
  return (
    <div>
      <Breadcrumbs items={[{ label: '404 - Page Not Found' }]} />

      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-block p-4 bg-[#F0F4FA] border border-[#D0D5DD] rounded-[2px] font-mono text-2xl font-bold text-[#0B1F4B]">
          404: RESOURCE NOT LOCATED
        </div>

        <h1 className="text-xl font-semibold text-[#0B1F4B]">
          The requested URL does not correspond to an active portal route.
        </h1>

        <p className="text-xs text-[#5B6472] max-w-md mx-auto leading-relaxed">
          Please verify the web address or navigate using the official government navigation links provided above.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link to="/" className="gov-btn gov-btn-primary">
            <Home className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Return to Home</span>
          </Link>
          <button onClick={() => window.history.back()} className="gov-btn gov-btn-secondary">
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Previous Page</span>
          </button>
        </div>
      </div>
    </div>
  )
}
