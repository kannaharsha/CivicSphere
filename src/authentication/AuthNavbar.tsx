import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ArrowLeft, ChevronDown } from 'lucide-react'

const languages = [
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'TE', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'HI', label: 'हिन्दी', flag: '🇮🇳' },
]

export default function AuthNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [selectedLang, setSelectedLang] = useState('EN')
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const currentLang = languages.find(l => l.code === selectedLang) || languages[0]

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-800/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        
        {/* Same logo style as landing navbar */}
        <Link
          to="/"
          className="flex items-center gap-3 focus:outline-none rounded-lg py-1 transition-opacity hover:opacity-95"
          aria-label="CivicSphere Homepage"
        >
          {/* Emblem Logo */}
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#16A34A] via-[#F59E0B] to-[#2563EB] p-[2px] shadow-sm">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-full flex items-center justify-center relative overflow-hidden">
                <svg className="w-5 h-5 text-[#2563EB]/40 absolute animate-spin-slow" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
                </svg>
                <svg className="w-4 h-4 text-[#16A34A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18" stroke="#16A34A" />
                  <circle cx="12" cy="6" r="1.5" fill="#F59E0B" stroke="#F59E0B" />
                  <circle cx="18" cy="12" r="1.5" fill="#2563EB" stroke="#2563EB" />
                  <circle cx="6" cy="12" r="1.5" fill="#16A34A" stroke="#16A34A" />
                  <path d="M12 12l6 0" stroke="#2563EB" />
                  <path d="M12 12l-6 0" stroke="#16A34A" />
                </svg>
              </div>
            </div>
          </div>

          {/* Brand Text */}
          <div className="flex flex-col justify-center whitespace-nowrap">
            <span className="font-heading font-bold text-sm sm:text-base text-gray-900 dark:text-white tracking-tight leading-none">
              Civic<span className="text-[#16A34A]">Sphere</span>
            </span>
            <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium tracking-normal mt-0.5 leading-none hidden sm:block">
              AI Powered Government Schemes Platform
            </span>
          </div>
        </Link>

        {/* Right Nav Control Group */}
        <div className="flex items-center gap-2">
          
          {/* Language Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="h-8.5 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-750 rounded-full shadow-2xs transition-all whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
              <span>{currentLang.flag} {currentLang.code}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-xl p-1 z-50"
                >
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.code)
                        setLangDropdownOpen(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between transition-colors ${
                        selectedLang === lang.code
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-755 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>



          {/* Home / Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 px-3 h-8.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-750 text-xs font-semibold text-slate-750 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>

      </div>
    </motion.nav>
  )
}
