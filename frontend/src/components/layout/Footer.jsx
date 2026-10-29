import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, ExternalLink, FileText, HelpCircle, Mail } from 'lucide-react'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="gov-footer bg-[#0B1F4B] text-white text-[13px] border-t-2 border-[#E07B00] mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8 border-b border-[#1F3A7A]">
          {/* Column 1: About */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-[#E07B00] uppercase">
              {t('footer.aboutHeading', 'About Manyata')}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('footer.aboutText', 'An AI-powered scrutiny assistance portal built for AICTE (Regulation Bureau) under Smart India Hackathon 2026 problem statement SIH26261.')}
            </p>
            <p className="text-xs text-gray-400 font-mono">
              Designed according to GIGW 3.0 & NIC Accessibility Standards.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wide text-[#E07B00] uppercase">
              {t('footer.linksHeading', 'Quick Links')}
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-300 list-none p-0 m-0">
              <li>
                <Link to="/" className="hover:underline hover:text-white">Home Page</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:underline hover:text-white">How It Works (5-Phase Flow)</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:underline hover:text-white">Application Categories</Link>
              </li>
              <li>
                <Link to="/sources" className="hover:underline hover:text-white">External Verification Sources</Link>
              </li>
              <li>
                <Link to="/institution/upload" className="hover:underline hover:text-white">Submit New Application</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wide text-[#E07B00] uppercase">
              {t('footer.policiesHeading', 'Policies & Guidelines')}
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-300 list-none p-0 m-0">
              <li>
                <Link to="/about#privacy" className="hover:underline hover:text-white">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/about#terms" className="hover:underline hover:text-white">Terms of Use</Link>
              </li>
              <li>
                <Link to="/about#accessibility" className="hover:underline hover:text-white">Accessibility Statement (GIGW 3.0)</Link>
              </li>
              <li>
                <Link to="/about#disclaimer" className="hover:underline hover:text-white">Statutory Disclaimers</Link>
              </li>
              <li>
                <Link to="/about#handbook" className="hover:underline hover:text-white">AICTE Handbook Norms 2026-27</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Help & Contact */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wide text-[#E07B00] uppercase">
              {t('footer.helpHeading', 'Help & Support')}
            </h3>
            <div className="space-y-1.5 text-xs text-gray-300">
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#E07B00]" strokeWidth={1.5} />
                <span>support.manyata@sih2026.gov.in</span>
              </p>
              <p className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#E07B00]" strokeWidth={1.5} />
                <Link to="/faqs" className="hover:underline">Verification FAQs & Guide</Link>
              </p>
              <p className="text-xs text-gray-400 pt-1">
                National Scrutiny Cell: Nelson Mandela Marg, Vasant Kunj, New Delhi
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Strip & Mandatory Disclaimer */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-300">
          <div>
            <span className="font-semibold">{t('footer.team', 'Prototype by Team Killnoymous')}</span>
            <span className="mx-2 text-gray-500">|</span>
            <span className="font-mono text-gray-400">{t('footer.lastUpdated', 'Last Updated: 29 October 2026')}</span>
          </div>

          {/* Prominent Hackathon Disclaimer */}
          <div className="bg-[#071533] border border-[#1F3A7A] px-3 py-1.5 rounded-[2px] text-center text-gray-300 text-[11px] max-w-xl">
            {t('notice.sihDisclaimer', 'Prototype developed for Smart India Hackathon 2026. Not an official AICTE portal. Demonstrated with synthetic/anonymised data.')}
          </div>
        </div>
      </div>
    </footer>
  )
}
