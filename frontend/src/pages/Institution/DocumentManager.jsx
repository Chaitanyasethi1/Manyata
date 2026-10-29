import { useState } from 'react'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import {
  FileText,
  UploadCloud,
  AlertTriangle,
  Check,
  RefreshCw,
  LayoutGrid,
  List,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  Upload
} from 'lucide-react'

export default function DocumentManager() {
  const [viewMode, setViewMode] = useState('table') // 'table' | 'cards'
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [detectedType, setDetectedType] = useState(null)
  const [reuploadSuccess, setReuploadSuccess] = useState('')

  const [docs, setDocs] = useState([
    {
      id: 'DOC-01',
      title: 'Land Ownership Registered Deed',
      category: 'Permanent Infrastructure',
      authority: 'State Revenue Department (Bhoomi)',
      expiry: 'Perpetual',
      daysLeft: 9999,
      status: 'VERIFIED',
      lastUpload: '2026-10-14',
    },
    {
      id: 'DOC-02',
      title: 'Trust / Society Registration & By-laws',
      category: 'Governance & Entity',
      authority: 'Registrar of Societies',
      expiry: '2030-03-31',
      daysLeft: 1250,
      status: 'VERIFIED',
      lastUpload: '2026-10-14',
    },
    {
      id: 'DOC-03',
      title: 'Fire Safety Certificate / NOC',
      category: 'Occupational Safety',
      authority: 'State Fire & Emergency Directorate',
      expiry: '2026-10-15',
      daysLeft: -14, // EXPIRED!
      status: 'EXPIRED',
      lastUpload: '2026-04-12',
    },
    {
      id: 'DOC-04',
      title: 'Building Occupancy & Stability Certificate',
      category: 'Structural Safety',
      authority: 'BBMP Municipal Town Planning',
      expiry: '2026-11-10',
      daysLeft: 12, // EXPIRES IN 12 DAYS!
      status: 'NEEDS_REVIEW',
      lastUpload: '2026-08-20',
    },
    {
      id: 'DOC-05',
      title: 'Affiliating University Continuation Order',
      category: 'Academic Accreditation',
      authority: 'Affiliating State Technical Board',
      expiry: '2027-05-31',
      daysLeft: 214,
      status: 'VERIFICATION_PENDING',
      lastUpload: '2026-10-14',
    },
    {
      id: 'DOC-06',
      title: 'Faculty List & Monthly EPF Electronic Challan',
      category: 'Cadre & Staffing',
      authority: 'EPFO India',
      expiry: '2026-11-20',
      daysLeft: 22,
      status: 'NEEDS_REVIEW',
      lastUpload: '2026-10-14',
    },
  ])

  function handleSimulatedDrop() {
    setIsUploading(true)
    setUploadProgress(10)
    setDetectedType(null)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            setUploadProgress(100)
            setDetectedType('Fire Safety NOC (KSFES Format A-2)')
            setDocs((dList) =>
              dList.map((d) =>
                d.id === 'DOC-03'
                  ? { ...d, status: 'VERIFICATION_PENDING', expiry: '2027-10-15', daysLeft: 350, lastUpload: 'Today (AI Validating)' }
                  : d
              )
            )
            setReuploadSuccess('Uploaded file auto-classified as KSFES Fire NOC. Cross-registry check initiated.')
            setTimeout(() => setReuploadSuccess(''), 5000)
          }, 400)
          return 90
        }
        return prev + 25
      })
    }, 200)
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER BLOCK WITH VIEW SWITCHER ─────────────────────────────────── */}
      <div className="bg-white border border-[#D0D5DD] p-5 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="gov-eyebrow text-[#0B1F4B]">STATUTORY COMPLIANCE VAULT</span>
          <h1 className="font-serif text-2xl font-semibold text-[#0B1F4B] tracking-tight mt-0.5">
            Mandatory Document Repository
          </h1>
          <p className="text-xs text-[#5B6472] mt-1 max-w-xl">
            Track certificate validity countdowns, expiring clearances, and initiate re-upload with automated AI classification.
          </p>
        </div>

        {/* Card / Table Toggle */}
        <div className="flex items-center gap-1 bg-[#F4F6F9] p-1 border border-[#D0D5DD] rounded-[4px] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[2px] transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-[#0B1F4B] shadow-xs'
                : 'text-[#5B6472] hover:text-[#1A1D23]'
            }`}
          >
            <List className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Table View</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[2px] transition-colors ${
              viewMode === 'cards'
                ? 'bg-white text-[#0B1F4B] shadow-xs'
                : 'text-[#5B6472] hover:text-[#1A1D23]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Card Grid</span>
          </button>
        </div>
      </div>

      {reuploadSuccess && (
        <div className="gov-notice text-xs p-3.5 rounded-[4px] bg-[#E6F2EA] text-[#1F5E34] border-[#4C8A62] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#1F5E34] shrink-0" />
          <span>{reuploadSuccess}</span>
        </div>
      )}

      {/* ── INTERACTIVE UPLOAD DROPZONE WITH PROGRESS RING ─────────────────── */}
      <div
        onClick={handleSimulatedDrop}
        className="gov-card p-6 rounded-[8px] border-2 border-dashed border-[#1F3A7A] bg-[#F8FAFC] hover:bg-[#F0F4FA] transition-colors cursor-pointer text-center space-y-3"
      >
        <div className="flex flex-col items-center justify-center">
          {isUploading ? (
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#E4E7EC" strokeWidth="4" fill="none" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#0B1F4B"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (125.6 * uploadProgress) / 100}
                  className="transition-all duration-200"
                />
              </svg>
              <span className="absolute font-mono text-[11px] font-bold text-[#0B1F4B]">
                {uploadProgress}%
              </span>
            </div>
          ) : (
            <div className="gov-icon-container mb-1">
              <UploadCloud className="w-5 h-5 text-[#0B1F4B]" strokeWidth={1.5} />
            </div>
          )}

          <h3 className="text-sm font-bold text-[#0B1F4B] mt-1">
            {isUploading ? 'Analyzing Document Layout & Running OCR...' : 'Click to Upload Statutory Document or Renewal Certificate'}
          </h3>
          <p className="text-xs text-[#5B6472] max-w-md mt-0.5">
            Accepts PDF format (max 10MB). Automatically runs layout classification, seal hashing, and cross-checks with state registry.
          </p>

          {detectedType && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#E6F2EA] text-[#1F5E34] border border-[#4C8A62] rounded-[2px] text-xs font-semibold animate-fade-in-rise">
              <Check className="w-3.5 h-3.5" />
              <span>Auto-Classified: {detectedType}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── VIEW MODE 1: DENSE TABLE WITH EXPIRY CHIPS ───────────────────────── */}
      {viewMode === 'table' ? (
        <div className="gov-card p-0 overflow-hidden rounded-[8px]">
          <div className="overflow-x-auto">
            <table className="gov-table w-full text-left">
              <thead>
                <tr>
                  <th scope="col">Doc Code</th>
                  <th scope="col">Document Title</th>
                  <th scope="col">Regulatory Category</th>
                  <th scope="col">Issuing Authority</th>
                  <th scope="col">Expiry / Validity</th>
                  <th scope="col">Countdown Status</th>
                  <th scope="col">Compliance Status</th>
                  <th scope="col" className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td className="font-mono text-xs font-bold text-[#0B1F4B] whitespace-nowrap">
                      {doc.id}
                    </td>
                    <td className="font-semibold text-xs text-[#1A1D23]">
                      {doc.title}
                    </td>
                    <td className="text-xs text-[#5B6472] whitespace-nowrap">
                      {doc.category}
                    </td>
                    <td className="text-xs text-[#5B6472]">
                      {doc.authority}
                    </td>
                    <td className="font-mono text-xs text-[#1A1D23] whitespace-nowrap">
                      {doc.expiry}
                    </td>
                    <td className="whitespace-nowrap font-mono text-xs">
                      {doc.daysLeft < 0 ? (
                        <span className="text-[11px] font-bold text-[#8F2D2D] bg-[#F6E7E7] px-2 py-0.5 rounded-[2px] border border-[#B85C5C]">
                          Expired
                        </span>
                      ) : doc.daysLeft <= 30 ? (
                        <span className="text-[11px] font-bold text-[#8A5A0B] bg-[#FBF3DC] px-2 py-0.5 rounded-[2px] border border-[#C99A3A]">
                          Expires in {doc.daysLeft} days
                        </span>
                      ) : doc.expiry === 'Perpetual' ? (
                        <span className="text-[11px] font-medium text-[#1F5E34]">
                          Perpetual Title
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#5B6472]">
                          Valid ({doc.daysLeft}d left)
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <button
                        onClick={handleSimulatedDrop}
                        className="gov-btn gov-btn-muted !text-xs !py-0.5 !px-2.5 hover:!bg-[#F0F4FA]"
                      >
                        <RefreshCw className="w-3 h-3" strokeWidth={1.5} />
                        <span>Re-upload</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── VIEW MODE 2: CARD GRID ─────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <div key={doc.id} className="gov-card gov-card-interactive p-4 rounded-[8px] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0B1F4B]">{doc.id}</span>
                  <StatusBadge status={doc.status} />
                </div>
                <h3 className="font-bold text-xs text-[#1A1D23] mt-2">{doc.title}</h3>
                <span className="text-[11px] text-[#5B6472] block">{doc.category}</span>
                <span className="text-[11px] text-[#1F3A7A] block font-medium mt-1">Authority: {doc.authority}</span>
              </div>

              <div className="pt-3 border-t border-[#D0D5DD] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#5B6472] block font-mono">Validity: {doc.expiry}</span>
                  {doc.daysLeft < 0 ? (
                    <span className="text-[10px] font-bold text-[#8F2D2D]">Status: Expired</span>
                  ) : doc.daysLeft <= 30 ? (
                    <span className="text-[10px] font-bold text-[#8A5A0B]">Expires in {doc.daysLeft} days</span>
                  ) : (
                    <span className="text-[10px] font-medium text-[#1F5E34]">Status: Valid</span>
                  )}
                </div>

                <button
                  onClick={handleSimulatedDrop}
                  className="gov-btn gov-btn-muted !text-xs !py-1 !px-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Update</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
