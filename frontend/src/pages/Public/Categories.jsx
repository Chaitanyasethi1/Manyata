import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'
import { FileText, CheckCircle2 } from 'lucide-react'

export default function Categories() {
  const breadcrumbs = [{ label: 'Application Categories' }]

  const CATEGORIES = [
    {
      code: 'CAT-EOA',
      title: 'Extension of Approval (EoA)',
      subtitle: 'Annual continuation for existing approved technical institutions.',
      normClause: 'Chapter II, AICTE Approval Process Handbook 2026-27',
      slaDays: '21 Days',
      docs: [
        { name: 'Continuation Affidavit on Stamp Paper', mandatory: true },
        { name: 'Fire Safety Certificate / Current NOC', mandatory: true },
        { name: 'Faculty Cadre & EPF Electronic Challan', mandatory: true },
        { name: 'University Affiliation Continuation Order', mandatory: true },
        { name: 'Annual Audited Financial Statement', mandatory: true },
      ],
    },
    {
      code: 'CAT-INTAKE',
      title: 'Increase in Intake / Additional Division',
      subtitle: 'Expansion of approved intake in existing accredited programmes.',
      normClause: 'Chapter III, Section 3.2, AICTE Handbook',
      slaDays: '30 Days',
      docs: [
        { name: 'NBA Accreditation Certificate (valid for programme)', mandatory: true },
        { name: 'Additional Instructional Area Proof (Sq. Mtr.)', mandatory: true },
        { name: 'Additional Faculty Appointment Letters & Joined Roster', mandatory: true },
        { name: 'State Government / Affiliating University NOC', mandatory: true },
        { name: 'Updated Building Occupancy Certificate', mandatory: true },
      ],
    },
    {
      code: 'CAT-NEWPROG',
      title: 'Introduction of New Course / Programme',
      subtitle: 'Starting emerging areas (e.g. AI & Data Science, Robotics, Cyber Security).',
      normClause: 'Chapter IV, Section 4.1, AICTE Handbook',
      slaDays: '30 Days',
      docs: [
        { name: 'Board of Governors / Trust Resolution', mandatory: true },
        { name: 'Curriculum & Syllabi Approval by University', mandatory: true },
        { name: 'Specialized Laboratory Equipment Invoice & Stock Register', mandatory: true },
        { name: 'Readiness Affidavit by Head of Institution', mandatory: true },
        { name: 'University Affiliation Recommendation Letter', mandatory: true },
      ],
    },
    {
      code: 'CAT-SITE',
      title: 'Change of Site / Location of Institution',
      subtitle: 'Relocation to newly constructed permanent campus.',
      normClause: 'Chapter VI, AICTE Handbook 2026-27',
      slaDays: '45 Days (Mandatory Physical Inspection)',
      docs: [
        { name: 'Registered Sale / Gift Deed of New Land (Min 4.0 Acres)', mandatory: true },
        { name: 'Land Use Certificate from Competent Revenue Authority', mandatory: true },
        { name: 'Approved Master Building Plan & Fire NOC', mandatory: true },
        { name: 'Structural Stability Certificate by Govt PWD / NIT / IIT', mandatory: true },
        { name: 'Bar Council / Pharmacy Council NOC (if applicable)', mandatory: false },
      ],
    },
  ]

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="border-b border-[#D0D5DD] pb-4">
          <span className="text-xs font-semibold text-[#0B1F4B] uppercase tracking-wider">
            Handbook Schedules
          </span>
          <h1 className="text-2xl font-semibold text-[#0B1F4B] tracking-tight mt-1">
            Application Categories & Document Schedules
          </h1>
          <p className="text-xs text-[#5B6472] mt-1 max-w-3xl leading-relaxed">
            The AICTE Approval Process Handbook 2026-27 outlines mandatory documents for each regulatory category.
            Manyata evaluates submitted PDF packets strictly against these schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((cat) => (
            <div key={cat.code} className="gov-card p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#D0D5DD]">
                  <span className="text-xs font-mono font-bold text-[#0B1F4B] bg-[#F0F4FA] px-2 py-0.5 rounded-[2px] border border-[#D0D5DD]">
                    {cat.code}
                  </span>
                  <span className="text-xs font-mono text-[#5B6472]">
                    Citizen Charter SLA: <strong>{cat.slaDays}</strong>
                  </span>
                </div>

                <h2 className="text-base font-semibold text-[#0B1F4B] mt-2">
                  {cat.title}
                </h2>
                <p className="text-xs text-[#5B6472] mt-0.5">
                  {cat.subtitle}
                </p>
                <p className="text-[11px] font-mono text-[#1F3A7A] mt-1">
                  Norm: {cat.normClause}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                  <span className="text-xs font-bold text-[#1A1D23] uppercase tracking-wider block">
                    Mandatory Document Schedule:
                  </span>
                  <ul className="text-xs text-[#5B6472] space-y-1.5 list-none p-0 m-0">
                    {cat.docs.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#138808] shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>{doc.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
