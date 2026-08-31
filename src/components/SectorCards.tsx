import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Sprout, GraduationCap, HeartPulse, Briefcase, Users,
  ArrowRight, Sparkles
} from 'lucide-react'

// Sector definitions with mandatory dynamic scheme count (0 Schemes Available)
const sectors = [
  {
    id: 'agriculture',
    title: 'Agriculture',
    count: 0, // Mandatory dynamic database logic: "0 Schemes Available"
    desc: 'Support for farmers through crop insurance, financial assistance, irrigation support, soil health, PM-KISAN, Rythu Bharosa, and agricultural development initiatives.',
    accentColor: '#059669', // Emerald Green
    glowColor: 'rgba(5, 150, 105, 0.22)',
    borderGradient: 'border-emerald-200/80 hover:border-emerald-400',
    btnHoverBg: 'group-hover:bg-emerald-600 group-hover:border-emerald-600',
    // Realistic AI Vector Illustration stage
    svgIllustration: (
      <svg className="w-24 h-24 text-emerald-600 filter drop-shadow-md" viewBox="0 0 100 100" fill="none">
        {/* Drone & Scan Rays */}
        <line x1="20" y1="18" x2="80" y2="18" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.7" />
        <circle cx="50" cy="18" r="3.5" fill="currentColor" />
        {/* Swaying Crops & Farmland */}
        <path d="M15 82C35 78 65 86 85 82" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 82V40" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <motion.path 
          d="M50 40C35 40 20 26 20 12C35 12 50 26 50 40Z" 
          fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.5" 
          animate={{ scale: [1, 1.06, 1], rotate: [0, 2, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path 
          d="M50 50C65 50 80 36 80 22C65 22 50 36 50 50Z" 
          fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2.5"
          animate={{ scale: [1, 1.06, 1], rotate: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      </svg>
    ),
    microIcon: <Sprout className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: 'education',
    title: 'Education',
    count: 0, // Mandatory dynamic database logic: "0 Schemes Available"
    desc: 'Scholarships, digital education support, student financial assistance, skill development, higher education, and learning opportunities from Central and State Governments.',
    accentColor: '#2563EB', // Royal Blue
    glowColor: 'rgba(37, 99, 235, 0.22)',
    borderGradient: 'border-blue-200/80 hover:border-blue-400',
    btnHoverBg: 'group-hover:bg-blue-600 group-hover:border-blue-600',
    svgIllustration: (
      <svg className="w-24 h-24 text-blue-600 filter drop-shadow-md" viewBox="0 0 100 100" fill="none">
        {/* Floating Cap & Tablet Book */}
        <motion.path 
          d="M50 16L85 34L50 52L15 34L50 16Z" 
          fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
          animate={{ y: [0, -4, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M25 40V62C25 62 37 72 50 72C63 72 75 62 75 62V40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="34" r="4" fill="currentColor" />
        <circle cx="25" cy="72" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="75" cy="72" r="3" fill="currentColor" opacity="0.7" />
      </svg>
    ),
    microIcon: <GraduationCap className="w-4 h-4 text-blue-600" />,
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    count: 0, // Mandatory dynamic database logic: "0 Schemes Available"
    desc: 'Health insurance, maternal care, Ayushman Bharat, preventive healthcare, medical assistance, and public health welfare programs.',
    accentColor: '#E11D48', // Crimson Red
    glowColor: 'rgba(225, 29, 72, 0.22)',
    borderGradient: 'border-rose-200/80 hover:border-rose-400',
    btnHoverBg: 'group-hover:bg-rose-600 group-hover:border-rose-600',
    svgIllustration: (
      <svg className="w-24 h-24 text-rose-600 filter drop-shadow-md" viewBox="0 0 100 100" fill="none">
        {/* Heart Shield & ECG Pulse Animation */}
        <path d="M50 82L20 52C10 42 10 25 25 18C37 12 47 22 50 26C53 22 63 12 75 18C90 25 90 42 80 52L50 82Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <motion.path 
          d="M28 46H40L44 34L52 56L56 46H72" 
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          animate={{ opacity: [0.4, 1, 0.4], strokeDashoffset: [0, 20] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    ),
    microIcon: <HeartPulse className="w-4 h-4 text-rose-600" />,
  },
  {
    id: 'employment',
    title: 'Employment',
    count: 0, // Mandatory dynamic database logic: "0 Schemes Available"
    desc: 'Employment guarantee, Skill India, startup support, apprenticeship programs, MSME opportunities, and youth employment initiatives.',
    accentColor: '#D97706', // Saffron Orange
    glowColor: 'rgba(217, 119, 6, 0.22)',
    borderGradient: 'border-amber-200/80 hover:border-amber-400',
    btnHoverBg: 'group-hover:bg-amber-600 group-hover:border-amber-600',
    svgIllustration: (
      <svg className="w-24 h-24 text-amber-600 filter drop-shadow-md" viewBox="0 0 100 100" fill="none">
        {/* Briefcase & Rising Career Bar Graph */}
        <rect x="18" y="32" width="64" height="48" rx="8" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" />
        <path d="M36 32V24C36 19.5 39.5 16 44 16H56C60.5 16 64 19.5 64 24V32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="64" x2="30" y2="52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="42" y1="64" x2="42" y2="44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="54" y1="64" x2="54" y2="38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="66" y1="64" x2="66" y2="48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    microIcon: <Briefcase className="w-4 h-4 text-amber-600" />,
  },
  {
    id: 'social-welfare',
    title: 'Social Welfare',
    count: 0, // Mandatory dynamic database logic: "0 Schemes Available"
    desc: 'Housing support, pensions, women empowerment, disability welfare, food security, and community welfare schemes for every citizen.',
    accentColor: '#7C3AED', // Purple
    glowColor: 'rgba(124, 58, 237, 0.22)',
    borderGradient: 'border-purple-200/80 hover:border-purple-400',
    btnHoverBg: 'group-hover:bg-purple-600 group-hover:border-purple-600',
    svgIllustration: (
      <svg className="w-24 h-24 text-purple-600 filter drop-shadow-md" viewBox="0 0 100 100" fill="none">
        {/* Connected Community Family Nodes */}
        <circle cx="50" cy="28" r="11" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.5" />
        <path d="M26 76C26 60 37 48 50 48C63 48 74 60 74 76" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="36" r="7" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
        <path d="M10 76C10 66 17 56 28 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="76" cy="36" r="7" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
        <path d="M90 76C90 66 83 56 72 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    microIcon: <Users className="w-4 h-4 text-purple-600" />,
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

export default function SectorCards() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section
      id="sectors"
      ref={sectionRef}
      className="relative pt-4 pb-4 md:pb-6 overflow-hidden bg-gradient-to-b from-slate-50/60 via-white to-slate-50/60"
      aria-label="Government Service Sectors"
    >
      {/* Requirement 1: Living Background (Multi-Layer Animated Canvas) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Layer 1: Dynamic Canvas Radial Glows */}
        <div className="absolute top-[5%] left-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-400/10 filter blur-3xl animate-pulse" />
        <div className="absolute top-[35%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-400/10 filter blur-3xl" />
        <div className="absolute bottom-[5%] left-[30%] w-[500px] h-[500px] rounded-full bg-purple-400/08 filter blur-3xl" />

        {/* Layer 2: AI Digital Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Layer 4: Civic Motion Vectors - India Map & Ashoka Chakra Ring */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035] stroke-slate-800" fill="none">
          <path d="M-100,260 Q400,120 900,360 T1800,220" strokeWidth="1.5" />
          <path d="M-100,560 Q500,360 1100,660 T1900,460" strokeWidth="1.5" />
        </svg>

        {/* Layer 5: Floating AI Particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-emerald-500/25"
            style={{
              width: `${(i % 3) + 3}px`,
              height: `${(i % 3) + 3}px`,
              left: `${8 + i * 11.5}%`,
              top: `${15 + (i % 4) * 22}%`,
              animation: `particle-float ${8 + i * 0.9}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 z-10">
        
        {/* Requirement 2: Premium Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          custom={0}
        >
          {/* Glass Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>🏛️ GOVERNMENT SERVICE SECTORS</span>
          </div>

          {/* Heading */}
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug mb-3">
            Explore{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Government Schemes
            </span>{' '}
            Across Every Sector
          </h2>

          {/* Subtitle */}
          <p className="font-heading text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            CivicSphere brings Central, State, and District Government welfare schemes together across India's most important public service sectors.
          </p>
        </motion.div>

        {/* Requirement 5: AI Connection Path across all 5 cards */}
        <div className="relative">
          <svg className="hidden xl:block absolute top-[120px] left-0 right-0 w-full h-10 pointer-events-none opacity-30 stroke-emerald-500 z-0" fill="none">
            <path d="M50,20 C300,-5 600,45 900,10 T1400,20" strokeWidth="2" strokeDasharray="5 5" />
          </svg>

          {/* Card Layout Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 relative z-10">
            {sectors.map((s, i) => (
              <motion.article
                key={s.id}
                id={`sector-${s.id}`}
                // Requirement 3: Taller, realistic 28px rounded glassmorphism cards
                className={`relative bg-white/95 backdrop-blur-xl rounded-[28px] border ${s.borderGradient} shadow-xs hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between overflow-hidden cursor-pointer min-h-[380px]`}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -10, rotate: 0.5, scale: 1.015 }}
                aria-label={`${s.title} Sector`}
              >
                {/* Requirement 3 & 6: Top Illustration Area (45% Height) */}
                <div 
                  className="relative h-40 flex items-center justify-center p-3 bg-gradient-to-b overflow-hidden"
                  style={{ background: `linear-gradient(to bottom, rgba(248, 250, 252, 0.85), rgba(255, 255, 255, 1))` }}
                >
                  {/* Sector Ambient Glow */}
                  <div
                    className="absolute w-28 h-28 rounded-full filter blur-xl opacity-50 group-hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: s.glowColor }}
                  />

                  {/* 3D Vector Illustration with motion */}
                  <motion.div
                    className="relative z-10 group-hover:scale-110 transition-transform duration-300"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {s.svgIllustration}
                  </motion.div>
                </div>

                {/* Requirement 3 & 8: Middle Content Area (Name, 0 Schemes Counter, Realistic Description) */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                        {s.microIcon}
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-bold text-slate-900 leading-tight">
                          {s.title}
                        </h3>
                        {/* Requirement 11: Dynamic Scheme Count Logic (0 Schemes Available) */}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{s.count > 0 ? `${s.count} Schemes Available` : '0 Schemes Available'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Requirement 8: Realistic Citizen-Friendly Description */}
                    <p className="text-[11px] text-slate-600 leading-relaxed font-normal mb-4 mt-2">
                      {s.desc}
                    </p>
                  </div>

                  {/* Requirement 9: Premium Explore Sector Button */}
                  <button
                    id={`explore-${s.id}-btn`}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-[11px] font-bold border border-slate-200/80 bg-slate-50/80 text-slate-700 ${s.btnHoverBg} group-hover:text-white transition-all duration-300 shadow-2xs`}
                    aria-label={`Explore ${s.title} schemes`}
                  >
                    <span>Explore Sector</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
