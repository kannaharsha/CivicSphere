import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ArrowLeft, ChevronDown, Sun, Moon, Cpu, Sparkles } from 'lucide-react'
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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg' : ''
      } ${
        isDark
          ? 'bg-[#09090B]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-md shadow-black/20'
          : 'bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs'
      }`}
    >
      {/* Outer wrapper */}
      <div className="relative px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 focus:outline-none rounded-2xl py-1 transition-transform hover:scale-[1.02] active:scale-[0.98] group"
            aria-label="CivicSphere Homepage"
          >
            {/* Emblem Logo with Soft Green/Blue Neon Glow */}
            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
              {/* Neon Glow backdrop */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 blur-md opacity-60 group-hover:opacity-100 group-hover:blur-lg transition-all duration-300 animate-pulse" />
              
              <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-blue-500 p-[2px] shadow-lg">
                <div className="w-full h-full bg-[#0F172A] dark:bg-[#1F2937] rounded-full flex items-center justify-center relative overflow-hidden">
                  <svg className="w-5 h-5 text-cyan-400/50 absolute animate-spin-slow" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
                  </svg>
                  <svg className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v18" stroke="#10B981" />
                    <circle cx="12" cy="6" r="1.5" fill="#38BDF8" stroke="#38BDF8" />
                    <circle cx="18" cy="12" r="1.5" fill="#3B82F6" stroke="#3B82F6" />
                    <circle cx="6" cy="12" r="1.5" fill="#10B981" stroke="#10B981" />
                    <path d="M12 12l6 0" stroke="#3B82F6" />
                    <path d="M12 12l-6 0" stroke="#10B981" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Brand Text with Emerald -> Cyan -> Blue Shimmer */}
            <div className="flex flex-col justify-center whitespace-nowrap">
              <span className={`font-heading font-black text-lg sm:text-xl tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-950 font-black'}`}>
                Civic
                <span className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient-shift font-black">
                  Sphere
                </span>
              </span>
            </div>
          </Link>

          {/* Floating AI Badge */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border transition-all duration-300 shadow-sm ${
              isDark
                ? 'bg-slate-900/60 border-emerald-500/30 text-emerald-300 hover:border-emerald-400/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-white/70 border-emerald-600/30 text-emerald-800 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Cpu className="w-3 h-3 text-cyan-500 animate-pulse" />
            <span>AI Powered Government Schemes</span>
          </motion.div>
        </div>

        {/* Right Navigation Controls (Rounded Glass Capsules) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Toggle Capsule Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            aria-label="Toggle Light/Dark Mode"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`relative group h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md border shadow-sm ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700/90 border-slate-600/80 text-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:border-amber-400/60'
                : 'bg-white/80 hover:bg-white border-slate-300/80 text-slate-700 hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:border-emerald-400/60'
            }`}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Sun className="w-4.5 h-4.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Moon className="w-4.5 h-4.5 text-slate-800 group-hover:-rotate-12 transition-transform duration-300" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Language Selector Pill Capsule */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className={`h-9 sm:h-10 px-3.5 inline-flex items-center gap-1.5 text-xs font-black rounded-full backdrop-blur-md border shadow-sm transition-all duration-300 whitespace-nowrap cursor-pointer group ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700/90 text-slate-100 border-slate-600/80 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'bg-white/80 hover:bg-white text-slate-800 border-slate-300/80 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500 dark:text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
              <span>{currentLang.flag} {currentLang.code}</span>
              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-300 ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className={`absolute right-0 mt-2 w-40 rounded-2xl p-1.5 z-50 backdrop-blur-2xl border shadow-2xl ${
                    isDark
                      ? 'bg-slate-900/95 border-slate-700/90 shadow-black/60'
                      : 'bg-white/95 border-slate-200 shadow-slate-400/20'
                  }`}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.code)
                        setLangDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        selectedLang === lang.code
                          ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-600 dark:text-cyan-400 border border-emerald-500/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {selectedLang === lang.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Home Capsule Link */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className="h-9 sm:h-10 px-4 inline-flex items-center gap-2 text-xs font-black text-white bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:brightness-110 rounded-full shadow-md shadow-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.45)] transition-all duration-300 whitespace-nowrap cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Home</span>
              <Sparkles className="w-3 h-3 opacity-80 group-hover:rotate-12 transition-transform" />
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Thin Animated Green-to-Blue Gradient Border Beam at Bottom of Navbar */}
      <div className="h-[2px] w-full bg-slate-200/40 dark:bg-slate-700/40 relative overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 bottom-0 w-2/3 bg-gradient-to-r from-transparent via-emerald-400 to-cyan-400 dark:via-emerald-400 dark:to-blue-500"
        />
      </div>
    </motion.nav>
  )
}
