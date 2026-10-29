import { BookOpen, AlertTriangle, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react'

export default function OfficerSOP() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D0D5DD] p-6 rounded-[4px] space-y-4">
        <div className="border-b border-[#D0D5DD] pb-3">
          <h2 className="text-base font-semibold text-[#0B1F4B]">
            Standard Operating Procedure (SOP) for Regulatory Scrutiny
          </h2>
          <p className="text-xs text-[#5B6472]">
            In Accordance with AICTE Approval Process Handbook (APH) 2026-27 & Smart Automation Guidelines
          </p>
        </div>

        <div className="space-y-4 text-xs text-[#1A1D23] leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-semibold text-sm text-[#0B1F4B] border-l-2 border-[#0B1F4B] pl-2">
              1. Principles of Decision-Support AI Usage
            </h3>
            <p>
              Manyata provides automated feature extraction, OCR field reconciliation, and digital image tamper detection (ELA). Under Ministry of Education directives, <strong>AI output is decision-support only</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5B6472]">
              <li>AI flags are designated as <em>"preliminary indicators requiring human verification"</em> and never as definitive evidence of forgery.</li>
              <li>No application may be rejected or penalized on automated AI flags alone without an evaluating officer recording independent findings.</li>
              <li>When composite score is capped below 50 due to a critical anomaly, the evaluating officer must examine whether the defect is curable within 15 days or non-curable.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-sm text-[#0B1F4B] border-l-2 border-[#0B1F4B] pl-2">
              2. Categorization of Regulatory Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="border border-[#B85C5C] bg-[#F6E7E7]/40 p-3 rounded-[2px] space-y-1">
                <span className="font-bold text-[#8F2D2D] block">Confirm Deficient</span>
                <p className="text-[12px] text-[#5B6472]">
                  Issued when statutory land documents, building safety NOC, or AICTE mandatory council norms are fundamentally unmet. Triggers generation of an official Deficiency Notice citing Handbook clauses.
                </p>
              </div>

              <div className="border border-[#4C8A62] bg-[#E6F2EA]/40 p-3 rounded-[2px] space-y-1">
                <span className="font-bold text-[#1F5E34] block">Confirm Clear</span>
                <p className="text-[12px] text-[#5B6472]">
                  Issued when all cross-checks pass and human verification resolves minor flags. Authorizes compilation of the Clearance Package with QR verification seal.
                </p>
              </div>

              <div className="border border-[#1F3A7A] bg-[#F4F6F9] p-3 rounded-[2px] space-y-1">
                <span className="font-bold text-[#1F3A7A] block">Request Additional Evidence</span>
                <p className="text-[12px] text-[#5B6472]">
                  Issued when document quality, missing stamp, or ambiguous survey numbers require institutional clarification without failing the application.
                </p>
              </div>

              <div className="border border-[#C99A3A] bg-[#FBF3DC]/60 p-3 rounded-[2px] space-y-1">
                <span className="font-bold text-[#8A5A0B] block">Recommend Physical Inspection</span>
                <p className="text-[12px] text-[#5B6472]">
                  Issued when infrastructure claims (e.g. computer laboratory, barrier-free access, fire hydrants) cannot be verified digitally or when serious conflicting registry data is reported.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-sm text-[#0B1F4B] border-l-2 border-[#0B1F4B] pl-2">
              3. SLA Benchmarks & Escalations
            </h3>
            <p className="text-[#5B6472]">
              Applications routed to the "Needs Review" queue must be scrutinized within <strong>48 hours</strong> of queue entry. Overdue cases are automatically flagged on the Central Admin Command Console.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
