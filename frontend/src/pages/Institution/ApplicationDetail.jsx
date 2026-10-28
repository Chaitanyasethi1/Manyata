import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getApplication, getResult,
  downloadClearance, downloadDeficiency, listReports,
} from '../../api.js'
import StatusBadge from '../../components/StatusBadge.jsx'

function ScoreBar({ label, value }) {
  const pct = Math.max(0, Math.min(100, value ?? 0))
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{pct.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function ApplicationDetail() {
  const { appId }         = useParams()
  const [app,     setApp] = useState(null)
  const [result,  setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dlLoading, setDlLoading] = useState('')

  useEffect(() => {
    Promise.all([
      getApplication(appId),
      getResult(appId).catch(() => null),
    ]).then(([appRes, resRes]) => {
      setApp(appRes.data)
      setResult(resRes?.data ?? null)
    }).finally(() => setLoading(false))
  }, [appId])

  async function handleDownload(type) {
    setDlLoading(type)
    try {
      const fn   = type === 'clearance' ? downloadClearance : downloadDeficiency
      const { data } = await fn(appId)
      downloadBlob(data, `${type}_${appId}.pdf`)
    } catch (e) {
      alert(e.response?.data?.detail || 'Download failed.')
    } finally {
      setDlLoading('')
    }
  }

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>
  if (!app)    return <p className="text-sm text-red-500">Application not found.</p>

  const modules = result?.result?.modules ?? []
  const allFlags = modules.flatMap(m =>
    (m.flags ?? []).map(f => ({ ...f, module: m.module }))
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-gray-400">{app.application_id}</p>
            <h2 className="text-lg font-bold mt-0.5">{app.institution_name}</h2>
            <p className="text-sm text-gray-500 mt-1">{app.contact_email}</p>
          </div>
          <StatusBadge status={app.status} />
        </div>
        <div className="mt-3 flex gap-3 text-xs text-gray-400">
          <span>Submitted: {new Date(app.created_at).toLocaleString()}</span>
          <span>·</span>
          <span>Updated: {new Date(app.updated_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Scores */}
      {result && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-sm mb-3">Validation Scores</h3>
          <ScoreBar label="Trust Score (Weighted)"  value={result.trust_score} />
          <ScoreBar label="Authenticity"            value={result.authenticity_score} />
          <ScoreBar label="Forgery Detection"       value={result.forgery_score} />
          <ScoreBar label="Compliance"              value={result.compliance_score} />
          {result.has_critical_flag && (
            <p className="text-xs text-red-600 mt-2">
              ⚠ Critical flag detected — score capped at 74
            </p>
          )}
        </div>
      )}

      {/* Flags */}
      {allFlags.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-sm mb-3">Flags</h3>
          <div className="space-y-2">
            {allFlags.map((f, i) => (
              <div key={i}
                className="flex items-start gap-3 text-sm border-l-4 pl-3 py-1
                  border-gray-300"
                style={{
                  borderColor:
                    f.severity === 'critical' ? '#dc2626' :
                    f.severity === 'high'     ? '#d97706' :
                    f.severity === 'medium'   ? '#2563eb' : '#9ca3af'
                }}
              >
                <span className="font-mono text-xs text-gray-400 mt-0.5 w-20 shrink-0">
                  {f.id}
                </span>
                <span className="text-xs font-bold uppercase text-gray-500 w-16 shrink-0">
                  {f.severity}
                </span>
                <div>
                  <p>{f.message}</p>
                  {f.clause && (
                    <p className="text-xs text-gray-400 mt-0.5">{f.clause}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-sm mb-3">Uploaded Documents</h3>
        <div className="space-y-2">
          {app.documents.map((d) => (
            <div key={d.id}
              className="flex items-center justify-between text-sm
                         border border-gray-100 rounded px-3 py-2">
              <div>
                <span className="font-medium">{d.original_name}</span>
                <span className="ml-2 text-xs text-gray-400">{d.doc_type}</span>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {d.sha256.slice(0, 12)}…
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Report downloads */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-sm mb-3">Reports</h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleDownload('clearance')}
            disabled={app.status !== 'CLEARED' || dlLoading === 'clearance'}
            className="text-sm px-4 py-2 rounded bg-green-600 text-white
                       disabled:opacity-40"
          >
            {dlLoading === 'clearance' ? 'Generating…' : '↓ Clearance Package'}
          </button>
          <button
            onClick={() => handleDownload('deficiency')}
            disabled={app.status !== 'DEFICIENT' || dlLoading === 'deficiency'}
            className="text-sm px-4 py-2 rounded bg-red-600 text-white
                       disabled:opacity-40"
          >
            {dlLoading === 'deficiency' ? 'Generating…' : '↓ Deficiency Report'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Download buttons are active only when application is in the
          corresponding final status.
        </p>
      </div>
    </div>
  )
}
