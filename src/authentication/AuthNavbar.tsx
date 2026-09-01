import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ArrowLeft, ChevronDown, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const languages = [
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'TE', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'HI', label: 'हिन्दी', flag: '🇮🇳' },
]

export default function AuthNavbar() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [selectedLang, setSelectedLang] = useState('EN')
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const isDark = theme === 'dark'

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
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-md border-b border-slate-200/80 dark:border-slate-800'
          : 'bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200/40 dark:border-slate-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 focus:outline-none rounded-lg py-1 transition-opacity hover:opacity-90 group"
          aria-label="CivicSphere Homepage"
        >
          {/* Emblem Logo */}
          <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 via-amber-500 to-blue-600 p-[2px] shadow-sm group-hover:shadow-md transition-shadow">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-full flex items-center justify-center relative overflow-hidden">
                <svg className="w-5 h-5 text-blue-600/40 absolute animate-spin-slow" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
                </svg>
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18" stroke="#10B981" />
                  <circle cx="12" cy="6" r="1.5" fill="#F59E0B" stroke="#F59E0B" />
                  <circle cx="18" cy="12" r="1.5" fill="#2563EB" stroke="#2563EB" />
                  <circle cx="6" cy="12" r="1.5" fill="#10B981" stroke="#10B981" />
                  <path d="M12 12l6 0" stroke="#2563EB" />
                  <path d="M12 12l-6 0" stroke="#10B981" />
                </svg>
              </div>
            </div>
          </div>

          {/* Brand Text */}
          <div className="flex flex-col justify-center whitespace-nowrap">
            <span className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-none">
              Civic<span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 bg-clip-text text-transparent font-black">Sphere</span>
            </span>
            <span className="text-[9.5px] text-slate-600 dark:text-slate-400 font-bold tracking-tight mt-0.5 leading-none hidden sm:block">
              AI Powered Government Schemes Platform
            </span>
          </div>
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Light/Dark Mode"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="h-9 w-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Language Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="h-9 px-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm transition-all whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{currentLang.flag} {currentLang.code}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.code)
                        setLangDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                        selectedLang === lang.code
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {selectedLang === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Back Home Button */}
          <Link
            to="/"
            className="h-9 px-3.5 inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:opacity-95 rounded-full shadow-sm hover:shadow-md transition-all whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>

      </div>
    </motion.nav>
  )
}
