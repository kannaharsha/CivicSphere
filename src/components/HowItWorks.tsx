import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Brain,
  Bot,
  BellRing,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'

// --- 5 Workflow Steps Data ---
const workflowSteps = [
  {
    step: '01',
    heading: 'Create Your Citizen Profile',
    desc: 'Register securely using your personal information such as age, occupation, income, family details, caste category, location, and preferred language.',
    chips: ['Firebase Authentication', 'Secure Citizen Profile', 'Multilingual Registration'],
    glowColor: 'shadow-emerald-500/20',
    borderColor: 'border-emerald-200',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cardTitle: 'Citizen Registration Form',
    IllustrationComponent: RegisterCardIllustration
  },
  {
    step: '02',
    heading: 'AI Checks Your Eligibility',
    desc: 'The AI Eligibility Engine analyzes your profile against Central, State, and District Government scheme eligibility rules to identify matching schemes.',
    chips: ['AI Eligibility Engine', 'Rule-Based Matching', 'Government Scheme Database'],
    glowColor: 'shadow-blue-500/20',
    borderColor: 'border-blue-200',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    cardTitle: 'AI Eligibility Engine',
    IllustrationComponent: EligibilityEngineCardIllustration
  },
  {
    step: '03',
    heading: 'Get Personalized Scheme Recommendations',
    desc: 'CivicSphere recommends the most relevant Government schemes based on your profile, location, occupation, income category, and eligibility.',
    chips: ['Personalized Dashboard', 'Smart Recommendations', 'Benefit Ranking'],
    glowColor: 'shadow-amber-500/20',
    borderColor: 'border-amber-200',
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    cardTitle: 'Smart Scheme Recommendations',
    IllustrationComponent: RecommendationsCardIllustration
  },
  {
    step: '04',
    heading: 'Chat with CivicSphere AI Assistant',
    desc: 'Ask questions in English, Telugu, or Hindi. The AI Assistant explains scheme eligibility, required documents, deadlines, and benefits using RAG.',
    chips: ['AI Assistant', 'RAG Knowledge', 'Multilingual AI'],
    glowColor: 'shadow-teal-500/20',
    borderColor: 'border-teal-200',
    badgeStyle: 'bg-teal-50 text-teal-700 border-teal-200',
    cardTitle: 'AI RAG Assistant',
    IllustrationComponent: AssistantCardIllustration
  },
  {
    step: '05',
    heading: 'Receive Smart Notifications',
    desc: 'Stay informed about newly launched Government schemes, application deadlines, eligibility reminders, benefit announcements, and important updates.',
    chips: ['Smart Notifications', 'Deadline Alerts', 'New Scheme Updates'],
    glowColor: 'shadow-rose-500/20',
    borderColor: 'border-rose-200',
    badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
    cardTitle: 'Smart Notification Alerts',
    IllustrationComponent: NotificationsCardIllustration
  }
]

// ============================================================================
// MICRO-ILLUSTRATIONS FOR FLOATING CARDS
// ============================================================================

function RegisterCardIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-3">
      <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
            IN
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Citizen Identity Profile</div>
            <div className="text-[9px] text-slate-400">Firebase Encrypted Profile</div>
          </div>
        </div>
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between bg-slate-50 p-1 rounded text-slate-700">
            <span>Demographics</span> <span className="font-bold">28 Yrs / AP / Farmer</span>
          </div>
          <div className="flex justify-between bg-slate-50 p-1 rounded text-slate-700">
            <span>Language</span> <span className="font-bold">English • తెలుగు • हिंदी</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[9px] text-emerald-600 font-bold pt-1">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Verified Profile</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        </div>
      </div>
    </div>
  )
}

function EligibilityEngineCardIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <motion.div
        className="w-28 h-28 rounded-full border-2 border-dashed border-blue-400/60 absolute"
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 z-10">
        <Brain className="w-7 h-7" />
      </div>
      <motion.div
        className="absolute top-1 right-2 bg-white px-2.5 py-1 rounded-full border border-blue-200 shadow-xs text-[9px] font-bold text-blue-700"
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Matching 500+ Rules...
      </motion.div>
    </div>
  )
}

function RecommendationsCardIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-3">
      <div className="w-full bg-white border border-amber-200 rounded-2xl p-3.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            ★ 98% Match
          </span>
          <span className="text-[9px] font-bold text-slate-400">Housing Scheme</span>
        </div>
        <div className="text-xs font-bold text-slate-800">PM Awas Yojana (Urban)</div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" initial={{ width: '0%' }} animate={{ width: '98%' }} transition={{ duration: 1.2 }} />
        </div>
        <div className="flex justify-between text-[9px] font-medium text-slate-500">
          <span>Benefit Ranking</span>
          <span className="font-bold text-emerald-600">High Priority</span>
        </div>
      </div>
    </div>
  )
}

function AssistantCardIllustration() {
  return (
    <div className="w-full h-full relative flex flex-col justify-center px-3 space-y-2">
      <div className="bg-slate-100 text-slate-800 text-[10px] p-2.5 rounded-xl rounded-tl-none self-start max-w-[85%] border border-slate-200">
        How do I claim PM Kisan subsidy?
      </div>
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-[10px] p-2.5 rounded-xl rounded-tr-none self-end max-w-[90%] shadow-md">
        <div className="flex items-center gap-1 font-bold text-[9px] text-teal-100 mb-0.5">
          <Bot className="w-3.5 h-3.5" /> RAG Knowledge Base
        </div>
        Small farmers with &lt;2 hectares receive ₹6,000 yearly in 3 installments.
      </div>
    </div>
  )
}

function NotificationsCardIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-3">
      <div className="w-full bg-white border border-rose-200 rounded-2xl p-3 shadow-xs flex items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 shrink-0"
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <BellRing className="w-5 h-5" />
        </motion.div>
        <div>
          <div className="text-xs font-bold text-slate-800">New Scheme Launched!</div>
          <div className="text-[10px] font-bold text-rose-600">Deadline: March 31st Alert</div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HowItWorks() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  // 3. Perfect Auto Flow Infinite Loop: 4.0s visible + 0.7s transition = 4.7s (4700ms)
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % workflowSteps.length)
    }, 4700)
    return () => clearInterval(timer)
  }, [isPaused])

  const currentStep = workflowSteps[activeStepIndex]

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative pt-2 pb-3 md:pt-4 md:pb-4 bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-50 overflow-hidden min-h-[640px] flex flex-col justify-center"
      aria-label="How CivicSphere works"
    >
      {/* 9. SUBTLE BACKGROUND MOTION */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />

        <svg className="w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <pattern id="workflow-prod-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#475569" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#workflow-prod-grid)" />
        </svg>

        {/* Ashoka Chakra Outline Graphic */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.025]">
          <div className="w-[480px] h-[480px] rounded-full border-[8px] border-slate-900 animate-spin-slow" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

        {/* SECTION HEADER */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border border-slate-200/80 shadow-2xs mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-slate-700 uppercase">
              AI CITIZEN WORKFLOW
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            How CivicSphere Works — <span className="gradient-text">Intelligent Journey</span>
          </h2>
        </motion.div>

        {/* 2. SPLIT-SCREEN CONTAINER (6 cols / 6 cols, Gap: 24px) */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[350px] relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 8. AI CURVED CONNECTION LINE BETWEEN LEFT AND RIGHT */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block z-0">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 500 180 Q 640 120 780 180"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-40"
              />
              <motion.circle
                r="4"
                fill="#22c55e"
                animate={{
                  cx: [500, 780],
                  cy: [180, 180],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </div>

          {/* LEFT SIDE: INFORMATION PANEL (6 cols / 55%) — Exit/Enter 600ms */}
          <div className="lg:col-span-6 relative flex flex-col justify-center min-h-[340px]">
            {/* Background Transparent Step Number */}
            <div className="absolute -top-10 -left-4 text-[110px] font-black text-slate-200/40 select-none pointer-events-none font-mono">
              {currentStep.step}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStepIndex}
                initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 space-y-3.5 pr-0 lg:pr-4"
              >
                {/* STEP BADGE */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200/90 text-slate-700 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  STEP {currentStep.step} OF 05
                </span>

                {/* Main Heading */}
                <h3
                  className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {currentStep.heading}
                </h3>

                {/* Description (3-4 Lines) */}
                <p
                  className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {currentStep.desc}
                </p>

                {/* AI Highlight Chips */}
                <div className="pt-1 flex flex-wrap gap-2">
                  {currentStep.chips.map((chip, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold bg-white border transition-colors duration-300 ${
                        isPaused ? 'border-emerald-300 bg-emerald-50/60 text-emerald-800' : 'border-slate-200/80 text-slate-700'
                      }`}
                    >
                      ✓ {chip}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT SIDE: FLOATING FEATURE CARD (6 cols / 45%) — 700ms Spring */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStepIndex}
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.96 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full max-w-sm bg-white/95 backdrop-blur-2xl border ${currentStep.borderColor} rounded-[28px] p-5 shadow-xl ${currentStep.glowColor} relative overflow-hidden group cursor-pointer animate-float-slow`}
              >
                {/* Header inside Card */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    CIVICSPHERE AI MODULE
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentStep.badgeStyle}`}>
                    Step {currentStep.step}
                  </span>
                </div>

                {/* Card Title */}
                <h4 className="text-sm font-bold text-slate-900 mb-2.5">{currentStep.cardTitle}</h4>

                {/* Micro Illustration Container */}
                <div className="h-40 w-full rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 flex items-center justify-center relative overflow-hidden">
                  <currentStep.IllustrationComponent />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* 7. CONNECTED PROGRESS BAR ANIMATION (Smooth 4.0s Line Fill) */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-200/80 shadow-2xs">
            {workflowSteps.map((s, index) => {
              const isActive = index === activeStepIndex
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStepIndex(index)}
                  className="relative w-8 h-2 rounded-full bg-slate-200 overflow-hidden cursor-pointer"
                  aria-label={`Jump to step ${s.step}`}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: isPaused ? 0.2 : 4.0, ease: 'linear' }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <span className="text-[10px] font-medium text-slate-400">
            {isPaused ? '⏸ Paused (Hovering)' : '⚡ Infinite AI Workflow Loop (4.0s step timer)'}
          </span>
        </div>

      </div>
    </section>
  )
}
