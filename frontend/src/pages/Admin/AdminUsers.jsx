import { useState } from 'react'
import { Users, ShieldCheck, Key, Lock, Filter, Search, Plus, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const users = [
    {
      id: 'USR-001',
      name: 'Dr. Aniruddha Roy',
      designation: 'Chief Technology Officer',
      bureau: 'Central Regulation Bureau',
      role: 'ADMIN',
      mfaStatus: 'HARDWARE_TOKEN',
      jurisdiction: 'National Headquarters · New Delhi',
      lastLogin: '29-Oct-2026 16:15 IST',
      status: 'ACTIVE',
    },
    {
      id: 'USR-042',
      name: 'S. K. Ramanathan',
      designation: 'Joint Director (Scrutiny)',
      bureau: 'South-Western Regional Office (SWRO)',
      role: 'OFFICER',
      mfaStatus: 'AUTHENTICATOR_APP',
      jurisdiction: 'Karnataka & Kerala',
      lastLogin: '29-Oct-2026 15:48 IST',
      status: 'ACTIVE',
    },
    {
      id: 'USR-055',
      name: 'P. V. Meenakshi',
      designation: 'Deputy Director (Inspection)',
      bureau: 'Southern Regional Office (SRO)',
      role: 'OFFICER',
      mfaStatus: 'AUTHENTICATOR_APP',
      jurisdiction: 'Tamil Nadu & Puducherry',
      lastLogin: '29-Oct-2026 14:22 IST',
      status: 'ACTIVE',
    },
    {
      id: 'USR-089',
      name: 'Vikramjit Singh',
      designation: 'Regional Officer (NRO)',
      bureau: 'Northern Regional Office',
      role: 'OFFICER',
      mfaStatus: 'AUTHENTICATOR_APP',
      jurisdiction: 'Punjab, Haryana, HP, J&K',
      lastLogin: '28-Oct-2026 19:10 IST',
      status: 'ACTIVE',
    },
    {
      id: 'USR-120',
      name: 'Greenfield Polytechnic Admin',
      designation: 'Authorized Principal / Registrar',
      bureau: 'Institutional Applicant Entity',
      role: 'INSTITUTION',
      mfaStatus: 'SMS_OTP',
      jurisdiction: 'Institute ID: 1-3847291048',
      lastLogin: '29-Oct-2026 11:30 IST',
      status: 'ACTIVE',
    },
    {
      id: 'USR-142',
      name: 'Audit Officer (CAG Deputation)',
      designation: 'Senior Audit Officer',
      bureau: 'Comptroller & Auditor General',
      role: 'AUDITOR',
      mfaStatus: 'HARDWARE_TOKEN',
      jurisdiction: 'Statutory Compliance Audit',
      lastLogin: '27-Oct-2026 17:40 IST',
      status: 'ACTIVE',
    },
  ]

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.designation.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (roleFilter === 'ALL') return true
    return u.role === roleFilter
  })

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-[#F4F6F9] border-l-4 border-[#0B1F4B] p-4 text-xs text-[#1A1D23] flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-[#0B1F4B]">
            Role-Based Access Control (RBAC) & Privilege Separation
          </p>
          <p className="text-[#5B6472]">
            In strict compliance with GIGW 3.0 and National Informatics Centre security guidelines, access to evaluation dossiers, audit logs, and override commands is strictly segregated across institutional applicants, regional reviewing officers, and system administrators.
          </p>
        </div>
        <div className="text-right text-[11px] text-[#5B6472] font-mono shrink-0 pl-4">
          Auth: e-Pramaan / NIC-SSO
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-[#D0D5DD] rounded-[4px]">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-[#5B6472]" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#1A1D23]">Filter Role:</span>
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: 'All Users (6)' },
              { id: 'OFFICER', label: 'AICTE Officers (3)' },
              { id: 'ADMIN', label: 'Administrators (1)' },
              { id: 'INSTITUTION', label: 'Institutions (1)' },
              { id: 'AUDITOR', label: 'Auditors (1)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setRoleFilter(f.id)}
                className={`px-2.5 py-1 text-xs border rounded-[2px] font-medium transition-colors ${
                  roleFilter === f.id
                    ? 'bg-[#0B1F4B] text-white border-[#0B1F4B]'
                    : 'bg-white text-[#5B6472] border-[#D0D5DD] hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5B6472] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by name, user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 text-xs border border-[#D0D5DD] rounded-[2px] w-64 focus:outline-none focus:ring-1 focus:ring-[#0B1F4B]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#D0D5DD] rounded-[4px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gov-table w-full text-left">
            <thead>
              <tr>
                <th scope="col">User ID & Name</th>
                <th scope="col">Designation & Bureau</th>
                <th scope="col">Assigned Role</th>
                <th scope="col">MFA Hardware / Protocol</th>
                <th scope="col">Jurisdiction</th>
                <th scope="col">Last Login</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-[#0B1F4B] block">{u.id}</span>
                    <span className="font-semibold text-xs text-[#1A1D23]">{u.name}</span>
                  </td>
                  <td className="text-xs text-[#5B6472]">
                    <p className="font-medium text-[#1A1D23]">{u.designation}</p>
                    <span className="text-[11px] text-[#5B6472]">{u.bureau}</span>
                  </td>
                  <td className="whitespace-nowrap">
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-[2px] ${
                      u.role === 'ADMIN'
                        ? 'bg-[#0B1F4B] text-white'
                        : u.role === 'OFFICER'
                        ? 'bg-[#F4F6F9] text-[#1F3A7A] border border-[#1F3A7A]'
                        : u.role === 'AUDITOR'
                        ? 'bg-[#FBF3DC] text-[#8A5A0B] border border-[#C99A3A]'
                        : 'bg-[#E6F2EA] text-[#1F5E34] border border-[#4C8A62]'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="text-xs font-mono text-[#5B6472] whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-[#1F5E34]" strokeWidth={1.5} />
                      <span>{u.mfaStatus}</span>
                    </span>
                  </td>
                  <td className="text-xs text-[#5B6472]">
                    {u.jurisdiction}
                  </td>
                  <td className="font-mono text-xs text-[#5B6472] whitespace-nowrap">
                    {u.lastLogin}
                  </td>
                  <td className="whitespace-nowrap">
                    <span className="text-[10px] bg-[#E6F2EA] text-[#1F5E34] border border-[#4C8A62] px-2 py-0.5 rounded-[2px] font-semibold">
                      {u.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-right text-xs">
                    <button className="text-[#1F3A7A] hover:underline font-medium">
                      Audit Permissions
                    </button>
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
