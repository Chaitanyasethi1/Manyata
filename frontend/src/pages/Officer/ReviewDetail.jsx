import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getApplication, getResult, getAuditLog,
} from '../../api.js'
import StatusBadge  from '../../components/StatusBadge.jsx'
import FlagTable    from '../../components/FlagTable.jsx'
import DecisionBar  from './DecisionBar.jsx'

function ScoreGauge({ label, value }) {
  const pct = Math.max(0, Math.min(100, value ?? 0))
  const color =
    pct >= 75 ? 'text-green-600' :
    pct >= 50 ? 'text-yellow-600' : 'text-red-600'
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{pct.toFixed(1)}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

export default function ReviewDetail() {
  const { appId }  = useParams()
  const navigate   = useNavigate()
  const [app,      setApp]    = useState(null)
  const [result,   setResult] = useState(null)
  const [audit,    setAudit]  = useState([])
  const [loading,  setLoading]= useState(true)
  const [decided,  setDecided]= useState(false)

  useEffect(() => {
    Promise.all([
      getApplication(appId),
      getResult(appId).catch(() => null),
      getAuditLog(appId).catch(() => ({ data: [] })),
    ]).then(([appRes, resRes, auditRes]) => {
      setApp(appRes.data)
      setResult(resRes?.data ?? null)
      setAudit(auditRes.data ?? [])
    }).finally(() => setLoading(false))
  }, [appId])

  function handleDecision(data) {
    setDecided(true)
    setApp(a => a ? { ...a, status: data.new_status } : a)
  }

  if (loading) return <p className="text-sm text-gray-400 py-8">Loading…</p>
  if (!app)    return <p className="text-sm text-red-500">Application not found.</p>

  const modules  = result?.result?.modules ?? []
  const allFlags = modules.flatMap(m =>
    (m.flags ?? []).map(f => ({ ...f, module: m.module }))
  )
  const isUnderReview = app.status === 'UNDER_REVIEW' && !decided

  return (
    <div className="space-y-5">

      {/* Back link */}
      <Link to="/officer"
        className="text-sm text-gray-400 hover:text-gray-700">
        ← Back to Queue
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-gray-400">{app.application_id}</p>
            <h2 className="text-lg font-bold mt-0.5">{app.institution_name}</h2>
            <p className="text-sm text-gray-500">{app.contact_email}</p>
          </div>
          <StatusBadge status={app.status} />
        </div>
      </div>

      {/* Score gauges */}
      {result && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-sm mb-4">Validation Scores</h3>
          <div className="grid grid-cols-4 gap-4 divide-x divide-gray-100">
            <ScoreGauge label="Trust Score"   value={result.trust_score} />
            <ScoreGauge label="Authenticity"  value={result.authenticity_score} />
            <ScoreGauge label="Forgery"       value={result.forgery_score} />
            <ScoreGauge label="Compliance"    value={result.compliance_score} />
          </div>
          {result.has_critical_flag && (
            <div className="mt-3 text-xs text-red-600 bg-red-50
                            border border-red-200 rounded px-3 py-2">
              ⚠ One or more <strong>critical</strong> flags detected.
              Score has been capped at 74. Immediate officer review required.
            </div>
          )}
        </div>
      )}

      {/* Flags */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-sm mb-3">
          Flags
          {allFlags.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({allFlags.length} total —{' '}
              {allFlags.filter(f => f.severity === 'critical').length} critical)
            </span>
          )}
        </h3>
        <FlagTable flags={allFlags} />
      </div>

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
              <div className="text-right">
                <p className="font-mono text-xs text-gray-400">
                  {d.sha256.slice(0, 16)}…
                </p>
                <p className="text-xs text-gray-400">
                  {(d.file_size_bytes / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision bar — only if UNDER_REVIEW and not yet decided */}
      {isUnderReview && (
        <DecisionBar appId={appId} onDecision={handleDecision} />
      )}

      {/* Post-decision message */}
      {decided && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-sm
                        text-green-800">
          ✓ Decision submitted. Application status updated to{' '}
          <strong>{app.status}</strong>.
          <button
            onClick={() => navigate('/officer')}
            className="ml-3 underline text-green-700"
          >
            Back to queue
          </button>
        </div>
      )}

      {/* Not under review message */}
      {!isUnderReview && !decided && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4
                        text-sm text-gray-500">
          This application is <strong>{app.status}</strong> — no further
          officer action required.
        </div>
      )}

      {/* Audit trail */}
      {audit.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-sm mb-3">Audit Trail</h3>
          <div className="space-y-2">
            {audit.map((e) => (
              <div key={e.id}
                className="flex gap-3 text-xs text-gray-500
                           border-l-2 border-gray-200 pl-3 py-1">
                <span className="text-gray-400 shrink-0 w-36">
                  {new Date(e.created_at).toLocaleString()}
                </span>
                <span className="font-medium text-gray-700">{e.actor}</span>
                <span className="font-mono">{e.action}</span>
                {e.from_status && (
                  <span>
                    {e.from_status} → {e.to_status}
                  </span>
                )}
                {e.comment && (
                  <span className="italic text-gray-400">"{e.comment}"</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
