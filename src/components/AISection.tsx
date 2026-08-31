import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Bot,
  Sparkles,
  Send,
  Mic,
  CheckCircle2,
  Brain,
  Building2,
  Globe,
  ShieldCheck,
  Zap,
  ChevronRight,
  Loader2,
  Target,
  Lock,
  Bell,
  UserCheck,
  Database,
  FileCheck2
} from 'lucide-react'

// --- 5 CONVERSATIONS FOR LEFT CHATBOT SIMULATION ---
const chatScenarios = [
  {
    category: '🌾 Agriculture',
    userText: 'I am a farmer from Andhra Pradesh. Which schemes am I eligible for?',
    schemes: [
      'PM-KISAN Samman Nidhi',
      'YSR Rythu Bharosa',
      'Soil Health Card Scheme',
      'PM Fasal Bima Yojana'
    ],
    whyEligible: ['Farmer Category', 'AP Resident', 'Agriculture Welfare']
  },
  {
    category: '🎓 Scholarships',
    userText: 'I am a B.Tech student looking for scholarship schemes.',
    schemes: [
      'National Scholarship Portal',
      'Jagananna Vidya Deevena',
      'AICTE Pragati Scholarship',
      'Post Matric Scholarship'
    ],
    whyEligible: ['Student Category', 'Higher Education', 'Merit & Income Criteria']
  },
  {
    category: '❤️ Healthcare',
    userText: 'Are there health insurance schemes for my family?',
    schemes: [
      'Ayushman Bharat PM-JAY',
      'Dr. YSR Aarogyasri Scheme',
      'Janani Suraksha Yojana',
      'National Health Mission'
    ],
    whyEligible: ['Healthcare Benefits', 'Family Security', 'Cashless Hospital Cover']
  },
  {
    category: '💼 Jobs',
    userText: 'I am a graduate looking for job & skill training schemes.',
    schemes: [
      'Skill India Digital',
      'PM Kaushal Vikas Yojana',
      'Apprenticeship India Portal',
      'Startup India Seed Fund'
    ],
    whyEligible: ['Youth Category', 'Skill Training', 'Stipend Support']
  },
  {
    category: '🤝 Welfare',
    userText: 'What schemes support senior citizens in rural areas?',
    schemes: [
      'Old Age Pension Scheme',
      'YSR Pension Kanuka',
      'PM Awas Yojana (Rural)',
      'Annapurna Food Scheme'
    ],
    whyEligible: ['Senior Citizen', 'Rural Welfare', 'Monthly Pension']
  }
]

// Inline AI Workflow Steps
const inlineWorkflow = [
  'Citizen Question',
  'Knowledge Base',
  'RAG Intelligence',
  'AI Assistant',
  'Personalized Answer'
]

export default function AISection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  // Left Chatbot Machine States
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [animStage, setAnimStage] = useState<'typing' | 'sending' | 'thinking' | 'scanning' | 'response' | 'done'>('typing')

  const currentScenario = chatScenarios[scenarioIndex]

  // Phase 1: Auto Character Typing Effect (50ms)
  useEffect(() => {
    if (!inView) return

    let charIdx = 0
    setTypedText('')
    setAnimStage('typing')

    const fullText = currentScenario.userText
    const typingInterval = setInterval(() => {
      if (charIdx <= fullText.length) {
        setTypedText(fullText.slice(0, charIdx))
        charIdx++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setAnimStage('sending')
          setTimeout(() => {
            setAnimStage('thinking')
          }, 600)
        }, 300)
      }
    }, 50)

    return () => clearInterval(typingInterval)
  }, [scenarioIndex, inView])

  // Phases 3, 4, 5 Timers
  useEffect(() => {
    if (animStage === 'thinking') {
      const timer = setTimeout(() => setAnimStage('scanning'), 2000)
      return () => clearTimeout(timer)
    }
    if (animStage === 'scanning') {
      const timer = setTimeout(() => setAnimStage('response'), 1500)
      return () => clearTimeout(timer)
    }
    if (animStage === 'response') {
      const timer = setTimeout(() => {
        setAnimStage('done')
        setTimeout(() => {
          setScenarioIndex((prev) => (prev + 1) % chatScenarios.length)
        }, 2000)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [animStage])

  return (
    <section
      id="civic-assist"
      ref={ref}
      className="relative pt-1 pb-10 md:pt-2 md:pb-12 bg-slate-50/80 overflow-hidden min-h-[680px] flex flex-col justify-center"
      aria-label="CivicSphere Assistant"
    >
      {/* 1. LAYER 1: ANIMATED GRADIENT MESH (3 MORPHING RADIAL BLOBS) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Emerald Blob */}
        <motion.div
          className="absolute top-1/4 left-1/5 w-[420px] h-[420px] bg-emerald-300/15 rounded-full blur-[120px]"
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Royal Blue Blob */}
        <motion.div
          className="absolute bottom-1/4 right-1/5 w-[450px] h-[450px] bg-blue-400/15 rounded-full blur-[120px]"
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.9, 1.2, 1]
          }}
          transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Cyan Blob */}
        <motion.div
          className="absolute top-1/2 right-1/3 w-[380px] h-[380px] bg-cyan-300/15 rounded-full blur-[120px]"
          animate={{
            x: [0, 40, -50, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.1, 0.95, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* LAYER 2: NEURAL NETWORK GRID */}
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <pattern id="neural-ai-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#0284c7" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#neural-ai-grid)" />
        </svg>

        {/* LAYER 3: FLOATING AI PARTICLES */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-emerald-400/40 pointer-events-none"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`
            }}
            animate={{
              y: [0, -60, -120],
              opacity: [0, 0.8, 0],
              x: [0, Math.sin(i) * 30]
            }}
            transition={{
              duration: 12 + (i % 5) * 2,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeInOut'
            }}
          />
        ))}

        {/* Ashoka Chakra Outline Graphic Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.025]">
          <div className="w-[500px] h-[500px] rounded-full border-[8px] border-slate-900 animate-spin-slow" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

        {/* MAIN SECTION HEADING */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-4 md:mb-6"
          initial={{ opacity: 0, y: -15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border border-slate-200/80 shadow-2xs mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-extrabold tracking-widest text-slate-800 uppercase">
              AI POWERED CITIZEN ASSISTANT
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            CivicSphere <span className="gradient-text">Assistant</span>
          </h2>

          <p
            className="text-xs sm:text-sm font-medium text-slate-600 max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Your intelligent multilingual Government welfare companion powered by Artificial Intelligence.
          </p>
        </motion.div>

        {/* DESKTOP GRID (LEFT 40% / RIGHT 60%, 32px Gap, items-start) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[620px]">

          {/* LEFT SIDE — AI CHATBOT WITH FLOATING MOTION & ORBITAL GRAPHICS (40% / 5 cols) */}
          <motion.div
            className="lg:col-span-5 relative flex flex-col justify-between items-center"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* 2. THREE CONCENTRIC ORBITAL RINGS & AI CORE GLOW */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="w-[340px] h-[340px] rounded-full border border-emerald-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute w-[270px] h-[270px] rounded-full border border-dashed border-blue-500/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute w-[200px] h-[200px] rounded-full border border-teal-500/20"
                animate={{ scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3 relative z-20 justify-center w-full">
              {chatScenarios.map((s, idx) => (
                <button
                  key={s.category}
                  onClick={() => setScenarioIndex(idx)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${
                    idx === scenarioIndex
                      ? 'bg-emerald-600 text-white shadow-md scale-105'
                      : 'bg-white/95 backdrop-blur-md text-slate-700 border border-slate-200 hover:bg-white'
                  }`}
                >
                  {s.category}
                </button>
              ))}
            </div>

            {/* 10. CHATBOT FLOATING MOTION CONTAINER (Float Y: -4px to +4px over 6s) */}
            <motion.div
              className="w-full rounded-[28px] bg-slate-900/95 border border-slate-800/90 p-4.5 shadow-2xl backdrop-blur-2xl text-white relative z-10 overflow-hidden flex-1 flex flex-col justify-between min-h-[520px]"
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7.5 h-7.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      CivicSphere Assistant
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </h3>
                    <p className="text-[9px] text-slate-400 font-medium">Government Knowledge Assistant</p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Mic className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Chat Stream Body */}
              <div className="flex-1 space-y-2.5 py-1.5 text-xs overflow-hidden flex flex-col justify-end">
                {animStage !== 'typing' && (
                  <motion.div
                    className="bg-slate-800 text-slate-100 p-2.5 rounded-2xl rounded-tl-none max-w-[92%] border border-slate-700/70 self-start shadow-2xs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="font-medium">"{currentScenario.userText}"</p>
                  </motion.div>
                )}

                {animStage === 'thinking' && (
                  <motion.div
                    className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 max-w-[90%] space-y-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>CivicSphere AI is thinking...</span>
                    </div>
                    <div className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
                      <Brain className="w-3 h-3 text-blue-400 animate-pulse" />
                      Scanning Government Database...
                    </div>
                    <div className="flex gap-1 pt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}

                {animStage === 'scanning' && (
                  <motion.div
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-emerald-400/50 space-y-1 text-[10px]"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center justify-between font-bold text-emerald-400 border-b border-white/10 pb-1">
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Checking Eligibility Rules</span>
                      <span className="text-emerald-300">Match Found</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-200 pt-0.5">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Age Verified</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> State Verified</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Occupation Verified</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Income Verified</span>
                    </div>
                  </motion.div>
                )}

                {(animStage === 'response' || animStage === 'done') && (
                  <motion.div
                    className="bg-gradient-to-r from-emerald-950/90 via-slate-800 to-blue-950/90 text-white p-3 rounded-2xl rounded-tr-none border border-emerald-500/40 space-y-1.5 shadow-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" /> Hello Citizen 👋
                    </div>
                    <p className="text-slate-300 text-[10.5px]">
                      I found Government schemes matching your profile:
                    </p>

                    <div className="space-y-1 pt-0.5">
                      {currentScenario.schemes.map((s, idx) => (
                        <motion.div
                          key={s}
                          className="flex items-center gap-1.5 text-[10.5px] font-medium text-emerald-200"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.2 }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{s}</span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      className="mt-1.5 bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded-xl text-[9.5px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <div className="font-bold text-emerald-400 flex items-center gap-1 mb-0.5">
                        <ShieldCheck className="w-3 h-3" /> Why You're Eligible
                      </div>
                      <div className="flex flex-wrap gap-1 text-[9px] text-slate-300">
                        {currentScenario.whyEligible.map((item, i) => (
                          <span key={i} className="bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700">
                            • {item}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}

              </div>

              {/* Chat Input */}
              <div className="relative flex items-center mt-2.5 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={animStage === 'typing' ? typedText : ''}
                  placeholder={animStage === 'typing' ? '' : 'Ask CivicSphere Assistant about any scheme...'}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none pr-9"
                />
                
                {animStage === 'typing' && (
                  <span className="absolute left-3.5 w-0.5 h-3.5 bg-emerald-400 animate-pulse pointer-events-none" style={{ marginLeft: `${typedText.length * 6.2}px` }} />
                )}

                <motion.button
                  className={`absolute right-2 p-1.5 rounded-lg text-white transition-all ${
                    animStage === 'sending'
                      ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-400/50'
                      : 'bg-emerald-500'
                  }`}
                  animate={animStage === 'sending' ? { x: [0, 4, 0] } : {}}
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </div>

            </motion.div>

            {/* 3. FLOATING GOVERNMENT AI LABELS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-3 w-full relative z-20">
              <motion.div
                className="px-2 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs text-[9.5px] font-bold text-slate-800 flex items-center justify-center gap-1 hover:border-emerald-400 transition-colors"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Secured</span>
              </motion.div>

              <motion.div
                className="px-2 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs text-[9.5px] font-bold text-slate-800 flex items-center justify-center gap-1 hover:border-blue-400 transition-colors"
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Globe className="w-3 h-3 text-blue-600 shrink-0" />
                <span>Multilingual</span>
              </motion.div>

              <motion.div
                className="px-2 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs text-[9.5px] font-bold text-slate-800 flex items-center justify-center gap-1 hover:border-teal-400 transition-colors"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <UserCheck className="w-3 h-3 text-teal-600 shrink-0" />
                <span>Profile Match</span>
              </motion.div>

              <motion.div
                className="px-2 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs text-[9.5px] font-bold text-slate-800 flex items-center justify-center gap-1 hover:border-rose-400 transition-colors"
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Bell className="w-3 h-3 text-rose-600 shrink-0" />
                <span>Real-Time</span>
              </motion.div>

              <motion.div
                className="px-2 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs text-[9.5px] font-bold text-slate-800 flex items-center justify-center gap-1 hover:border-indigo-400 transition-colors"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FileCheck2 className="w-3 h-3 text-indigo-600 shrink-0" />
                <span>Doc Verified</span>
              </motion.div>

              <motion.div
                className="px-2 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs text-[9.5px] font-bold text-slate-800 flex items-center justify-center gap-1 hover:border-emerald-400 transition-colors"
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span>AI Guidance</span>
              </motion.div>
            </div>

          </motion.div>

          {/* RIGHT SIDE — EDITORIAL INFORMATION LAYOUT (NO CARDS) (60% / 7 cols) */}
          <motion.div
            className="lg:col-span-7 flex flex-col justify-between py-1 pl-0 lg:pl-2"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-4">
              
              {/* Header Label */}
              <div>
                <div className="inline-flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-extrabold tracking-widest text-emerald-700 uppercase">
                    AI Powered Government Assistant
                  </span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Meet CivicSphere <span className="gradient-text">Assistant</span>
                </h3>

                {/* Description */}
                <p
                  className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  CivicSphere Assistant helps citizens discover Government welfare schemes, verify eligibility, understand required documents, and receive multilingual AI guidance using Retrieval-Augmented Generation (RAG).
                </p>
              </div>

              {/* 11. 3 INFORMATION BLOCKS WITH STAGGER ANIMATION */}
              <div className="space-y-3 pt-1">
                {/* Row 1 — Eligibility Verification */}
                <motion.div
                  className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/60"
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-0.5">Eligibility Verification</h4>
                      <p className="text-xs text-slate-600 leading-snug">
                        Checks profile eligibility instantly using official Government rules.
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                    <Zap className="w-4 h-4 animate-pulse" />
                  </div>
                </motion.div>

                {/* Row 2 — Government Knowledge + RAG */}
                <motion.div
                  className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/60"
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.35 }}
                >
                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-0.5">Government Knowledge + RAG</h4>
                      <p className="text-xs text-slate-600 leading-snug">
                        Retrieves verified Central, State, and District scheme information before answering.
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                    <Database className="w-4 h-4 animate-pulse" />
                  </div>
                </motion.div>

                {/* Row 3 — Multilingual Citizen Guidance */}
                <motion.div
                  className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/60"
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.45 }}
                >
                  <div className="flex items-start gap-2.5">
                    <Globe className="w-4.5 h-4.5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-0.5">Multilingual Citizen Guidance</h4>
                      <p className="text-xs text-slate-600 leading-snug">
                        Explains schemes, benefits, documents, and eligibility in English, Telugu, and Hindi.
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center text-teal-600 shrink-0 shadow-2xs">
                    <Globe className="w-4 h-4 animate-pulse" />
                  </div>
                </motion.div>
              </div>

              {/* 12. AI WORKFLOW ANIMATION */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Zap className="w-3 h-3" /> AI Architecture Flow
                  </span>
                  <span>RAG Grounded</span>
                </div>

                <div className="flex items-center justify-between gap-1 text-[9.5px] font-semibold text-slate-700 py-1.5 px-3 rounded-xl bg-slate-100/70 border border-slate-200/60">
                  {inlineWorkflow.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <span className="shrink-0">{step}</span>
                      {idx < inlineWorkflow.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

            </div>

            {/* WHY CIVICSPHERE ASSISTANT (BOTTOM TWO COLUMNS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/60">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Why Citizens Trust CivicSphere Assistant
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  CivicSphere Assistant provides verified Government guidance, personalized eligibility matching, and clear document assistance.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" /> AI for Inclusive Governance
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  One AI assistant for every citizen across India, offering multilingual and citizen-friendly access to welfare.
                </p>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  )
}
