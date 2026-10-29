import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      siteTitle: 'Manyata',
      siteSubtitle: 'AI-Assisted Application Validation & Compliance Verification',
      authorityTag: 'SIH 2026 | PS: SIH26261',
      skipContent: 'Skip to main content',
      screenReader: 'Screen Reader Access',
      contrastToggle: 'High Contrast',
      textSize: 'Text Size',
      langLabel: 'Language',
      
      nav: {
        home: 'Home',
        about: 'About Manyata',
        howItWorks: 'How It Works',
        categories: 'Application Categories',
        sources: 'Verification Sources',
        faqs: 'Help / FAQs',
        login: 'Login',
        officerPortal: 'Officer Portal',
        adminPortal: 'Admin Portal',
        institutionPortal: 'Institution Portal',
        logout: 'Sign Out',
      },

      hero: {
        title: 'Statutory Verification & Regulatory Scrutiny Assistance',
        desc: 'Automated document extraction, integrity inspection, and AICTE Approval Process Handbook compliance checks for institutional applications.',
        loginBtn: 'Login to Portal',
        howBtn: 'View How It Works',
        glanceTitle: 'Validation Process at a Glance',
      },

      notice: {
        disclaimer: 'AI-generated results are decision-support outputs only. Statutory scrutiny, physical inspection, and final decisions remain with competent AICTE authorities. Flags represent preliminary indicators requiring human verification, never proven forgery.',
        sihDisclaimer: 'Prototype developed for Smart India Hackathon 2026. Not an official AICTE portal. Demonstrated with synthetic/anonymised data.',
      },

      phases: {
        phase1: 'Phase 1: Application Intake & Document Submission',
        phase2: 'Phase 2: Multi-Stage AI Validation Engine',
        phase3: 'Phase 3: Weighted Trust Scoring & Routing',
        phase4: 'Phase 4: Output Generation & Statutory Reports',
        phase5: 'Phase 5: Executive Dashboard & Audit Monitoring',
      },

      status: {
        cleared: 'Cleared',
        needsReview: 'Needs Review',
        deficient: 'Deficient',
        verified: 'Verified',
        mismatch: 'Mismatch detected',
        expired: 'Expired',
        pending: 'Verification pending',
        unavailable: 'Source unavailable',
        manualReview: 'Manual review required',
      },

      bands: {
        clearedDesc: 'Trust Score >= 75: High consistency, verified sources, automated fast-track eligible.',
        reviewDesc: 'Trust Score 50-74: Discrepancy observed or unverified source; assigned to Scrutiny Officer.',
        deficientDesc: 'Trust Score < 50: Statutory non-compliance or critical tamper indicator; requires resubmission.',
      },

      footer: {
        aboutHeading: 'About Manyata',
        aboutText: 'An AI-powered scrutiny assistance portal built for AICTE (Regulation Bureau) under Smart India Hackathon 2026 problem statement SIH26261.',
        linksHeading: 'Quick Links',
        policiesHeading: 'Policies & Statements',
        helpHeading: 'Help & Contact',
        lastUpdated: 'Last Updated: 29 October 2026',
        team: 'Prototype by Team Killnoymous',
      }
    }
  },
  hi: {
    translation: {
      siteTitle: 'मान्यता',
      siteSubtitle: 'एआई-सहायता प्राप्त आवेदन सत्यापन एवं नियामक अनुपालन जांच',
      authorityTag: 'एसआईएच 2026 | समस्या: SIH26261',
      skipContent: 'मुख्य सामग्री पर जाएं',
      screenReader: 'स्क्रीन रीडर एक्सेस',
      contrastToggle: 'उच्च कंट्रास्ट',
      textSize: 'फ़ॉन्ट आकार',
      langLabel: 'भाषा',

      nav: {
        home: 'मुख्य पृष्ठ',
        about: 'मान्यता के बारे में',
        howItWorks: 'यह कैसे काम करता है',
        categories: 'आवेदन श्रेणियां',
        sources: 'सत्यापन स्रोत',
        faqs: 'सहायता / प्रश्नोत्तरी',
        login: 'लॉग इन',
        officerPortal: 'अधिकारी पोर्टल',
        adminPortal: 'प्रशासक पोर्टल',
        institutionPortal: 'संस्थान पोर्टल',
        logout: 'लॉग आउट',
      },

      hero: {
        title: 'वैधानिक सत्यापन एवं नियामक जांच सहायता प्रणाली',
        desc: 'संस्थागत आवेदनों के लिए स्वचालित दस्तावेज़ निष्कर्षण, अखंडता निरीक्षण और एआईसीटीई अनुमोदन प्रक्रिया पुस्तिका अनुपालन जांच।',
        loginBtn: 'पोर्टल में प्रवेश करें',
        howBtn: 'कार्यप्रणाली देखें',
        glanceTitle: 'सत्यापन प्रक्रिया एक नज़र में',
      },

      notice: {
        disclaimer: 'एआई द्वारा जनरेट किए गए परिणाम केवल निर्णय-सहायता आउटपुट हैं। वैधानिक जांच, भौतिक निरीक्षण और अंतिम निर्णय सक्षम एआईसीटीई अधिकारियों के पास सुरक्षित हैं। फ्लैग्स प्रारंभिक संकेत हैं जिनके लिए मानवीय सत्यापन अनिवार्य है, यह सिद्ध धोखाधड़ी नहीं हैं।',
        sihDisclaimer: 'स्मार्ट इंडिया हैकाथॉन 2026 के लिए विकसित प्रोटोटाइप। आधिकारिक एआईसीटीई पोर्टल नहीं है। कृत्रिम/अनाम डेटा के साथ प्रदर्शित।',
      },

      phases: {
        phase1: 'चरण 1: आवेदन प्राप्ति और दस्तावेज़ अपलोड',
        phase2: 'चरण 2: बहु-स्तरीय एआई सत्यापन इंजन',
        phase3: 'चरण 3: भारित ट्रस्ट स्कोरिंग और रूटिंग',
        phase4: 'चरण 4: वैधानिक रिपोर्ट एवं आउटपुट जनरेशन',
        phase5: 'चरण 5: कार्यकारी डैशबोर्ड और ऑडिट मॉनिटरिंग',
      },

      status: {
        cleared: 'मंजूर (Cleared)',
        needsReview: 'पुनरावलोकन आवश्यक',
        deficient: 'कमियां पाई गईं (Deficient)',
        verified: 'सत्यापित (Verified)',
        mismatch: 'विसंगति पाई गई',
        expired: 'समय समाप्त (Expired)',
        pending: 'सत्यापन लंबित',
        unavailable: 'स्रोत अनुपलब्ध',
        manualReview: 'मानवीय सत्यापन आवश्यक',
      },

      bands: {
        clearedDesc: 'स्कोर >= 75: उच्च निरंतरता, सत्यापित स्रोत, फास्ट-ट्रैक के लिए योग्य।',
        reviewDesc: 'स्कोर 50-74: विसंगति या असत्यापित स्रोत; जांच अधिकारी को आवंटित।',
        deficientDesc: 'स्कोर < 50: वैधानिक गैर-अनुपालन या गंभीर छेड़छाड़ संकेत; पुनः आवेदन आवश्यक।',
      },

      footer: {
        aboutHeading: 'मान्यता के बारे में',
        aboutText: 'स्मार्ट इंडिया हैकाथॉन 2026 (समस्या SIH26261) के तहत एआईसीटीई विनियमन ब्यूरो के लिए विकसित एआई-संचालित जांच सहायता पोर्टल।',
        linksHeading: 'त्वरित लिंक',
        policiesHeading: 'नीतियां एवं नियम',
        helpHeading: 'सहायता एवं संपर्क',
        lastUpdated: 'अंतिम अद्यतन: 29 अक्टूबर 2026',
        team: 'टीम किलनॉयमस (Killnoymous) द्वारा प्रोटोटाइप',
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
