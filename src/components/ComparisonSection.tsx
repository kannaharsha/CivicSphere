import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  X,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  FileQuestion,
  Clock,
  Globe,
  Zap,
  ShieldCheck,
  BellRing,
  Cpu,
  Search,
  Check
} from 'lucide-react'

const oldWayPoints = [
  {
    title: 'Multiple Disconnected Portals',
    desc: 'Dozens of separate central & state websites',
    icon: Search
  },
  {
    title: 'Complex Legal Jargon',
    desc: 'Outdated PDF guidelines & confusing eligibility rules',
    icon: FileQuestion
  },
  {
    title: 'Manual Eligibility Search',
    desc: 'Hours spent figuring out if you qualify',
    icon: AlertTriangle
  },
  {
    title: 'Language & Script Barriers',
    desc: 'English-only technical terminology',
    icon: Globe
  },
  {
    title: 'Missed Application Deadlines',
    desc: 'Zero automated notifications or updates',
    icon: Clock
  }
]

const smartWayPoints = [
  {
    title: 'One Unified AI Platform',
    desc: 'All Central & State schemes in one single portal',
    icon: ShieldCheck
  },
  {
    title: 'Simple Local Language AI',
    desc: 'Plain explanations in Telugu, Hindi & English',
    icon: Globe
  },
  {
    title: 'Instant AI Eligibility Scan',
    desc: 'RAG intelligence checks rules in milliseconds',
    icon: Cpu
  },
  {
    title: 'Smart Profile Matching',
    desc: 'Personalized schemes matched for your family',
    icon: Zap
  },
  {
    title: 'Proactive Deadline Alerts',
    desc: 'Automated notifications before scheme cutoffs',
    icon: BellRing
  }
]

const statsData = [
  { value: '95%', label: 'Faster Discovery', subtext: 'Reduces search time from hours to seconds' },
  { value: '100%', label: 'Multilingual Support', subtext: 'Native Telugu, Hindi & English guidance' },
  { value: 'Instant', label: 'AI Eligibility Checker', subtext: 'Automated rules-based verification engine' },
  { value: '1 Platform', label: 'Unified Governance', subtext: 'Central & State schemes on one single site' }
]

export default function ComparisonSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      id="comparison"
      ref={ref}
      className="relative pt-1 pb-8 md:pt-2 md:pb-10 bg-slate-50/80 overflow-hidden flex flex-col justify-center"
      aria-label="Why use CivicSphere"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/3 -left-1/12 w-[380px] h-[380px] bg-red-200/20 rounded-full blur-[110px]"
          animate={{ x: [0, 25, 0], y: [0, -15, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute bottom-1/4 -right-1/12 w-[400px] h-[400px] bg-emerald-200/25 rounded-full blur-[110px]"
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

        <motion.div
          className="text-center max-w-2xl mx-auto mb-5 md:mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-extrabold tracking-wider text-slate-800 uppercase">
              ✨ WHY MILLIONS CHOOSE CIVICSPHERE
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            The <span className="text-red-500 font-extrabold">Old Way</span> vs The <span className="gradient-text font-extrabold">Smart Way</span>
          </h2>

          <p
            className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Millions of citizens miss Government welfare benefits because of confusing rules, multiple portals, and language barriers. CivicSphere transforms that experience into one intelligent AI-powered platform.
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch max-w-5xl mx-auto">

          <motion.div
            className="lg:col-span-6 rounded-2xl border border-red-200/80 bg-white p-4 sm:p-5 shadow-sm flex flex-col justify-between"
            initial={{ opacity: 0, x: -25 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div>
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-500 shrink-0">
                    <X className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold text-red-600"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      The Old Way
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Without CivicSphere</p>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  ❌ Traditional
                </span>
              </div>

              <div className="space-y-2">
                {oldWayPoints.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="p-2.5 rounded-xl bg-red-50/40 border border-red-100 flex items-start gap-2.5 hover:bg-red-50/80 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <div className="w-4 h-4 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0 mt-0.5 text-red-500">
                      <X className="w-2.5 h-2.5" strokeWidth={3} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">{item.title}</h4>
                      <p className="text-[10.5px] text-slate-500 font-medium leading-snug mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-red-100 flex items-center justify-between text-xs text-red-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <span>😓</span> Stressed & Confused
              </span>
              <span className="text-[10px] font-bold text-slate-400">Low Eligibility Conversion</span>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-6 rounded-2xl border-2 border-emerald-400 bg-white p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
            initial={{ opacity: 0, x: 25 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9.5px] font-bold px-3 py-0.5 rounded-bl-lg shadow-2xs">
              ⭐ Recommended
            </div>

            <div>
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold text-emerald-600"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      The Smart Way
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">With CivicSphere AI</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {smartWayPoints.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-start gap-2.5 hover:bg-emerald-50 transition-colors"
                    initial={{ opacity: 0, x: 10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: idx * 0.05 + 0.1 }}
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-emerald-600">
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h4>
                      <p className="text-[10.5px] text-slate-600 font-medium leading-snug mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <span>😊</span> Empowered & Informed
              </span>
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded">
                ✓ Guaranteed Scheme Discovery
              </span>
            </div>
          </motion.div>

        </div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-5xl mx-auto mt-5"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {statsData.map((stat, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-all duration-300 group"
            >
              <p
                className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {stat.value}
              </p>
              <p className="text-[11px] font-bold text-slate-900 leading-tight mt-0.5">{stat.label}</p>
              <p className="text-[9.5px] text-slate-500 font-medium mt-0.5 truncate">{stat.subtext}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
