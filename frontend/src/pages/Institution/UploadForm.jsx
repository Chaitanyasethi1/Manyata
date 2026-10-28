import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitApplication, triggerPipeline } from '../../api.js'

const DOC_TYPES = [
  { key: 'land_deed',         label: 'Land Deed' },
  { key: 'trust_certificate', label: 'Trust / Society Certificate' },
  { key: 'faculty_list',      label: 'Faculty List' },
  { key: 'fire_noc',          label: 'Fire & Safety NOC' },
]

export default function UploadForm() {
  const navigate  = useNavigate()
  const [fields, setFields]   = useState({
    institution_name: '',
    contact_email:    '',
    total_faculty:    '',
    area_sqft:        '',
  })
  const [files,  setFiles]    = useState({})   // key → File
  const [status, setStatus]   = useState(null) // null | loading | success | error
  const [result, setResult]   = useState(null)
  const [error,  setError]    = useState('')

  function handleField(e) {
    setFields(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleFile(key, e) {
    const file = e.target.files[0]
    if (file) setFiles(f => ({ ...f, [key]: file }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setError('')

    try {
      const fd = new FormData()
      fd.append('institution_name', fields.institution_name)
      fd.append('contact_email',    fields.contact_email)
      fd.append('form_data', JSON.stringify({
        total_faculty: Number(fields.total_faculty) || null,
        area_sqft:     Number(fields.area_sqft)     || null,
      }))
      Object.values(files).forEach(f => fd.append('documents', f))

      const { data } = await submitApplication(fd)
      setResult(data)

      // Auto-trigger pipeline
      await triggerPipeline(data.application_id)
      setStatus('success')
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed.')
      setStatus('error')
    }
  }

  if (status === 'success' && result) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-4xl mb-3">✅</div>
        <h2 className="text-xl font-bold mb-1">Application Submitted</h2>
        <p className="text-gray-500 mb-1">
          Your Application ID is:
        </p>
        <p className="font-mono text-lg font-bold text-gray-800 mb-4">
          {result.application_id}
        </p>
        {result.warnings?.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800 mb-4 text-left">
            <strong>Warnings:</strong>
            <ul className="list-disc ml-4 mt-1">
              {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}
        <button
          onClick={() => navigate(`/institution/${result.application_id}`)}
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm"
        >
          Track Application →
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-4">Submit New Application</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Institution details */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
            Institution Details
          </h3>
          <div>
            <label className="block text-sm mb-1">Institution Name *</label>
            <input
              name="institution_name"
              value={fields.institution_name}
              onChange={handleField}
              required
              placeholder="e.g. Greenfield Institute of Technology (SAMPLE)"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Contact Email *</label>
            <input
              name="contact_email"
              type="email"
              value={fields.contact_email}
              onChange={handleField}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Total Faculty</label>
              <input
                name="total_faculty"
                type="number"
                value={fields.total_faculty}
                onChange={handleField}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Land Area (sq ft)</label>
              <input
                name="area_sqft"
                type="number"
                value={fields.area_sqft}
                onChange={handleField}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Document uploads */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
            Upload Documents
          </h3>
          <p className="text-xs text-gray-400">
            PDF, JPEG, PNG, TIFF — max 10 MB each
          </p>
          {DOC_TYPES.map((dt) => (
            <div key={dt.key}>
              <label className="block text-sm mb-1">
                {dt.label}
                {files[dt.key] && (
                  <span className="ml-2 text-green-600 text-xs">✓ {files[dt.key].name}</span>
                )}
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
                onChange={(e) => handleFile(dt.key, e)}
                className="block text-sm text-gray-500
                           file:mr-3 file:py-1 file:px-3
                           file:rounded file:border-0
                           file:text-xs file:bg-gray-100
                           file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-gray-900 text-white py-2 rounded text-sm font-medium
                     disabled:opacity-50"
        >
          {status === 'loading' ? 'Submitting…' : 'Submit Application'}
        </button>
      </form>
    </div>
  )
}
