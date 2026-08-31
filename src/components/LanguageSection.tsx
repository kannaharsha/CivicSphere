import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Globe,
  CheckCircle2,
  Sparkles,
  Zap,
  Mic,
  ChevronRight,
  Cpu
} from 'lucide-react'

const languages = [
  {
    id: 'english',
    flag: '🇬🇧',
    code: 'EN',
    name: 'English',
    nativeScript: 'English',
    greeting: 'Welcome to CivicSphere!',
    subtext: 'Discover Government welfare schemes personalized for you.',
    translatedQuery: 'I am a farmer from Andhra Pradesh. Which schemes am I eligible for?',
    color: '#2563EB',
    lightBg: '#EFF6FF',
    border: '#BFDBFE',
    accentGradient: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'telugu',
    flag: '🇮🇳',
    code: 'TE',
    name: 'తెలుగు',
    nativeScript: 'అ ఆ ఇ ఈ ఉ',
    greeting: 'CivicSphere కి స్వాగతం!',
    subtext: 'మీ కోసం ప్రభుత్వ సంక్షేమ పథకాలను కనుగొనండి.',
    translatedQuery: 'నేను ఆంధ్రప్రదేశ్‌కు చెందిన రైతును. నేను ఏ పథకాలకు అర్హుడిని?',
    color: '#D97706',
    lightBg: '#FFFBEB',
    border: '#FDE68A',
    accentGradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'hindi',
    flag: '🇮🇳',
    code: 'HI',
    name: 'हिन्दी',
    nativeScript: 'अ आ इ ई उ',
    greeting: 'CivicSphere में आपका स्वागत है!',
    subtext: 'आपके लिए सरकारी कल्याणकारी योजनाएं खोजें।',
    translatedQuery: 'मैं आंध्र प्रदेश का एक किसान हूं। मैं किन योजनाओं के लिए पात्र हूं?',
    color: '#16A34A',
    lightBg: '#F0FDF4',
    border: '#BBF7D0',
    accentGradient: 'from-emerald-600 to-teal-600'
  }
]

const schemeNames = {
  english: [
    { title: 'PM Kisan Samman Nidhi', benefit: '₹6,000 / year' },
    { title: 'Ayushman Bharat PM-JAY', benefit: '₹5 Lakhs Cover' },
    { title: 'National Scholarship Portal', benefit: 'Full Tuition Fee' }
  ],
  telugu: [
    { title: 'PM కసాన్ సమ్మాన్ నిధి', benefit: '₹6,000 / సంవత్సరం' },
    { title: 'వైఎస్సార్ రైతు భరోసా', benefit: 'రాష్ట్ర సహాయం' },
    { title: 'జగనన్న విద్యా దీవెన', benefit: 'పూర్తి ఫీజు రీయింబర్స్‌మెంట్' }
  ],
  hindi: [
    { title: 'PM किसान सम्मान निधि', benefit: '₹6,000 / वर्ष' },
    { title: 'आयुष्मान भारत योजना', benefit: '₹5 लाख मुफ्त इलाज' },
    { title: 'राष्ट्रीय छात्रवृत्ति पोर्टल', benefit: 'पूर्ण शिक्षण शुल्क' }
  ]
}

const pipelineSteps = [
  'Citizen Question',
  'Language Detection',
  'AI Translation Engine',
  'Govt Knowledge Base',
  'Localized AI Response'
]

export default function LanguageSection() {
  const [active, setActive] = useState('english')
  const [autoTranslateText, setAutoTranslateText] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const currentLang = languages.find((l) => l.id === active)!
  const currentSchemes = schemeNames[active as keyof typeof schemeNames]

  // Auto-cycle language preview every 9 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev === 'english' ? 'telugu' : prev === 'telugu' ? 'hindi' : 'english'))
    }, 9000)
    return () => clearInterval(timer)
  }, [])

  // Auto typing animation for translated query
  useEffect(() => {
    let charIdx = 0
    setAutoTranslateText('')
    const targetText = currentLang.translatedQuery

    const interval = setInterval(() => {
      if (charIdx <= targetText.length) {
        setAutoTranslateText(targetText.slice(0, charIdx))
        charIdx++
      } else {
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [active])

  return (
    <section
      id="languages"
      ref={ref}
      className="relative pt-1 pb-8 md:pt-2 md:pb-10 bg-slate-50/80 overflow-hidden flex flex-col justify-center"
      aria-label="Multilingual support"
    >
      {/* BACKGROUND MESH & SCRIPT OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radial Mesh */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-[350px] h-[350px] bg-emerald-300/12 rounded-full blur-[100px]"
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute bottom-1/4 right-1/6 w-[380px] h-[380px] bg-sky-300/12 rounded-full blur-[100px]"
          animate={{ x: [0, -20, 30, 0], y: [0, 20, -20, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating Native Script Watermarks */}
        <div className="absolute inset-0 flex items-center justify-between px-8 opacity-[0.05] text-4xl font-bold select-none text-slate-800">
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 8, repeat: Infinity }}>
            A B C
          </motion.span>
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 9, repeat: Infinity }}>
            అ ఆ ఇ ఈ ఉ
          </motion.span>
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 7, repeat: Infinity }}>
            अ आ इ ई उ
          </motion.span>
        </div>

        {/* Globe Outline */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <div className="w-[450px] h-[450px] rounded-full border-[6px] border-slate-900 animate-spin-slow" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

        {/* 1. ULTRA-COMPACT SECTION HEADER */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-4 md:mb-5"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* AI Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-extrabold tracking-wider text-slate-800 uppercase">
              🌍 AI POWERED MULTILINGUAL PLATFORM
            </span>
          </div>

          {/* Main Heading (Matching Page Standard) */}
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Your <span className="gradient-text">Language</span>. Your Government.
          </h2>

          {/* Subtitle */}
          <p
            className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto leading-snug"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            CivicSphere automatically explains Government welfare schemes in your preferred language using AI translation and multilingual knowledge retrieval.
          </p>
        </motion.div>

        {/* 2. ULTRA-COMPACT GRID (Left: 5 cols / Right: 7 cols, Gap: 24px) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center max-w-7xl mx-auto">

          {/* LEFT SIDE — CARDS & LIVE TRANSLATION TERMINAL (5 cols) */}
          <motion.div
            className="lg:col-span-5 space-y-3"
            initial={{ opacity: 0, x: -25 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            {/* 3 Language Cards (Increased Font Size & Height 72px) */}
            <div className="space-y-2.5">
              {languages.map((l, i) => {
                const isSelected = active === l.id
                return (
                  <motion.button
                    key={l.id}
                    id={`lang-${l.id}-btn`}
                    onClick={() => setActive(l.id)}
                    className={`w-full text-left h-[72px] px-4 rounded-2xl border-2 backdrop-blur-xl transition-all duration-250 relative overflow-hidden flex items-center justify-between group ${
                      isSelected
                        ? 'bg-white shadow-md border-emerald-500 scale-[1.01]'
                        : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-2xs hover:-translate-y-0.5'
                    }`}
                    style={isSelected ? { borderColor: l.color } : {}}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                  >
                    {/* Selected Accent */}
                    {isSelected && (
                      <div className={`absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b ${l.accentGradient}`} />
                    )}

                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100/90 border border-slate-200/80 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                        {l.flag}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className="font-bold text-slate-900 text-sm sm:text-base truncate"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            {l.name}
                          </h3>
                          <span className="text-xs text-slate-500 font-semibold truncate">({l.nativeScript})</span>
                        </div>
                        <p className="text-xs text-slate-600 truncate font-medium mt-0.5">
                          {l.greeting}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span
                        className="text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider"
                        style={{
                          background: l.lightBg,
                          color: l.color,
                          border: `1px solid ${l.border}`
                        }}
                      >
                        {l.code}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: l.color }} />}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* LIVE TRANSLATION TERMINAL (Increased Font Size & Height 76px) */}
            <div className="bg-slate-900 text-white rounded-2xl p-3.5 border border-slate-800 shadow-md min-h-[76px] flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" /> Live AI Translation
                </span>
                <span className="text-slate-300 font-sans">{currentLang.name} ({currentLang.code})</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs sm:text-sm font-semibold text-emerald-300 min-h-[40px] flex items-center overflow-hidden">
                <span className="truncate">"{autoTranslateText}"</span>
                <span className="w-0.5 h-3.5 bg-emerald-400 animate-pulse ml-1 shrink-0" />
              </div>
            </div>

          </motion.div>

          {/* RIGHT SIDE — WIDE HORIZONTAL PREVIEW CARD & CAPABILITIES (7 cols) */}
          <motion.div
            className="lg:col-span-7 space-y-3"
            initial={{ opacity: 0, x: 25 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Wide Horizontal Preview Card Container (Full Widescreen View) */}
            <div className="relative w-full max-w-xl mx-auto">
              
              {/* Floating Translation Bubble */}
              <motion.div
                className="absolute -right-3 -top-3.5 z-20 bg-white/95 backdrop-blur-xl rounded-xl shadow-md px-3 py-1.5 border border-slate-200/80 flex items-center gap-2"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[10.5px] font-bold text-slate-900 leading-tight">3 Languages Active</p>
                  <p className="text-[9px] font-semibold text-slate-400">English • Telugu • Hindi</p>
                </div>
              </motion.div>

              {/* Widescreen Glass App Preview Frame */}
              <div className="rounded-2xl p-2.5 bg-slate-900 shadow-xl border border-slate-800 relative">
                <div className="rounded-xl overflow-hidden bg-white shadow-inner flex flex-col">
                  
                  {/* Top App Header Bar */}
                  <motion.div
                    className="px-4 py-2.5 flex items-center justify-between text-white shadow-2xs transition-colors duration-300"
                    style={{ background: currentLang.color }}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-bold tracking-tight">CivicSphere Multilingual Preview</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-white/20 rounded-md">
                      {currentLang.name} ({currentLang.code})
                    </span>
                  </motion.div>

                  {/* App Body Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      className="p-3.5 sm:p-4 space-y-3 flex-1"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Greeting Banner */}
                      <div
                        className="p-3 rounded-xl border flex items-center justify-between gap-3"
                        style={{ background: currentLang.lightBg, borderColor: currentLang.border }}
                      >
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900">
                            {currentLang.greeting}
                          </p>
                          <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                            {currentLang.subtext}
                          </p>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded bg-white border shrink-0"
                          style={{ color: currentLang.color, borderColor: currentLang.border }}
                        >
                          ✓ Live Localized
                        </span>
                      </div>

                      {/* Wide Horizontal Schemes Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {currentSchemes.map((s, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-1.5 shadow-2xs hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-4 h-4 rounded text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                                style={{ background: currentLang.color }}
                              >
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-900 truncate">{s.title}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60">
                              <span className="text-slate-500 font-medium">{s.benefit}</span>
                              <span className="font-bold text-emerald-600">✓ Eligible</span>
                            </div>
                          </div>
                        ))}
                      </div>

                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* AI TRANSLATION PIPELINE */}
            <div className="bg-slate-900 rounded-lg p-2 text-white border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-[8.5px] font-mono font-bold text-slate-400 mb-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Cpu className="w-2.5 h-2.5" /> AI Translation Pipeline
                </span>
                <span>Localized RAG</span>
              </div>

              <div className="flex items-center justify-between gap-0.5 text-[8.5px] font-semibold text-slate-300 overflow-x-auto">
                {pipelineSteps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 shrink-0 text-center">
                      {step}
                    </div>
                    {idx < pipelineSteps.length - 1 && (
                      <ChevronRight className="w-2.5 h-2.5 text-emerald-400 shrink-0 animate-pulse" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* AI CAPABILITIES (3 COMPACT HORIZONTAL MICRO ROWS) */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 flex items-center gap-1.5 shadow-2xs">
                <Zap className="w-3 h-3 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-[9.5px] font-bold text-slate-900 truncate">Instant Detection</h4>
                  <p className="text-[8.5px] text-slate-500 truncate">Auto language detect</p>
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 flex items-center gap-1.5 shadow-2xs">
                <Globe className="w-3 h-3 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-[9.5px] font-bold text-slate-900 truncate">Native Guidance</h4>
                  <p className="text-[8.5px] text-slate-500 truncate">Citizen friendly local text</p>
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 flex items-center gap-1.5 shadow-2xs">
                <Mic className="w-3 h-3 text-teal-600 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-[9.5px] font-bold text-slate-900 truncate">Voice & Text</h4>
                  <p className="text-[8.5px] text-slate-500 truncate">Multilingual speech ready</p>
                </div>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  )
}
