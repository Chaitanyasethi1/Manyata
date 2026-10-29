import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  UploadCloud,
  Check,
  ShieldCheck,
  Info,
} from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

export default function NewApplicationWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [submittedAppId, setSubmittedAppId] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    institutionId: '1-3847291048',
    institutionName: 'Greenfield Polytechnic Institute',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    principalName: 'Prof. K. Venkatesh Gowda',
    contactEmail: 'office@greenfieldpoly.ac.in',
    category: 'Extension of Approval (EoA)',
    academicYear: '2026-27',
    proposedProgrammes: 'Diploma in Computer Engg, Diploma in Mechanical Engg',
  })

  // File Upload State with auto-classification chips and validation
  const [uploadedFiles, setUploadedFiles] = useState({
    landDeed: { name: 'land_registered_deed_2026.pdf', size: '3.4 MB', type: 'application/pdf', status: 'CLASSIFIED_OK', chip: 'Land Title Document' },
    trustCert: { name: 'trust_registration_moa.pdf', size: '1.8 MB', type: 'application/pdf', status: 'CLASSIFIED_OK', chip: 'Trust / Society MoA' },
    fireNOC: { name: 'fire_safety_noc_blr_2026.pdf', size: '2.1 MB', type: 'application/pdf', status: 'CLASSIFIED_OK', chip: 'Fire Safety Certificate' },
    affiliation: { name: 'university_affiliation_continuation.pdf', size: '1.2 MB', type: 'application/pdf', status: 'CLASSIFIED_OK', chip: 'Affiliation Order' },
    facultyList: { name: 'faculty_cadre_epf_payroll.pdf', size: '4.5 MB', type: 'application/pdf', status: 'CLASSIFIED_OK', chip: 'Faculty Cadre & SFR' },
  })

  const [declarationChecked, setDeclarationChecked] = useState(false)

  function handleFileSelect(key, file) {
    if (!file) return
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    const isSizeOk = file.size <= 15 * 1024 * 1024

    setUploadedFiles((prev) => ({
      ...prev,
      [key]: {
        name: file.name,
        size: `${sizeMb} MB`,
        type: file.type || 'application/pdf',
        status: !isPdf ? 'INVALID_FORMAT' : !isSizeOk ? 'EXCEEDS_SIZE' : 'CLASSIFIED_OK',
        chip: key === 'landDeed' ? 'Land Title Document' : key === 'fireNOC' ? 'Fire Safety NOC' : 'Statutory Document',
      },
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const newId = `AICTE-2026-000${Math.floor(Math.random() * 90) + 10}`
    setSubmittedAppId(newId)
    setCurrentStep(5) // Completed confirmation step
  }

  return (
    <div className="space-y-6">
      {/* ── STEPPER HEADER ─────────────────────────────────────────────────── */}
      <div className="gov-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D0D5DD] gap-2">
          <div>
            <span className="text-[11px] font-mono text-[#5B6472] uppercase font-bold">
              Form 1-A · AICTE Approval Process
            </span>
            <h2 className="text-base font-semibold text-[#0B1F4B]">
              New Application Submission Wizard (Phase 1)
            </h2>
          </div>

          <div className="text-xs font-mono font-semibold text-[#0B1F4B]">
            Step {Math.min(currentStep, 4)} of 4
          </div>
        </div>

        {/* 4 Step Progress Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
          {[
            { num: 1, label: 'Institution Details' },
            { num: 2, label: 'Application Category' },
            { num: 3, label: 'Document Upload' },
            { num: 4, label: 'Review & Submit' },
          ].map((s) => {
            const isActive = currentStep === s.num
            const isCompleted = currentStep > s.num
            return (
              <div
                key={s.num}
                className={`p-2 rounded-[2px] border flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#0B1F4B] text-white border-[#0B1F4B] font-semibold'
                    : isCompleted
                    ? 'bg-[#E6F2EA] text-[#1F5E34] border-[#4C8A62]'
                    : 'bg-[#F8FAFC] text-[#5B6472] border-[#D0D5DD]'
                }`}
              >
                <span className="w-5 h-5 rounded-[2px] bg-white/20 font-mono text-[11px] flex items-center justify-center font-bold">
                  {isCompleted ? '✓' : s.num}
                </span>
                <span className="truncate">{s.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── STEP 1: INSTITUTION DETAILS ────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="gov-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0B1F4B] uppercase tracking-wider pb-2 border-b border-[#D0D5DD]">
            1. Applicant Entity Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1D23] mb-1">
                AICTE Permanent Institution ID
              </label>
              <input
                type="text"
                value={formData.institutionId}
                onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                className="gov-input font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1D23] mb-1">
                Full Registered Institution Name
              </label>
              <input
                type="text"
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                className="gov-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1D23] mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="gov-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1D23] mb-1">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="gov-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1D23] mb-1">
                Head of Institution (Principal / Director)
              </label>
              <input
                type="text"
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="gov-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1D23] mb-1">
                Official Registered Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="gov-input font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#D0D5DD] flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="gov-btn gov-btn-primary"
            >
              <span>Proceed to Category Selection</span>
              <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: APPLICATION CATEGORY ───────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="gov-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0B1F4B] uppercase tracking-wider pb-2 border-b border-[#D0D5DD]">
            2. Application Regulatory Category & Academic Year
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1D23] mb-1">
                Statutory Regulatory Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="gov-select"
              >
                <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
                <option value="Increase in Intake / Additional Division">Increase in Intake / Additional Division</option>
                <option value="Introduction of New Course / Programme">Introduction of New Course / Programme</option>
                <option value="Change of Site / Location">Change of Site / Location</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1D23] mb-1">Academic Year</label>
              <input
                type="text"
                value={formData.academicYear}
                readOnly
                className="gov-input bg-gray-100 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1A1D23] mb-1">
                Programmes Covered in this Application
              </label>
              <textarea
                rows={2}
                value={formData.proposedProgrammes}
                onChange={(e) => setFormData({ ...formData, proposedProgrammes: e.target.value })}
                className="gov-textarea text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#D0D5DD] flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="gov-btn gov-btn-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={1.5} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="gov-btn gov-btn-primary"
            >
              <span>Proceed to Document Upload</span>
              <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: DOCUMENT UPLOADER ───────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="gov-card p-6 space-y-4">
          <div className="pb-2 border-b border-[#D0D5DD] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B1F4B] uppercase tracking-wider">
              3. Statutory Document Packet Upload
            </h3>
            <span className="text-xs text-[#5B6472]">Format: PDF only (Max 15 MB / file)</span>
          </div>

          <p className="text-xs text-[#5B6472] leading-relaxed">
            Upload the 5 mandatory statutory documents. The engine performs automated OCR classification, resolution checks, and integrity scans upon ingestion.
          </p>

          <div className="space-y-3">
            {[
              { key: 'landDeed', title: '1. Registered Land Ownership Deed / Khasra Record', req: 'Mandatory · AICTE Clause 4.1' },
              { key: 'trustCert', title: '2. Trust Registration Certificate & Memorandum of Association', req: 'Mandatory · Societies Registration Act' },
              { key: 'fireNOC', title: '3. Fire Safety Certificate / No Objection Certificate', req: 'Mandatory · Clause 6.1 (Current Validity)' },
              { key: 'affiliation', title: '4. Affiliating University Continuation Order', req: 'Mandatory · State University Registry' },
              { key: 'facultyList', title: '5. Faculty Cadre & Salary Proof Sheet (EPF Challan)', req: 'Mandatory · Clause 5.1 (SFR Norms)' },
            ].map((doc) => {
              const file = uploadedFiles[doc.key]
              return (
                <div key={doc.key} className="p-3 bg-[#F8FAFC] border border-[#D0D5DD] rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#0B1F4B]">{doc.title}</p>
                    <span className="text-[11px] font-mono text-[#5B6472]">{doc.req}</span>

                    {file && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-[#1A1D23]">{file.name}</span>
                        <span className="text-[11px] font-mono text-[#5B6472]">({file.size})</span>
                        <span className="text-[10px] bg-[#E6F2EA] text-[#1F5E34] border border-[#4C8A62] px-1.5 py-0.2 rounded font-semibold">
                          {file.chip}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="gov-btn gov-btn-secondary !text-xs !py-1 !px-2.5 cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                      <span>{file ? 'Re-upload' : 'Select PDF'}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleFileSelect(doc.key, e.target.files[0])}
                        className="hidden"
                      />
                    </label>

                    {file && (
                      <span className="text-xs text-[#138808] font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" strokeWidth={2} />
                        <span>Ready</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-4 border-t border-[#D0D5DD] flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="gov-btn gov-btn-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={1.5} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="gov-btn gov-btn-primary"
            >
              <span>Proceed to Review & Verification</span>
              <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: REVIEW & SUBMIT ────────────────────────────────────────── */}
      {currentStep === 4 && (
        <form onSubmit={handleSubmit} className="gov-card p-6 space-y-5">
          <h3 className="text-sm font-bold text-[#0B1F4B] uppercase tracking-wider pb-2 border-b border-[#D0D5DD]">
            4. Review Application Dossier & Statutory Declaration
          </h3>

          {/* Dossier Summary Table */}
          <div className="overflow-x-auto">
            <table className="gov-table">
              <tbody>
                <tr>
                  <th scope="row" className="!bg-[#F0F4FA] !text-[#0B1F4B] w-52">Institution Name</th>
                  <td>{formData.institutionName}</td>
                </tr>
                <tr>
                  <th scope="row" className="!bg-[#F0F4FA] !text-[#0B1F4B]">Permanent AICTE ID</th>
                  <td className="font-mono">{formData.institutionId}</td>
                </tr>
                <tr>
                  <th scope="row" className="!bg-[#F0F4FA] !text-[#0B1F4B]">Regulatory Category</th>
                  <td className="font-semibold">{formData.category} ({formData.academicYear})</td>
                </tr>
                <tr>
                  <th scope="row" className="!bg-[#F0F4FA] !text-[#0B1F4B]">Uploaded Documents</th>
                  <td>5 mandatory statutory documents verified and classified.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statutory Declaration Checkbox */}
          <div className="gov-notice p-3 space-y-2">
            <label className="flex items-start gap-2.5 text-xs text-[#1A1D23] cursor-pointer">
              <input
                type="checkbox"
                checked={declarationChecked}
                onChange={(e) => setDeclarationChecked(e.target.checked)}
                className="mt-0.5"
                required
              />
              <span>
                <strong>Statutory Declaration:</strong> I hereby declare that the certificates, affidavits, and faculty lists uploaded herein are authentic, legally valid, and unmanipulated copies. I acknowledge that preliminary AI verification will evaluate document integrity against state registries, and final approval rests with competent AICTE authorities.
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-[#D0D5DD] flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="gov-btn gov-btn-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={1.5} />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={!declarationChecked}
              className="gov-btn gov-btn-primary disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 mr-1" strokeWidth={1.5} />
              <span>Submit Application for Scrutiny</span>
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 5: SUBMITTED CONFIRMATION ──────────────────────────────────── */}
      {currentStep === 5 && (
        <div className="gov-card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-[2px] bg-[#E6F2EA] border border-[#4C8A62] text-[#1F5E34] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
          </div>

          <h2 className="text-xl font-semibold text-[#0B1F4B]">
            Application Successfully Submitted to Regulation Bureau
          </h2>

          <div className="p-3 bg-[#F8FAFC] border border-[#D0D5DD] rounded-[2px] font-mono text-sm inline-block max-w-md">
            Application Tracking ID:{' '}
            <span className="font-bold text-[#0B1F4B]">{submittedAppId}</span>
          </div>

          <p className="text-xs text-[#5B6472] max-w-lg mx-auto leading-relaxed">
            The Phase 2 AI Validation Engine has initiated OCR extraction, ELA anomaly inspection, and external state registry cross-referencing. You can track scrutiny milestones on the tracker.
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/institution')}
              className="gov-btn gov-btn-primary"
            >
              <span>Go to Application Tracker</span>
              <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
