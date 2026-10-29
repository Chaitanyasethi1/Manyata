import { useState } from 'react'
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'
import { HelpCircle, ChevronDown, ChevronRight, Mail, Phone } from 'lucide-react'

export default function HelpFaqs() {
  const breadcrumbs = [{ label: 'Help / FAQs' }]
  const [openIndex, setOpenIndex] = useState(0)

  const FAQS = [
    {
      q: 'Does Manyata automatically reject applications without human intervention?',
      a: 'No. In strict accordance with Indian administrative law and AICTE scrutiny norms, AI outputs are decision-support indicators only. A preliminary deficiency or tamper flag must be cross-examined by a designated AICTE Scrutiny Officer. Final decisions remain exclusively with the Competent Authority.',
    },
    {
      q: 'What should an institution do if an application is marked "DEFICIENT"?',
      a: 'Institutions can access their Deficiency Report from the portal dashboard. The report specifies exact Handbook clauses violated, provides image extracts of the flagged anomaly, and details required rectification steps. The institution has a 15-day statutory window to upload corrected affidavits or certificates and request re-scrutiny.',
    },
    {
      q: 'Why was my composite Trust Score capped at 49 despite high sub-scores?',
      a: 'The Manyata rules engine enforces a safety cap: if an anomaly indicates critical tampering (e.g. digital duplicate seal matching, modified land deed boundary acreage, or invalid registry lookup), the overall score cannot exceed 49. This ensures that serious defects cannot be masked by high compliance in secondary categories.',
    },
    {
      q: 'What file formats and sizes are permissible for statutory uploads?',
      a: 'Only authentic PDF format (with native text layer preferred) or high-resolution TIFF scans (minimum 300 DPI, uncompressed) are supported. Maximum file size per statutory document is 15 megabytes.',
    },
    {
      q: 'How does Error Level Analysis (ELA) assist in identifying document manipulation?',
      a: 'ELA resaves image frames at a known JPEG error rate and measures the compression gradient variance. Digitally altered text (such as modified survey numbers or changed land area digits) exhibits distinct error levels compared to the rest of the scanned page, which are outlined with localized bounding boxes for officer scrutiny.',
    },
  ]

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="border-b border-[#D0D5DD] pb-4">
          <span className="text-xs font-semibold text-[#0B1F4B] uppercase tracking-wider">
            Applicant Assistance
          </span>
          <h1 className="text-2xl font-semibold text-[#0B1F4B] tracking-tight mt-1">
            Frequently Asked Questions & Procedural Guidance
          </h1>
          <p className="text-xs text-[#5B6472] mt-1 max-w-3xl leading-relaxed">
            Guidance for technical institutions, scrutiny officers, and evaluators regarding automated document validation procedures.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="gov-card p-0 divide-y divide-[#D0D5DD]">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div key={idx} className="p-4">
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between text-left text-sm font-semibold text-[#0B1F4B] focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#E07B00] shrink-0" strokeWidth={1.5} />
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-[#5B6472]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#5B6472]" />
                  )}
                </button>

                {isOpen && (
                  <p className="text-xs text-[#5B6472] mt-3 pl-6 leading-relaxed border-l-2 border-[#0B1F4B]">
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Technical Support Block */}
        <div className="gov-notice p-4 space-y-2">
          <h2 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wide">
            Regulatory Scrutiny Technical Helpdesk
          </h2>
          <p className="text-xs text-[#1A1D23] leading-relaxed">
            For technical queries regarding digital signatures, document parsing errors, or university registry sync delays, contact the SIH26261 Support Desk at{' '}
            <span className="font-mono font-semibold text-[#0B1F4B]">helpdesk.aicte@sih2026.gov.in</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
