import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Type, Globe } from 'lucide-react'

export default function UtilityBar() {
  const { t, i18n } = useTranslation()
  const [fontSize, setFontSize] = useState('md')
  const [highContrast, setHighContrast] = useState(false)

  function changeFontSize(size) {
    setFontSize(size)
    document.body.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg')
    document.body.classList.add(`font-size-${size}`)
  }

  function toggleContrast() {
    const next = !highContrast
    setHighContrast(next)
    if (next) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
  }

  function setLanguage(lang) {
    i18n.changeLanguage(lang)
  }

  return (
    <div className="gov-utility-bar bg-[#F0F2F5] border-b border-[#D0D5DD] text-xs text-[#5B6472] px-4 py-1.5 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Accessibility Links */}
        <div className="flex items-center gap-3">
          <a
            href="#main-content"
            className="text-[#1F3A7A] hover:underline font-medium focus:ring-2 focus:ring-[#0B1F4B] focus:p-1"
          >
            {t('skipContent', 'Skip to main content')}
          </a>
          <span className="text-[#D0D5DD]" aria-hidden="true">|</span>
          <span className="text-[#5B6472] hidden sm:inline">
            {t('screenReader', 'Screen Reader Access')}
          </span>
          <span className="text-[#D0D5DD] hidden sm:inline" aria-hidden="true">|</span>
          <span className="text-[11px] text-[#5B6472] hidden md:inline">
            AICTE Regulation Bureau · SIH26261
          </span>
        </div>

        {/* Right Accessibility Controls */}
        <div className="flex items-center gap-3">
          {/* Text Sizing Controls */}
          <div className="flex items-center gap-1 border border-[#D0D5DD] bg-white rounded-[2px] px-1 py-0.5">
            <span className="sr-only">Adjust Font Size</span>
            <button
              onClick={() => changeFontSize('sm')}
              className={`px-1.5 py-0.2 text-[11px] font-bold ${fontSize === 'sm' ? 'bg-[#0B1F4B] text-white' : 'text-[#1A1D23] hover:bg-gray-100'}`}
              title="Small text (A-)"
              aria-pressed={fontSize === 'sm'}
            >
              A-
            </button>
            <button
              onClick={() => changeFontSize('md')}
              className={`px-1.5 py-0.2 text-[11px] font-bold ${fontSize === 'md' ? 'bg-[#0B1F4B] text-white' : 'text-[#1A1D23] hover:bg-gray-100'}`}
              title="Standard text (A)"
              aria-pressed={fontSize === 'md'}
            >
              A
            </button>
            <button
              onClick={() => changeFontSize('lg')}
              className={`px-1.5 py-0.2 text-[11px] font-bold ${fontSize === 'lg' ? 'bg-[#0B1F4B] text-white' : 'text-[#1A1D23] hover:bg-gray-100'}`}
              title="Large text (A+)"
              aria-pressed={fontSize === 'lg'}
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={toggleContrast}
            className={`flex items-center gap-1 border px-2 py-0.5 rounded-[2px] text-xs font-semibold ${
              highContrast
                ? 'bg-black text-yellow-300 border-black'
                : 'bg-white text-[#1A1D23] border-[#D0D5DD] hover:bg-gray-50'
            }`}
            title="Toggle High Contrast Mode"
            aria-pressed={highContrast}
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">{t('contrastToggle', 'High Contrast')}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center border border-[#D0D5DD] bg-white rounded-[2px] overflow-hidden text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 font-semibold ${i18n.language === 'en' ? 'bg-[#0B1F4B] text-white' : 'text-[#1A1D23] hover:bg-gray-100'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 font-semibold ${i18n.language === 'hi' ? 'bg-[#0B1F4B] text-white' : 'text-[#1A1D23] hover:bg-gray-100'}`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
