import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Target, Compass,
  Sprout, GraduationCap, HeartPulse, Briefcase, Users,
  Building2, Accessibility, Search, Sparkles, ShieldCheck,
  Globe, Cpu, MapPin, Flag
} from 'lucide-react'

// Citizen Feed Categories (Requirement 5)
const citizenCards = [
  {
    id: 'farmers',
    icon: <Sprout className="w-5 h-5 text-emerald-600" />,
    title: 'Farmers',
    description: 'PM-KISAN, crop insurance, fertilizer subsidies, & agricultural credit.',
    badge: 'Agriculture',
    bgIcon: 'bg-emerald-50 border-emerald-100',
    accentBorder: 'border-emerald-300/80',
  },
  {
    id: 'students',
    icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
    title: 'Students',
    description: 'Post-matric scholarships, merit aid, tuition waivers, & study laptops.',
    badge: 'Education',
    bgIcon: 'bg-blue-50 border-blue-100',
    accentBorder: 'border-blue-300/80',
  },
  {
    id: 'women',
    icon: <Users className="w-5 h-5 text-amber-600" />,
    title: 'Women',
    description: 'Maternal health benefits, self-help group loans, & entrepreneur grants.',
    badge: 'Empowerment',
    bgIcon: 'bg-amber-50 border-amber-100',
    accentBorder: 'border-amber-300/80',
  },
  {
    id: 'senior-citizens',
    icon: <HeartPulse className="w-5 h-5 text-rose-600" />,
    title: 'Senior Citizens',
    description: 'Old-age pension schemes, healthcare coverage, & travel cards.',
    badge: 'Welfare',
    bgIcon: 'bg-rose-50 border-rose-100',
    accentBorder: 'border-rose-300/80',
  },
  {
    id: 'workers',
    icon: <Briefcase className="w-5 h-5 text-purple-600" />,
    title: 'Workers & Laborers',
    description: 'MGNREGA wage employment, unorganized sector insurance, & pensions.',
    badge: 'Employment',
    bgIcon: 'bg-purple-50 border-purple-100',
    accentBorder: 'border-purple-300/80',
  },
  {
    id: 'entrepreneurs',
    icon: <Building2 className="w-5 h-5 text-indigo-600" />,
    title: 'Entrepreneurs',
    description: 'PMEGP loans, Mudra Yojana capital, & MSME startup subsidies.',
    badge: 'Business',
    bgIcon: 'bg-indigo-50 border-indigo-100',
    accentBorder: 'border-indigo-300/80',
  },
  {
    id: 'pwd',
    icon: <Accessibility className="w-5 h-5 text-teal-600" />,
    title: 'Persons with Disabilities',
    description: 'Divyangjan pension, assistive technology grants, & reservation aid.',
    badge: 'Inclusion',
    bgIcon: 'bg-teal-50 border-teal-100',
    accentBorder: 'border-teal-300/80',
  },
  {
    id: 'job-seekers',
    icon: <Search className="w-5 h-5 text-orange-600" />,
    title: 'Job Seekers',
    description: 'Skill India training programs, apprenticeship stipends, & placement exchange.',
    badge: 'Skill India',
    bgIcon: 'bg-orange-50 border-orange-100',
    accentBorder: 'border-orange-300/80',
  },
]

// Government Coverage Dashboard Cards (Requirement 8)
const govCoverageStats = [
  {
    icon: <Flag className="w-5 h-5 text-emerald-600" />,
    title: '🇮🇳 Central Government',
    label: 'National Welfare Schemes across all Ministries',
    bg: 'bg-emerald-50/80 border-emerald-100/90',
  },
  {
    icon: <Building2 className="w-5 h-5 text-blue-600" />,
    title: '🏛️ State Governments',
    label: 'All Indian State & Union Territory Schemes',
    bg: 'bg-blue-50/80 border-blue-100/90',
  },
  {
    icon: <MapPin className="w-5 h-5 text-amber-600" />,
    title: '📍 District Welfare',
    label: 'District-Level Citizen & Rural Services',
    bg: 'bg-amber-50/80 border-amber-100/90',
  },
  {
    icon: <Globe className="w-5 h-5 text-purple-600" />,
    title: '🌐 Multilingual Services',
    label: 'English • Telugu • Hindi Multilingual AI',
    bg: 'bg-purple-50/80 border-purple-100/90',
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

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  // Vertical Carousel Feed for Who Benefits
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % citizenCards.length)
    }, 2000)

    return () => clearInterval(timer)
  }, [])

  const currentCard = citizenCards[activeCardIndex]

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative pt-8 pb-8 overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-slate-50/50"
      aria-label="About CivicSphere"
    >
      {/* Seamless Transition Overlay */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/95 via-slate-50/30 to-transparent pointer-events-none z-10" />

      {/* Layered Premium Background (Requirement 9) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Layer 2: Gradient Blobs */}
        <div className="absolute top-[8%] left-[-3%] w-[600px] h-[600px] rounded-full bg-emerald-400/10 filter blur-3xl" />
        <div className="absolute top-[42%] right-[-3%] w-[600px] h-[600px] rounded-full bg-blue-400/10 filter blur-3xl" />
        <div className="absolute bottom-[5%] left-[25%] w-[500px] h-[500px] rounded-full bg-amber-400/08 filter blur-3xl" />

        {/* Layer 3: Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Layer 5: India Map Contour Vector */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035] stroke-slate-800" fill="none">
          <path d="M-100,180 Q400,80 900,350 T1800,180" strokeWidth="1.5" />
          <path d="M-100,480 Q500,280 1100,580 T1900,380" strokeWidth="1.5" />
        </svg>

        {/* Ashoka Chakra circular ring outline */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[760px] h-[760px] rounded-full border border-dashed border-emerald-600/[0.04] animate-spin-slow" />

        {/* Layer 6: Floating Particles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-emerald-500/25"
            style={{
              width: `${(i % 3) + 3}px`,
              height: `${(i % 3) + 3}px`,
              left: `${6 + i * 9.5}%`,
              top: `${12 + (i % 4) * 20}%`,
              animation: `particle-float ${7 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.35}s`,
            }}
          />
        ))}
      </div>

      {/* Requirement 1: Max-Width 1440px Container */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 z-10">

        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-10"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          custom={0}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-2.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ABOUT CIVICSPHERE</span>
          </div>

          {/* Headline */}
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-2">
            About{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              CivicSphere
            </span>
          </h2>

          {/* Subtitle */}
          <p className="font-heading text-base sm:text-lg font-bold text-slate-700 leading-snug">
            An Intelligent Platform Connecting Every Citizen with the Right Government Schemes
          </p>
        </motion.div>

        {/* Two-Column Master Layout 
            LEFT COLUMN (Span 5): Digital Governance Ecosystem Architecture + Beneficiaries Showcase
            RIGHT COLUMN (Span 7): National Purpose, Expanded Challenges vs Solution, Mission/Vision & Gov Coverage Dashboard
        */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT SIDE (Span 5): Digital Governance Ecosystem Architecture (Req 2 & 3) + Who Benefits Showcase (Req 5) */}
          <motion.div
            className="lg:col-span-5 space-y-6 lg:sticky lg:top-24"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Seamless Ecosystem Diagram (No Card Border Container) */}
            <div className="relative w-full aspect-square sm:aspect-[4/3.5] flex items-center justify-center overflow-hidden">
              
              {/* Outer Rotating Ring & Hub Glow */}
              <div className="absolute w-[310px] h-[310px] sm:w-[350px] sm:h-[350px] rounded-full border border-dashed border-emerald-500/25 animate-spin-slow" />
              <div className="absolute w-[240px] h-[240px] sm:w-[270px] sm:h-[270px] rounded-full border border-blue-500/20" />
              <div className="absolute w-44 h-44 rounded-full bg-emerald-500/15 filter blur-xl animate-pulse" />

              {/* CENTER HUB: CivicSphere Intelligence Hub */}
              <motion.div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 p-1 shadow-xl shadow-emerald-600/30 z-20 flex items-center justify-center cursor-pointer"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center text-center p-1.5 shadow-inner">
                  <Cpu className="w-5 h-5 text-emerald-600 mb-0.5" />
                  <span className="font-heading text-[10px] sm:text-[11px] font-extrabold text-slate-900 leading-tight">
                    CivicSphere Hub
                  </span>
                  <span className="text-[7.5px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5">
                    AI • RAG • Eligibility
                  </span>
                </div>
              </motion.div>

              {/* Sector Nodes */}
              <motion.div 
                className="absolute top-2 left-2 glass-card rounded-xl p-2 text-[10.5px] font-bold text-slate-800 border border-emerald-200/80 flex items-center gap-1.5 z-30 shadow-xs hover:scale-105 transition-transform"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>🌾 Agriculture</span>
              </motion.div>

              <motion.div 
                className="absolute top-2 right-2 glass-card rounded-xl p-2 text-[10.5px] font-bold text-slate-800 border border-blue-200/80 flex items-center gap-1.5 z-30 shadow-xs hover:scale-105 transition-transform"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              >
                <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                <span>🎓 Education</span>
              </motion.div>

              <motion.div 
                className="absolute top-1/2 right-1 -translate-y-1/2 glass-card rounded-xl p-2 text-[10.5px] font-bold text-slate-800 border border-rose-200/80 flex items-center gap-1.5 z-30 shadow-xs hover:scale-105 transition-transform"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              >
                <HeartPulse className="w-4 h-4 text-rose-600 shrink-0" />
                <span>❤️ Healthcare</span>
              </motion.div>

              <motion.div 
                className="absolute bottom-2 right-2 glass-card rounded-xl p-2 text-[10.5px] font-bold text-slate-800 border border-purple-200/80 flex items-center gap-1.5 z-30 shadow-xs hover:scale-105 transition-transform"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
              >
                <Briefcase className="w-4 h-4 text-purple-600 shrink-0" />
                <span>💼 Employment</span>
              </motion.div>

              <motion.div 
                className="absolute bottom-2 left-2 glass-card rounded-xl p-2 text-[10.5px] font-bold text-slate-800 border border-amber-200/80 flex items-center gap-1.5 z-30 shadow-xs hover:scale-105 transition-transform"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              >
                <Users className="w-4 h-4 text-amber-600 shrink-0" />
                <span>🤝 Social Welfare</span>
              </motion.div>

              <motion.div 
                className="absolute top-1/2 left-1 -translate-y-1/2 glass-card rounded-xl p-2 text-[10.5px] font-bold text-slate-800 border border-indigo-200/80 flex items-center gap-1.5 z-30 shadow-xs hover:scale-105 transition-transform"
                animate={{ x: [0, -4, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>🛡️ Gov Secured</span>
              </motion.div>

              {/* SVG Connected Network Paths */}
              <svg className="absolute inset-0 w-full h-full opacity-40 stroke-emerald-600 pointer-events-none" fill="none">
                <line x1="50%" y1="50%" x2="20%" y2="15%" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="80%" y2="15%" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="85%" y2="50%" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="80%" y2="85%" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="20%" y2="85%" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="15%" y2="50%" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
            </div>
          </motion.div>

            {/* RIGHT SIDE (Span 7): National Purpose & Mission/Vision */}
          <motion.div
            className="lg:col-span-7 space-y-5"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* National Platform Purpose */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xs">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                National Governance Architecture
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 mb-2.5">
                Unified Governance Platform for Every Citizen
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                <p>
                  CivicSphere brings together <strong>Central, State, and District Government welfare schemes</strong> into one intelligent multilingual platform that simplifies scheme discovery, eligibility verification, and citizen guidance using AI.
                </p>
                <p>
                  Supporting departments across Agriculture, Education, Healthcare, Employment, Social Welfare, and Citizen Services, CivicSphere uses rule-based AI reasoning and Retrieval-Augmented Generation (RAG) to eliminate policy jargon and deliver native language assistance.
                </p>
              </div>
            </div>

            {/* Mission & Vision Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Mission */}
              <motion.div
                className="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/30 to-white shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white group-hover:scale-105 transition-transform">
                    <Target className="w-4 h-4" />
                  </div>
                  <h4 className="font-heading text-base font-bold text-slate-900">Our Mission</h4>
                </div>
                <p className="text-xs font-bold text-emerald-800 mb-1">
                  Making Government Welfare Accessible
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Delivering personalized, transparent, and simple access to welfare schemes using Artificial Intelligence so no eligible citizen is left behind.
                </p>
              </motion.div>

              {/* Vision */}
              <motion.div
                className="glass-card rounded-2xl p-4 sm:p-5 border border-blue-200/80 bg-gradient-to-br from-white via-blue-50/30 to-white shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-blue-600 text-white group-hover:scale-105 transition-transform">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h4 className="font-heading text-base font-bold text-slate-900">Our Vision</h4>
                </div>
                <p className="text-xs font-bold text-blue-800 mb-1">
                  Building India's AI Governance Platform
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Transforming scheme discovery into a seamless, conversational, and multilingual AI service setting the national benchmark for digital governance.
                </p>
              </motion.div>
            </div>
          </motion.div>

        </div>

        {/* BOTTOM SINGLE HORIZONTAL ROW: "Who Benefits?" + "Government Coverage Dashboard" Cards */}
        <motion.div
          className="mt-8 pt-6 border-t border-slate-200/60"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="grid lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Who Benefits Horizontal Card (Span 4) */}
            <div className="lg:col-span-4 bg-white/95 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping-slow" />
                    Who Benefits from CivicSphere?
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">Citizen-Centric Platform Showcase</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                  Citizen Feed
                </span>
              </div>

              {/* Compact Feed Carousel */}
              <div className="relative w-full h-[64px] flex flex-col items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`feed-bot-${currentCard.id}`}
                    initial={{ y: 20, opacity: 0, scale: 0.96 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -20, opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                    className={`w-full glass-card rounded-xl p-2 border ${currentCard.accentBorder} bg-slate-50/90 shadow-2xs flex items-center gap-2.5`}
                  >
                    <div className={`p-1.5 rounded-lg ${currentCard.bgIcon} shrink-0`}>
                      {currentCard.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-heading text-xs font-bold text-slate-900 truncate">
                          {currentCard.title}
                        </h5>
                        <span className="text-[8.5px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {currentCard.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 truncate font-medium">
                        {currentCard.description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dots */}
              <div className="flex items-center justify-center gap-1 mt-1.5">
                {citizenCards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => setActiveCardIndex(idx)}
                    className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeCardIndex
                        ? 'w-4 bg-emerald-600'
                        : 'w-1 bg-slate-300'
                    }`}
                    aria-label={`Go to beneficiary slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* 4 Government Coverage Cards (Span 8 - Single Row) */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                Government Coverage Dashboard
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-full">
                {govCoverageStats.map((stat) => (
                  <motion.div
                    key={stat.title}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`p-3 rounded-2xl border ${stat.bg} bg-white/95 backdrop-blur-md shadow-2xs flex flex-col justify-between transition-all cursor-pointer`}
                  >
                    <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100 w-fit mb-1.5">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 leading-tight">
                        {stat.title}
                      </p>
                      <p className="text-[9.5px] text-slate-500 font-semibold mt-0.5 leading-snug">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}
