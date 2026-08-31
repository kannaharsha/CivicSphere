import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Globe,
  FileText,
  Sparkles,
  Zap,
  Lock,
  Search
} from 'lucide-react'

const eligibilitySteps = [
  { step: 'Profile Loaded', detail: 'Citizen profile & district location verified', status: 'ready' },
  { step: 'Scanning Schemes', detail: 'Checking official Central & State guidelines', status: 'thinking' },
  { step: 'Verified Eligible', detail: 'PM-Kisan Samman Nidhi matched (₹6,000/yr)', status: 'verified' },
  { step: 'Verified Eligible', detail: 'Ayushman Bharat PM-JAY matched (₹5 Lakh)', status: 'verified' }
]

const trustChips = [
  { icon: ShieldCheck, label: 'Government Verified Data' },
  { icon: Zap, label: 'AI Eligibility in Seconds' },
  { icon: Lock, label: 'Secure Citizen Profile' },
  { icon: Globe, label: 'Multilingual Support' },
  { icon: CheckCircle2, label: 'No Application Fees' }
]

const statsData = [
  { value: 'Central & State', label: 'Welfare Coverage' },
  { value: '28', label: 'States & UTs Covered' },
  { value: '3 Languages', label: 'English • Telugu • Hindi' },
  { value: 'Instant', label: 'AI Eligibility Scan' }
]

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  // Cycle eligibility preview step every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % eligibilitySteps.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const currentStep = eligibilitySteps[activeStepIndex]

  return (
    <section
      id="cta"
      ref={ref}
      className="relative pt-1 pb-8 md:pt-2 md:pb-10 bg-slate-50/90 overflow-hidden flex flex-col justify-center border-t border-slate-200/80"
      aria-label="Get started with CivicSphere"
    >
      {/* 1. BACKGROUND MESH (Radial Emerald & Blue Glow) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-200/20 via-sky-200/20 to-blue-200/20 rounded-full blur-[140px]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* 2. FLOATING AI GOVERNANCE GRAPHICS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-12 left-10 p-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-md text-emerald-600 opacity-20 hidden md:flex items-center gap-2"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold text-slate-800">Govt Verified</span>
        </motion.div>

        <motion.div
          className="absolute top-20 right-12 p-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-md text-blue-600 opacity-20 hidden md:flex items-center gap-2"
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <Cpu className="w-5 h-5" />
          <span className="text-xs font-bold text-slate-800">RAG AI Engine</span>
        </motion.div>

        <motion.div
          className="absolute bottom-20 left-16 p-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-md text-amber-500 opacity-20 hidden md:flex items-center gap-2"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          <Globe className="w-5 h-5" />
          <span className="text-xs font-bold text-slate-800">Multilingual</span>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">

        {/* 3. HERO HEADING & AI BADGE */}
        <motion.div
          className="max-w-3xl mx-auto mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* AI Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-extrabold tracking-wider text-slate-800 uppercase">
              🇮🇳 INDIA'S INTELLIGENT WELFARE PLATFORM
            </span>
          </div>

          {/* Heading */}
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ready to Discover{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-500 bg-clip-text text-transparent font-extrabold">
              Government Benefits
            </span>{' '}
            You Deserve?
          </h2>

          {/* Subtitle */}
          <p
            className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Join India's AI-powered multilingual platform to discover Central, State, and District Government schemes personalized for your profile.
          </p>
        </motion.div>

        {/* 4. LIVE AI ELIGIBILITY PREVIEW (CENTER SHOWCASE) */}
        <motion.div
          className="max-w-md mx-auto mb-6 p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-md relative overflow-hidden text-left"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 mb-2 pb-2 border-b border-slate-100">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Cpu className="w-3.5 h-3.5 animate-pulse" /> Live AI Scan
            </span>
            <span className="text-[10px] text-slate-400 font-sans">Citizen Demo</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 shrink-0">
                {currentStep.status === 'thinking' ? (
                  <Search className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{currentStep.step}</h4>
                <p className="text-[11px] text-slate-500 font-medium truncate">{currentStep.detail}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 5. PREMIUM CTA BUTTONS */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Sign In to Account</span>
          </Link>
        </motion.div>

        {/* 6. AI TRUST INDICATORS */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          {trustChips.map((chip, idx) => {
            const ChipIcon = chip.icon
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-slate-200/80 shadow-2xs text-[10.5px] font-semibold text-slate-700 hover:border-emerald-300 transition-colors"
              >
                <ChipIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{chip.label}</span>
              </div>
            )
          })}
        </motion.div>

        {/* 10. ANIMATED STATISTICS BAR (ABOVE FOOTER) */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-2.5 max-w-5xl mx-auto pt-4 border-t border-slate-200/80"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          {statsData.map((stat, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-center hover:border-emerald-300 transition-all"
            >
              <p
                className="text-sm sm:text-base font-extrabold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {stat.value}
              </p>
              <p className="text-[10px] font-bold text-slate-800 mt-0.5 truncate">{stat.label}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
