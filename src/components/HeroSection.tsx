import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, FileText, ShieldCheck, Globe, Bell, CheckCircle,
  LayoutDashboard, Sparkles, ArrowRight, Layers, Cpu, Building2, Shield
} from 'lucide-react'

// Feature Cards (Requirement 5)
const featureCards = [
  {
    id: 'ai-assistant',
    icon: <Bot className="w-5 h-5 text-emerald-600" />,
    title: 'AI Assistant',
    description: 'Ask Questions About Government Schemes',
    badge: '● Online',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    colorBg: 'from-emerald-500/10 to-teal-500/10',
    borderColor: 'border-emerald-300/60',
    glowColor: 'rgba(16, 185, 129, 0.2)',
  },
  {
    id: 'eligibility-checker',
    icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
    title: 'Eligibility Checker',
    description: 'Instant Eligibility Verification',
    badge: 'AI Powered',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
    colorBg: 'from-blue-500/10 to-indigo-500/10',
    borderColor: 'border-blue-300/60',
    glowColor: 'rgba(37, 99, 235, 0.2)',
  },
  {
    id: 'personalized-dashboard',
    icon: <LayoutDashboard className="w-5 h-5 text-purple-600" />,
    title: 'Personalized Dashboard',
    description: 'Smart Scheme Recommendations',
    badge: 'Smart Recommendations',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
    colorBg: 'from-purple-500/10 to-violet-500/10',
    borderColor: 'border-purple-300/60',
    glowColor: 'rgba(147, 51, 234, 0.2)',
  },
  {
    id: 'multilingual-support',
    icon: <Globe className="w-5 h-5 text-amber-600" />,
    title: 'Multilingual Support',
    description: 'English • Telugu • Hindi',
    badge: 'Citizen Friendly',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    colorBg: 'from-amber-500/10 to-orange-500/10',
    borderColor: 'border-amber-300/60',
    glowColor: 'rgba(245, 158, 11, 0.2)',
  },
  {
    id: 'smart-notifications',
    icon: <Bell className="w-5 h-5 text-emerald-600" />,
    title: 'Smart Notifications',
    description: 'Deadlines & Government Updates',
    badge: 'Real-Time Alerts',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    colorBg: 'from-emerald-500/10 to-green-500/10',
    borderColor: 'border-emerald-300/60',
    glowColor: 'rgba(16, 185, 129, 0.2)',
  },
  {
    id: 'secure-citizen-profile',
    icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
    title: 'Secure Citizen Profile',
    description: 'Firebase Authentication + PostgreSQL',
    badge: 'Government Secure',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
    colorBg: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-300/60',
    glowColor: 'rgba(37, 99, 235, 0.2)',
  },
]

// Statistics Data
const statisticsData = [
  {
    value: '0',
    label: 'Government Schemes',
    sublabel: 'Schemes Available',
    icon: <FileText className="w-4 h-4 text-emerald-600" />,
  },
  {
    value: '5',
    label: 'Service Sectors',
    sublabel: 'Key Focus Areas',
    icon: <Layers className="w-4 h-4 text-blue-600" />,
  },
  {
    value: '3',
    label: 'Languages Supported',
    sublabel: 'English, Telugu, Hindi',
    icon: <Globe className="w-4 h-4 text-amber-600" />,
  },
  {
    value: 'AI',
    label: 'Eligibility Engine',
    sublabel: 'Personalized Logic',
    icon: <Cpu className="w-4 h-4 text-purple-600" />,
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' as const },
  }),
}

export default function HeroSection() {
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  // Vertical card loop animation cycle (Requirement 4)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % featureCards.length)
    }, 2000) // 0.5s Enter + 1s Stay + 0.5s Exit = 2s

    return () => clearInterval(timer)
  }, [])

  const prevIndex = (activeCardIndex - 1 + featureCards.length) % featureCards.length
  const nextIndex = (activeCardIndex + 1) % featureCards.length

  const prevCard = featureCards[prevIndex]
  const currentCard = featureCards[activeCardIndex]
  const nextCard = featureCards[nextIndex]

  return (
    <section
      id="home"
      className="relative min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden pt-24 pb-16 transition-colors duration-500"
      style={{
        background: 'linear-gradient(135deg, #FAFBFD 0%, #F0F6FF 40%, #ECFDF5 75%, #FFFDF9 100%)',
      }}
      aria-label="CivicSphere Hero"
    >
      {/* ==================== Layered Background Visual Elements (Requirements 1, 2 & 8) ==================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        
        {/* Layer 2: Animated Gradient Blobs (Requirement 1 - Layer 2) */}
        <div className="absolute top-[-5%] left-[-5%] w-[550px] h-[550px] rounded-full bg-emerald-400/10 animate-blob filter blur-3xl" />
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/12 animate-blob animation-delay-2000 filter blur-3xl" />
        <div className="absolute bottom-[-10%] left-[25%] w-[480px] h-[480px] rounded-full bg-amber-400/08 animate-blob animation-delay-4000 filter blur-3xl" />

        {/* Layer 3: Government Grid Texture with edge fade (Requirement 1 - Layer 3) */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
          }}
        />

        {/* Layer 4: AI Network Motion Graphics & Neural Lines (Requirement 1 - Layer 4) */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] stroke-slate-800" fill="none">
          <path d="M-50,220 Q400,80 800,380 T1600,220" strokeWidth="1.5" />
          <path d="M-50,480 Q500,280 1000,550 T1800,380" strokeWidth="1.5" />
          {/* Animated node pulses */}
          <circle cx="400" cy="150" r="3" className="fill-emerald-500 animate-ping-slow" />
          <circle cx="800" cy="380" r="4" className="fill-blue-500 animate-ping-slow" />
          <circle cx="1000" cy="550" r="3" className="fill-amber-500 animate-ping-slow" />
        </svg>

        {/* Layer 5: Floating Civic Graphic Elements (Requirement 1 - Layer 5) */}
        <div className="absolute top-[18%] left-[10%] opacity-[0.06] text-slate-800 animate-float-slow">
          <Building2 className="w-24 h-24 stroke-[1]" />
        </div>
        <div className="absolute bottom-[20%] left-[45%] opacity-[0.05] text-slate-800 animate-float">
          <Shield className="w-28 h-28 stroke-[1]" />
        </div>
        <div className="absolute top-[12%] right-[42%] opacity-[0.06] text-emerald-800 animate-float-slow">
          <Sparkles className="w-20 h-20 stroke-[1]" />
        </div>

        {/* Ashoka Chakra inspired circular outlines */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full border border-slate-900/[0.03] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-dashed border-emerald-600/[0.05] animate-spin-slow pointer-events-none" />

        {/* Requirement 2: Premium Background Particle System */}
        {[...Array(12)].map((_, i) => {
          const isSparkle = i % 3 === 0
          const isSquare = i % 4 === 0
          return (
            <div
              key={i}
              className={`absolute rounded-full ${
                i % 2 === 0 ? 'bg-emerald-500/30' : 'bg-blue-500/25'
              }`}
              style={{
                width: isSparkle ? '4px' : isSquare ? '3px' : '5px',
                height: isSparkle ? '4px' : isSquare ? '3px' : '5px',
                borderRadius: isSquare ? '1px' : '50%',
                left: `${6 + i * 8}%`,
                top: `${20 + (i % 5) * 16}%`,
                animation: `particle-float ${7 + i * 0.9}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.4 + (i % 4) * 0.15,
              }}
            />
          )
        })}
      </div>

      {/* ==================== Main Grid Content ==================== */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Content Column (Span 7) */}
          <div className="lg:col-span-7 text-center lg:text-left">

            {/* Main Headline */}
            <motion.h1
              className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-4 text-slate-900"
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                CivicSphere
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-5 leading-tight"
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              An{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-extrabold">
                Intelligent Platform
              </span>{' '}
              for Personalized{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-extrabold">
                Citizen-Centric
              </span>{' '}
              <span className="bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent font-extrabold">
                Government Schemes
              </span>
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              CivicSphere empowers Indian citizens to discover welfare benefits, instantly verify eligibility through AI reasoning, and receive tailored scheme recommendations in their preferred language.
            </motion.p>

            {/* Compact CTA Buttons (Requirement 3) */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start mb-10"
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              {/* Explore Schemes Pill Button */}
              <button
                id="hero-explore-btn"
                className="group h-[48px] px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-semibold rounded-full shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/35 hover:scale-[1.03] transition-all duration-250 ease-out flex items-center justify-center gap-2 text-sm cursor-pointer"
                aria-label="Explore government schemes"
              >
                <span>Explore Schemes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-250" />
              </button>

              {/* Check Eligibility Button */}
              <button
                id="hero-check-eligibility-btn"
                className="h-[48px] px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold rounded-full border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-250 ease-out flex items-center justify-center gap-2 text-sm cursor-pointer"
                aria-label="Check eligibility"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Check Eligibility</span>
              </button>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5 pt-4 border-t border-slate-200/60"
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              {statisticsData.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                      {stat.icon}
                    </div>
                    <div className="font-heading text-lg font-black text-slate-900">{stat.value}</div>
                  </div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">{stat.label}</div>
                  <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{stat.sublabel}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column — Vertical Intelligent Feature Cards Flow (Requirements 4, 5, 6, 7) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[460px]">
            
            {/* Requirement 7: Hero Illustration Circular Glowing Container Anchor */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Soft blurred emerald circle */}
              <div 
                className="w-72 h-72 rounded-full filter blur-3xl transition-all duration-700 opacity-50"
                style={{ backgroundColor: currentCard.glowColor }}
              />
              {/* Blue outer ring */}
              <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-blue-500/10" />
              {/* Dashed 12s rotating ring */}
              <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-dashed border-emerald-500/20 animate-spin-slow" />
            </div>

            {/* Requirement 6: Subtle Motion Floating Elements around Cards */}
            <div className="absolute top-2 left-4 p-2 rounded-xl bg-white/90 backdrop-blur-md shadow-sm border border-slate-100 animate-float z-30 hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Government Secured</span>
            </div>
            <div className="absolute bottom-2 right-4 p-2 rounded-xl bg-white/90 backdrop-blur-md shadow-sm border border-slate-100 animate-float-slow z-30 hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Updates</span>
            </div>

            {/* Requirement 4: Vertical Card Flow Stage */}
            <div className="relative w-full max-w-md h-[400px] flex flex-col items-center justify-center overflow-hidden px-2">
              
              {/* Top Faded Card (Moving Outward Upwards) */}
              <motion.div
                key={`top-${prevCard.id}`}
                className="absolute top-2 w-[90%] glass-card rounded-2xl p-3.5 border border-slate-200/60 shadow-sm opacity-30 blur-[1px] scale-95 pointer-events-none z-10 transition-all duration-500"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${prevCard.colorBg}`}>
                    {prevCard.icon}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-700 truncate">{prevCard.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{prevCard.description}</p>
                  </div>
                </div>
              </motion.div>

              {/* Active Central Primary Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`center-${currentCard.id}`}
                  initial={{ y: 60, opacity: 0, scale: 0.94, filter: 'blur(4px)' }}
                  animate={{ y: 0, opacity: 1, scale: 1.02, filter: 'blur(0px)' }}
                  exit={{ y: -60, opacity: 0, scale: 0.94, filter: 'blur(4px)' }}
                  transition={{
                    duration: 0.5,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                  className={`w-full glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border ${currentCard.borderColor} relative z-20 bg-white/95 backdrop-blur-xl my-auto`}
                >
                  {/* Top Badge & Sparkle */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${currentCard.badgeClass}`}>
                      {currentCard.badge}
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentCard.colorBg} border border-slate-100 shadow-inner flex items-center justify-center shrink-0`}>
                      {currentCard.icon}
                    </div>
                    <div>
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                        {currentCard.title}
                      </h3>
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        CivicSphere Feature
                      </p>
                    </div>
                  </div>

                  {/* Description Box */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 font-medium bg-slate-50/90 p-3 rounded-xl border border-slate-100">
                    {currentCard.description}
                  </p>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-2.5 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 text-slate-700 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-slow" />
                      Live Feed
                    </span>
                    <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                      Explore Feature <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom Faded Card (Entering from Below) */}
              <motion.div
                key={`bottom-${nextCard.id}`}
                className="absolute bottom-2 w-[90%] glass-card rounded-2xl p-3.5 border border-slate-200/60 shadow-sm opacity-30 blur-[1px] scale-95 pointer-events-none z-10 transition-all duration-500"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${nextCard.colorBg}`}>
                    {nextCard.icon}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-700 truncate">{nextCard.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{nextCard.description}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Vertical Flow Navigation Indicators */}
            <div className="flex items-center gap-1.5 mt-3 z-20">
              {featureCards.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => setActiveCardIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeCardIndex
                      ? 'w-5 bg-emerald-600'
                      : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to feature card ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Scroll to explore</p>
        <motion.div
          className="w-4 h-6 border-2 border-slate-300/80 rounded-full flex items-start justify-center pt-1"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-1 h-1 bg-emerald-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
