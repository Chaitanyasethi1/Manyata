import { useState } from 'react'
import { Bell, Calendar, AlertTriangle, Clock, CheckCircle2, Filter, Download } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

export default function AlertsRemindersPage() {
  const [filterType, setFilterType] = useState('ALL') // ALL | DEADLINE | EXPIRY | PENDING

  const alerts = [
    {
      id: 'ALT-2026-091',
      type: 'DEADLINE',
      urgency: 'HIGH',
      title: 'EoA 2026-27 Portal Submission Closes in 12 Days',
      detail: 'Mandatory final submission for Extension of Approval cycle 2026-27 closes on 15-Nov-2026 at 23:59 IST. Unsubmitted draft applications will lapse.',
      appId: 'AICTE-2026-0002',
      dueDate: '15-Nov-2026',
      daysLeft: 12,
      actionRequired: 'Complete Document Upload & Final Sign-off',
      status: 'NEEDS_REVIEW',
    },
    {
      id: 'ALT-2026-084',
      type: 'EXPIRY',
      urgency: 'CRITICAL',
      title: 'Fire Safety Certificate Expiring Within 30 Days',
      detail: 'Karnataka State Fire & Emergency Services NOC (Reg: KSFES-NOC-77821) expires on 28-Nov-2026. Renewal must be submitted to prevent deficiency capping.',
      appId: 'AICTE-2026-0002',
      dueDate: '28-Nov-2026',
      daysLeft: 25,
      actionRequired: 'Upload Renewed Fire NOC in Document Manager',
      status: 'EXPIRED',
    },
    {
      id: 'ALT-2026-079',
      type: 'PENDING',
      urgency: 'MEDIUM',
      title: 'Affiliation Order Registry Sync Pending Response',
      detail: 'Automated verification query sent to VTU Belagavi Registry on 28-Oct-2026 14:10 IST. Response queued in batch reconciliation window.',
      appId: 'AICTE-2026-0001',
      dueDate: '31-Oct-2026',
      daysLeft: 2,
      actionRequired: 'Await Automated Batch Sync (SOP 48h limit)',
      status: 'VERIFICATION_PENDING',
    },
    {
      id: 'ALT-2026-062',
      type: 'DEADLINE',
      urgency: 'CRITICAL',
      title: 'Deficiency Clarification Window: Resubmission Due',
      detail: 'Notice issued under AICTE APH 2026 Clause 4.2.1 regarding FAR land conversion documentation. Resubmission window is 15 calendar days.',
      appId: 'AICTE-2026-0005',
      dueDate: '08-Nov-2026',
      daysLeft: 5,
      actionRequired: 'Submit Form A-3 Clarification via Deficiency Desk',
      status: 'DEFICIENT',
    },
    {
      id: 'ALT-2026-044',
      type: 'EXPIRY',
      urgency: 'LOW',
      title: 'Building Occupancy Certificate Periodic Renewal',
      detail: 'BBMP Municipal Occupancy Certificate renewal inspection scheduled for Q1 2027. Maintain current ledger on record.',
      appId: 'AICTE-2026-0001',
      dueDate: '31-Mar-2027',
      daysLeft: 148,
      actionRequired: 'Informational - No Immediate Regulatory Block',
      status: 'CLEARED',
    },
  ]

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'ALL') return true
    return a.type === filterType
  })

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-[#F4F6F9] border-l-4 border-[#0B1F4B] p-4 text-xs text-[#1A1D23] flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-[#0B1F4B]">
            Regulatory Notice & Compliance Timelines
          </p>
          <p className="text-[#5B6472]">
            Statutory timelines are governed by AICTE Approval Process Handbook (APH) 2026-27. Failure to address critical expiry or deficiency notices within prescribed windows may lead to automatic rejection or de-listing of approval.
          </p>
        </div>
        <div className="text-right text-[11px] text-[#5B6472] font-mono shrink-0 pl-4">
          Time: 29-Oct-2026 16:30 IST
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Total Active Alerts</span>
          <span className="text-2xl font-semibold text-[#0B1F4B]">{alerts.length}</span>
          <span className="text-[11px] text-[#5B6472] block mt-0.5">Across 3 active files</span>
        </div>

        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Critical Deadlines (&lt; 7 Days)</span>
          <span className="text-2xl font-semibold text-[#8F2D2D]">1</span>
          <span className="text-[11px] text-[#8F2D2D] block mt-0.5">Deficiency resubmission</span>
        </div>

        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Document Expiry Notices</span>
          <span className="text-2xl font-semibold text-[#8A5A0B]">2</span>
          <span className="text-[11px] text-[#8A5A0B] block mt-0.5">1 renewal urgent</span>
        </div>

        <div className="bg-white border border-[#D0D5DD] p-3.5 rounded-[4px]">
          <span className="text-[11px] font-mono text-[#5B6472] uppercase block">Pending External Sync</span>
          <span className="text-2xl font-semibold text-[#1F3A7A]">1</span>
          <span className="text-[11px] text-[#5B6472] block mt-0.5">University Registry query</span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-[#D0D5DD] rounded-[4px]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5B6472]" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#1A1D23]">Filter Alerts:</span>
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: 'All Notices' },
              { id: 'DEADLINE', label: 'Statutory Deadlines' },
              { id: 'EXPIRY', label: 'Expiring Certificates' },
              { id: 'PENDING', label: 'Pending Verification' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 text-xs border rounded-[2px] font-medium transition-colors ${
                  filterType === f.id
                    ? 'bg-[#0B1F4B] text-white border-[#0B1F4B]'
                    : 'bg-white text-[#5B6472] border-[#D0D5DD] hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1 text-xs border border-[#D0D5DD] rounded-[2px] bg-white text-[#1A1D23] hover:bg-gray-50 font-medium"
        >
          <Download className="w-3.5 h-3.5 text-[#5B6472]" strokeWidth={1.5} />
          <span>Export Compliance Calendar</span>
        </button>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-[#D0D5DD] rounded-[4px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gov-table w-full text-left">
            <thead>
              <tr>
                <th scope="col">Notice ID & Urgency</th>
                <th scope="col">Application Ref</th>
                <th scope="col">Subject & Statutory Context</th>
                <th scope="col">Due Date</th>
                <th scope="col">Days Left</th>
                <th scope="col">Current State</th>
                <th scope="col">Action Required</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map(alert => (
                <tr key={alert.id}>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B1F4B]">{alert.id}</span>
                      {alert.urgency === 'CRITICAL' && (
                        <span className="text-[10px] bg-[#F6E7E7] text-[#8F2D2D] border border-[#B85C5C] px-1.5 py-0.2 rounded-[2px] font-bold">
                          CRITICAL
                        </span>
                      )}
                      {alert.urgency === 'HIGH' && (
                        <span className="text-[10px] bg-[#FBF3DC] text-[#8A5A0B] border border-[#C99A3A] px-1.5 py-0.2 rounded-[2px] font-bold">
                          HIGH
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="font-mono text-xs text-[#1F3A7A] whitespace-nowrap">
                    {alert.appId}
                  </td>
                  <td className="max-w-md">
                    <p className="font-semibold text-xs text-[#1A1D23]">{alert.title}</p>
                    <p className="text-[12px] text-[#5B6472] mt-0.5 leading-relaxed">{alert.detail}</p>
                  </td>
                  <td className="font-mono text-xs text-[#1A1D23] whitespace-nowrap">
                    {alert.dueDate}
                  </td>
                  <td className="whitespace-nowrap font-mono text-xs">
                    <span className={alert.daysLeft <= 7 ? 'text-[#8F2D2D] font-bold' : 'text-[#1A1D23]'}>
                      {alert.daysLeft} days
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    <StatusBadge status={alert.status} />
                  </td>
                  <td className="text-xs font-medium text-[#1F3A7A]">
                    {alert.actionRequired}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
