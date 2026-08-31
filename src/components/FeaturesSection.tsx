import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Zap,
  Bot,
  Sparkles,
  Globe,
  Search,
  FileText,
  Bell,
  ShieldCheck
} from 'lucide-react'

// --- 8 Feature Cards Data with Exact Titles, Descriptions & Badges ---
const features = [
  {
    id: 'eligibility-checker',
    title: 'AI Eligibility Checker',
    desc: 'AI verifies your eligibility for Central, State, and District Government schemes in seconds.',
    badge: 'AI Powered',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 group-hover:bg-emerald-500 group-hover:text-white',
    glow: 'group-hover:shadow-emerald-500/20',
    iconBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
    icon: (
      <div className="relative flex items-center justify-center">
        <Zap className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
        <motion.span
          className="absolute inset-0 rounded-full border border-emerald-500/60"
          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    )
  },
  {
    id: 'ai-assistant',
    title: 'AI Scheme Assistant',
    desc: 'Chat with CivicSphere to understand any government scheme in simple language.',
    badge: 'RAG Assistant',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white',
    glow: 'group-hover:shadow-blue-500/20',
    iconBg: 'bg-blue-500/10 text-blue-600 border-blue-200/60',
    icon: (
      <div className="relative flex items-center justify-center">
        <Bot className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
        <div className="absolute -bottom-1 -right-1 flex gap-0.5">
          <motion.span className="w-1 h-1 bg-blue-600 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
          <motion.span className="w-1 h-1 bg-blue-600 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
        </div>
      </div>
    )
  },
  {
    id: 'personalized-recs',
    title: 'Personalized Recommendations',
    desc: 'Receive scheme recommendations based on your citizen profile and eligibility.',
    badge: 'Smart Matching',
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200/80 group-hover:bg-amber-500 group-hover:text-white',
    glow: 'group-hover:shadow-amber-500/20',
    iconBg: 'bg-amber-500/10 text-amber-600 border-amber-200/60',
    icon: (
      <div className="relative flex items-center justify-center">
        <Sparkles className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
        <motion.span
          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full"
          animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </div>
    )
  },
  {
    id: 'multilingual',
    title: 'Multilingual Support',
    desc: 'Access CivicSphere in English, Telugu, and Hindi with AI-powered translations.',
    badge: 'Multilingual',
    badgeStyle: 'bg-teal-50 text-teal-700 border-teal-200/80 group-hover:bg-teal-600 group-hover:text-white',
    glow: 'group-hover:shadow-teal-500/20',
    iconBg: 'bg-teal-500/10 text-teal-600 border-teal-200/60',
    icon: (
      <div className="relative flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
          <Globe className="w-4 h-4" />
        </motion.div>
      </div>
    )
  },
  {
    id: 'explore-schemes',
    title: 'Explore Government Schemes',
    desc: 'Browse schemes by sector, department, state, district, and category.',
    badge: 'One Platform',
    badgeStyle: 'bg-violet-50 text-violet-700 border-violet-200/80 group-hover:bg-violet-600 group-hover:text-white',
    glow: 'group-hover:shadow-violet-500/20',
    iconBg: 'bg-violet-500/10 text-violet-600 border-violet-200/60',
    icon: (
      <div className="relative flex items-center justify-center">
        <Search className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        <motion.span
          className="absolute inset-0 rounded-full border border-violet-500/50"
          animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
      </div>
    )
  },
  {
    id: 'document-center',
    title: 'Document Info Center',
    desc: 'Know exactly which documents are required before applying.',
    badge: 'Document Ready',
    badgeStyle: 'bg-cyan-50 text-cyan-700 border-cyan-200/80 group-hover:bg-cyan-600 group-hover:text-white',
    glow: 'group-hover:shadow-cyan-500/20',
    iconBg: 'bg-cyan-500/10 text-cyan-600 border-cyan-200/60',
    icon: (
      <div className="relative flex items-center justify-center">
        <FileText className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        <motion.span
          className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    )
  },
  {
    id: 'notification-center',
    title: 'Smart Notification Center',
    desc: 'Never miss scheme launches, deadlines, approvals, or updates.',
    badge: 'Real-Time',
    badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200/80 group-hover:bg-rose-600 group-hover:text-white',
    glow: 'group-hover:shadow-rose-500/20',
    iconBg: 'bg-rose-500/10 text-rose-600 border-rose-200/60',
    icon: (
      <div className="relative flex items-center justify-center">
        <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}>
          <Bell className="w-4 h-4" />
        </motion.div>
      </div>
    )
  },
  {
    id: 'secure-profile',
    title: 'Secure Citizen Profile',
    desc: 'Your citizen profile securely stores saved schemes and application progress.',
    badge: 'Secure',
    badgeStyle: 'bg-sky-50 text-sky-700 border-sky-200/80 group-hover:bg-sky-600 group-hover:text-white',
    glow: 'group-hover:shadow-sky-500/20',
    iconBg: 'bg-sky-500/10 text-sky-600 border-sky-200/60',
    icon: (
      <div className="relative flex items-center justify-center">
        <ShieldCheck className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        <motion.span
          className="absolute inset-0 rounded-full border border-sky-400/60"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    )
  }
]

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="features"
      ref={ref}
      className="relative pt-2 pb-4 md:pt-4 md:pb-6 bg-slate-50/80 overflow-hidden"
      aria-label="Platform features"
    >
      {/* BACKGROUND GRAPHICS & AI NEURAL NETWORK */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Glows */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />

        {/* AI Network Dot Grid */}
        <svg className="w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#475569" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        {/* Subtle Ashoka Chakra Outline Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.025]">
          <div className="w-[450px] h-[450px] rounded-full border-[6px] border-slate-900 animate-spin-slow" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* COMPACT SECTION HEADER */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border border-slate-200/80 shadow-2xs mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-slate-700 uppercase">
              Platform Features
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Intelligent Platform <span className="text-emerald-600">Capabilities</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            AI reasoning, multilingual access, document checklists, and secure citizen services built into one ecosystem.
          </p>
        </motion.div>

        {/* 4 CARDS FIRST ROW + 4 CARDS SECOND ROW GRID (Full Width, 170px Height) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.article
              key={f.id}
              id={`feature-${f.id}`}
              className={`group bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[24px] p-4.5 h-[170px] flex flex-col justify-between shadow-2xs hover:shadow-lg ${f.glow} transition-all duration-250 hover:-translate-y-1.5 cursor-default relative overflow-hidden`}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              {/* TOP ROW: Icon Left + Badge Right */}
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg ${f.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  {f.icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${f.badgeStyle}`}>
                  {f.badge}
                </span>
              </div>

              {/* MIDDLE: Feature Title */}
              <h3
                className="text-sm font-bold text-slate-900 mt-2 mb-0.5 group-hover:text-emerald-800 transition-colors"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {f.title}
              </h3>

              {/* BOTTOM: 2-Line Citizen Friendly Description */}
              <p
                className="text-[11px] text-slate-500 leading-snug line-clamp-2"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {f.desc}
              </p>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  )
}
