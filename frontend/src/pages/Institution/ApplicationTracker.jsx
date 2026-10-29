import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_APPLICATIONS } from '../../data/mockData.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { FileText, ChevronRight, Eye, Download, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

export default function ApplicationTracker() {
  const [selectedApp, setSelectedApp] = useState(MOCK_APPLICATIONS[0])

  return (
    <div className="space-y-6">
      {/* ── APPLICATION TRACKER TABLE ───────────────────────────────────────── */}
      <div className="gov-card p-0 overflow-hidden">
        <div className="p-3 bg-[#F8FAFC] border-b border-[#D0D5DD] flex items-center justify-between">
          <span className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider">
            Active Scrutiny Dossiers ({MOCK_APPLICATIONS.length})
          </span>
          <span className="text-xs text-[#5B6472]">Click row to inspect milestone progression</span>
        </div>

        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th scope="col">Application ID</th>
                <th scope="col">Category</th>
                <th scope="col">Submitted On</th>
                <th scope="col">Status</th>
                <th scope="col">Composite Trust Score</th>
                <th scope="col">SLA Timer</th>
                <th scope="col">Regulatory Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_APPLICATIONS.map((app) => {
                const isSelected = selectedApp.applicationId === app.applicationId
                return (
                  <tr
                    key={app.applicationId}
                    onClick={() => setSelectedApp(app)}
                    className={`cursor-pointer ${isSelected ? '!bg-[#EDF2F7] font-semibold' : ''}`}
                  >
                    <td className="font-mono text-[#0B1F4B] font-bold">
                      {app.applicationId}
                    </td>
                    <td className="text-xs font-medium text-[#1A1D23]">{app.category}</td>
                    <td className="font-mono text-xs text-[#5B6472]">{app.submittedOn}</td>
                    <td>
                      <StatusBadge status={app.status} size="xs" />
                    </td>
                    <td className="font-mono text-xs">
                      <span className="font-bold text-[#0B1F4B]">{app.trustScore}</span> / 100
                    </td>
                    <td className="font-mono text-xs text-[#5B6472]">
                      <span className="text-[#0B1F4B] font-semibold">{app.slaDaysRemaining} days</span> remaining
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/institution/report/${app.applicationId}`}
                          className="gov-btn gov-btn-muted !text-xs !py-0.5 !px-2"
                          title="View Full Validation Report"
                        >
                          <Eye className="w-3 h-3" strokeWidth={1.5} />
                          <span>Report</span>
                        </Link>

                        {app.status === 'DEFICIENT' && (
                          <Link
                            to={`/institution/deficiency/${app.applicationId}`}
                            className="gov-btn gov-btn-danger !text-xs !py-0.5 !px-2"
                            title="View Official Deficiency Notice"
                          >
                            <span>Notice</span>
                          </Link>
                        )}

                        {app.status === 'CLEARED' && (
                          <Link
                            to={`/institution/clearance/${app.applicationId}`}
                            className="gov-btn gov-btn-primary !text-xs !py-0.5 !px-2"
                            title="Download Clearance Package"
                          >
                            <span>Clearance</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MILESTONE STEPPER FOR SELECTED APPLICATION ──────────────────────── */}
      {selectedApp && (
        <div className="gov-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D0D5DD] gap-2">
            <div>
              <span className="text-[11px] font-mono text-[#5B6472] uppercase">
                Milestone Progress Tracker
              </span>
              <h2 className="text-sm font-semibold text-[#0B1F4B] mt-0.5">
                Application {selectedApp.applicationId} · {selectedApp.institutionName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5B6472]">Triage:</span>
              <span className="text-xs font-mono font-semibold text-[#0B1F4B] bg-[#F0F4FA] px-2 py-0.5 rounded-[2px] border border-[#D0D5DD]">
                {selectedApp.route}
              </span>
            </div>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
            {[
              {
                stage: '1. Intake',
                name: 'Intake Completed',
                status: 'DONE',
                desc: 'All 5 statutory documents received & timestamped.',
              },
              {
                stage: '2. OCR & Rules',
                name: 'AI Extraction',
                status: 'DONE',
                desc: 'Text, tables, and land boundaries extracted.',
              },
              {
                stage: '3. Anomaly Scan',
                name: 'ELA & Forgery Check',
                status: 'DONE',
                desc: selectedApp.status === 'DEFICIENT' ? 'Integrity anomaly detected.' : 'No critical tamper detected.',
              },
              {
                stage: '4. Registry Sync',
                name: 'Source Cross-Check',
                status: selectedApp.status === 'NEEDS_REVIEW' ? 'PENDING' : 'DONE',
                desc: 'External revenue & fire database lookup.',
              },
              {
                stage: '5. Scrutiny Output',
                name: 'Decision Dossier',
                status: selectedApp.status === 'CLEARED' ? 'CLEARED' : selectedApp.status === 'DEFICIENT' ? 'DEFICIENT' : 'IN_REVIEW',
                desc: selectedApp.status === 'CLEARED' ? 'Clearance issued' : selectedApp.status === 'DEFICIENT' ? 'Deficiency issued' : 'With Scrutiny Officer',
              },
            ].map((step, idx) => {
              const isDone = step.status === 'DONE' || step.status === 'CLEARED'
              const isAlert = step.status === 'DEFICIENT'
              const isPending = step.status === 'PENDING' || step.status === 'IN_REVIEW'

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-[2px] border text-xs space-y-1.5 ${
                    isAlert
                      ? 'bg-[#FDF2F2] border-[#F6B8B8] text-[#8F2D2D]'
                      : isDone
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#1F5E34]'
                      : 'bg-[#FFFBEB] border-[#FDE68A] text-[#8A5A0B]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold">
                    <span>{step.stage}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#138808]" strokeWidth={1.5} />
                    ) : isAlert ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#8F2D2D]" strokeWidth={1.5} />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-[#8A5A0B]" strokeWidth={1.5} />
                    )}
                  </div>
                  <p className="font-bold">{step.name}</p>
                  <p className="text-[11px] leading-tight opacity-90">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
