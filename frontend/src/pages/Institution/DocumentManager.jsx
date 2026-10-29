import { useState } from 'react'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { FileText, UploadCloud, AlertTriangle, Check, RefreshCw } from 'lucide-react'

export default function DocumentManager() {
  const [docs, setDocs] = useState([
    {
      id: 'DOC-01',
      title: 'Land Ownership Registered Deed',
      category: 'Permanent Infrastructure',
      authority: 'State Revenue Department (Bhoomi)',
      expiry: 'Perpetual',
      status: 'VERIFIED',
      lastUpload: '2026-10-14',
    },
    {
      id: 'DOC-02',
      title: 'Trust / Society Registration & By-laws',
      category: 'Governance & Entity',
      authority: 'Registrar of Societies',
      expiry: '2030-03-31',
      status: 'VERIFIED',
      lastUpload: '2026-10-14',
    },
    {
      id: 'DOC-03',
      title: 'Fire Safety Certificate / NOC',
      category: 'Occupational Safety',
      authority: 'State Fire & Emergency Directorate',
      expiry: '2026-10-15', // EXPIRED!
      status: 'EXPIRED',
      lastUpload: '2026-04-12',
    },
    {
      id: 'DOC-04',
      title: 'Affiliating University Continuation Order',
      category: 'Academic Accreditation',
      authority: 'Affiliating State Technical Board',
      expiry: '2027-05-31',
      status: 'VERIFICATION_PENDING',
      lastUpload: '2026-10-14',
    },
    {
      id: 'DOC-05',
      title: 'Faculty List & Monthly EPF Electronic Challan',
      category: 'Cadre & Staffing',
      authority: 'EPFO India',
      expiry: '2026-09-30', // REQUIRES UPDATE
      status: 'NEEDS_REVIEW',
      lastUpload: '2026-10-14',
    },
  ])

  const [reuploadSuccess, setReuploadSuccess] = useState('')

  function handleReupload(docId) {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, status: 'VERIFICATION_PENDING', lastUpload: 'Today (Pending Re-Scrutiny)' }
          : d
      )
    )
    setReuploadSuccess(`Updated document for ${docId} submitted for AI re-validation.`)
    setTimeout(() => setReuploadSuccess(''), 4000)
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D0D5DD] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-[#0B1F4B]">
            Statutory Document Repository & Compliance Status
          </h2>
          <p className="text-xs text-[#5B6472]">
            Review document validity timelines, expiring clearances, and initiate re-upload for deficient records.
          </p>
        </div>
      </div>

      {reuploadSuccess && (
        <div className="gov-notice text-xs p-3" role="status">
          {reuploadSuccess}
        </div>
      )}

      {/* Required Documents Table */}
      <div className="gov-card p-0 overflow-x-auto">
        <table className="gov-table">
          <thead>
            <tr>
              <th scope="col">Doc Code</th>
              <th scope="col">Document Title</th>
              <th scope="col">Category</th>
              <th scope="col">Issuing Authority</th>
              <th scope="col">Expiry Date</th>
              <th scope="col">Last Upload</th>
              <th scope="col">Compliance Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => {
              const isExpired = d.status === 'EXPIRED'
              return (
                <tr key={d.id} className={isExpired ? '!bg-[#FDF2F2]' : ''}>
                  <td className="font-mono text-[#0B1F4B] font-bold">{d.id}</td>
                  <td className="font-medium text-[#1A1D23]">{d.title}</td>
                  <td className="text-xs text-[#5B6472]">{d.category}</td>
                  <td className="text-xs text-[#5B6472]">{d.authority}</td>
                  <td className={`font-mono text-xs ${isExpired ? 'text-[#8F2D2D] font-bold' : 'text-[#1A1D23]'}`}>
                    {d.expiry}
                  </td>
                  <td className="font-mono text-xs text-[#5B6472]">{d.lastUpload}</td>
                  <td>
                    <StatusBadge status={d.status} size="xs" />
                  </td>
                  <td>
                    <button
                      onClick={() => handleReupload(d.id)}
                      className="gov-btn gov-btn-secondary !text-xs !py-0.5 !px-2"
                      title="Upload fresh replacement PDF"
                    >
                      <UploadCloud className="w-3 h-3" strokeWidth={1.5} />
                      <span>Re-upload</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
