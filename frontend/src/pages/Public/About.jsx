import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx'
import { ShieldCheck, Info, FileText, CheckCircle2 } from 'lucide-react'

export default function About() {
  const breadcrumbs = [{ label: 'About Manyata' }]

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="border-b border-[#D0D5DD] pb-4">
          <span className="text-xs font-semibold text-[#0B1F4B] uppercase tracking-wider">
            Prototype Documentation
          </span>
          <h1 className="text-2xl font-semibold text-[#0B1F4B] tracking-tight mt-1">
            About Manyata & Project Context
          </h1>
          <p className="text-xs text-[#5B6472] mt-1 max-w-3xl leading-relaxed">
            Manyata is an AI-powered regulatory scrutiny and document verification decision-support prototype developed for Smart India Hackathon 2026.
          </p>
        </div>

        {/* Project Facts Table */}
        <div className="gov-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#0B1F4B] uppercase tracking-wider">
            Problem Statement & Hackathon Credentials
          </h2>

          <div className="overflow-x-auto">
            <table className="gov-table">
              <tbody>
                <tr>
                  <th scope="row" className="!bg-[#F0F4FA] !text-[#0B1F4B] w-56">Hackathon</th>
                  <td>Smart India Hackathon (SIH) 2026</td>
                </tr>
                <tr>
                  <th scope="row" className="!bg-[#F0F4FA] !text-[#0B1F4B]">Problem Statement ID</th>
                  <td className="font-mono font-semibold">SIH26261</td>
                </tr>
                <tr>
                  <th scope="row" className="!bg-[#F0F4FA] !text-[#0B1F4B]">Theme</th>
                  <td>Smart Automation · Document Verification & Fraud Prevention</td>
                </tr>
                <tr>
                  <th scope="row" className="!bg-[#F0F4FA] !text-[#0B1F4B]">Target Ministry / Body</th>
                  <td>All India Council for Technical Education (AICTE) · Regulation Bureau</td>
                </tr>
                <tr>
                  <th scope="row" className="!bg-[#F0F4FA] !text-[#0B1F4B]">Developing Team</th>
                  <td className="font-semibold">Team Killnoymous</td>
                </tr>
                <tr>
                  <th scope="row" className="!bg-[#F0F4FA] !text-[#0B1F4B]">Operational Principle</th>
                  <td>Human-in-the-Loop decision support. Competent authorities retain statutory decision-making powers.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="gov-card p-4 space-y-2">
            <h3 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider">
              1. Decision-Support Only
            </h3>
            <p className="text-xs text-[#5B6472] leading-relaxed">
              AI detections provide preliminary anomaly indicators to prioritize officer scrutiny. The system never provenly convicts or revokes approval autonomously.
            </p>
          </div>

          <div className="gov-card p-4 space-y-2">
            <h3 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider">
              2. Synthetic Demonstration Data
            </h3>
            <p className="text-xs text-[#5B6472] leading-relaxed">
              To respect personal and institutional privacy, all demonstrated college names, surveyor records, and faculty lists are synthetically generated.
            </p>
          </div>

          <div className="gov-card p-4 space-y-2">
            <h3 className="text-xs font-bold text-[#0B1F4B] uppercase tracking-wider">
              3. GIGW 3.0 & WCAG 2.1 AA
            </h3>
            <p className="text-xs text-[#5B6472] leading-relaxed">
              Engineered according to Guidelines for Indian Government Websites (GIGW 3.0), featuring accessible contrast, screen reader landmarks, and print layouts.
            </p>
          </div>
        </div>

        {/* Policy Anchors */}
        <div id="policies" className="space-y-6 pt-4 border-t border-[#D0D5DD]">
          <h2 className="text-base font-semibold text-[#0B1F4B]">
            Regulatory Policies & Disclaimers
          </h2>

          <div id="privacy" className="gov-card p-4 space-y-1.5">
            <h3 className="text-xs font-bold text-[#0B1F4B] uppercase">Privacy Policy</h3>
            <p className="text-xs text-[#5B6472] leading-relaxed">
              Uploaded institutional documents in this prototype environment are parsed in memory and stored securely in local isolated sandbox storage. No documents are transmitted to commercial third-party LLM APIs.
            </p>
          </div>

          <div id="terms" className="gov-card p-4 space-y-1.5">
            <h3 className="text-xs font-bold text-[#0B1F4B] uppercase">Terms of Use</h3>
            <p className="text-xs text-[#5B6472] leading-relaxed">
              This system is strictly for evaluation by Smart India Hackathon jury members and AICTE technical committees. Unauthorized scraping or automated stress testing is prohibited.
            </p>
          </div>

          <div id="accessibility" className="gov-card p-4 space-y-1.5">
            <h3 className="text-xs font-bold text-[#0B1F4B] uppercase">Accessibility Statement (GIGW 3.0)</h3>
            <p className="text-xs text-[#5B6472] leading-relaxed">
              We are committed to ensuring that the Manyata portal is accessible to all users including persons with disabilities. The portal provides keyboard navigability, high contrast modes, text scaling, and descriptive labels.
            </p>
          </div>

          <div id="disclaimer" className="gov-notice-danger p-4 space-y-1.5">
            <h3 className="text-xs font-bold text-[#8F2D2D] uppercase">Statutory Disclaimer</h3>
            <p className="text-xs text-[#8F2D2D] leading-relaxed">
              Prototype developed for Smart India Hackathon 2026. Not an official AICTE portal. Demonstrated with synthetic/anonymised data. Official institutional approvals must be sought solely through the AICTE National Portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
