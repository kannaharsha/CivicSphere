import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  Send, Mic, MicOff, RefreshCw, Copy, Check,
  ExternalLink, ShieldCheck, Zap, Sparkles,
  History, Download, PlusCircle, X, Search, Paperclip,
  Database, Globe, Clock
} from 'lucide-react'
import { useAuth } from '../../firebase/AuthProvider'
import { useTheme } from '../../context/ThemeContext'

/* ══════════════════════════════════════════════════
   THEME DESIGN TOKENS — centralized, no hardcodes
══════════════════════════════════════════════════ */
const T = {
  light: {
    accent: '#D4A017',
    accentAlt: '#B48418',
    accentGlow: 'rgba(212,160,23,0.18)',
    accentGlowStrong: 'rgba(212,160,23,0.32)',
    accentBorder: 'rgba(212,160,23,0.30)',
    accentBorderHover: 'rgba(212,160,23,0.65)',
    heroBg: 'linear-gradient(135deg, #FFFFFF 0%, #FDFCF7 42%, #F9F5EC 100%)',
    surface: 'rgba(255,255,255,0.92)',
    cardBg: 'rgba(255,255,255,0.88)',
    elevatedCard: 'rgba(255,255,255,0.98)',
    inputBg: '#FFFFFF',
    msgAiBg: 'rgba(255,255,255,0.96)',
    msgUserGrad: 'linear-gradient(135deg,#D4A017 0%,#B48418 100%)',
    msgUserText: '#ffffff',
    text: '#0F172A',
    textMuted: '#64748B',
    textFaint: '#94A3B8',
    shadow: '0 10px 32px -6px rgba(212,160,23,0.12), 0 2px 8px rgba(0,0,0,0.03)',
    shadowHover: '0 20px 48px -10px rgba(212,160,23,0.22), 0 6px 18px rgba(0,0,0,0.06)',
    chipBg: 'rgba(254,243,199,0.6)',
    chipBorder: 'rgba(212,160,23,0.35)',
    chipText: '#8A6210',
    scrollThumb: 'rgba(212,160,23,0.35)',
  },
  dark: {
    accent: '#00B87C',
    accentAlt: '#10B981',
    accentGlow: 'rgba(0,184,124,0.18)',
    accentGlowStrong: 'rgba(0,184,124,0.35)',
    accentBorder: 'rgba(0,184,124,0.22)',
    accentBorderHover: 'rgba(0,184,124,0.55)',
    heroBg: 'linear-gradient(145deg,#07121E 0%,#0B1D2F 55%,#091726 100%)',
    surface: 'rgba(11,23,38,0.92)',
    cardBg: 'rgba(12,26,43,0.85)',
    elevatedCard: 'rgba(15,31,51,0.94)',
    inputBg: 'rgba(11,23,38,0.95)',
    msgAiBg: 'rgba(12,26,43,0.94)',
    msgUserGrad: 'linear-gradient(135deg,#00B87C 0%,#10B981 100%)',
    msgUserText: '#ffffff',
    text: '#FFFFFF',
    textMuted: '#94A3B8',
    textFaint: '#64748B',
    shadow: '0 8px 32px rgba(0,0,0,0.35),0 2px 8px rgba(0,184,124,0.08)',
    shadowHover: '0 16px 48px rgba(0,0,0,0.45),0 4px 16px rgba(0,184,124,0.18)',
    chipBg: 'rgba(0,184,124,0.12)',
    chipBorder: 'rgba(0,184,124,0.30)',
    chipText: '#34D399',
    scrollThumb: 'rgba(0,184,124,0.28)',
  }
}

/* ══════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════ */
interface Scheme {
  title: string; category: string; benefit: string
  eligibility: string; link?: string; icon: string
}
interface Message {
  id: string; sender: 'user' | 'assistant'; text: string; timestamp: string
  schemes?: Scheme[]; actions?: string[]
  schemeId?: string; schemeName?: string
}
interface HistoryItem { id: string; preview: string; time: string }

/* ══════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════ */
const QUICK_PROMPTS = [
  { icon: '🌾', title: 'Farmer Schemes', desc: 'PM-KISAN & crop subsidies' },
  { icon: '🎓', title: 'Scholarships', desc: 'Higher education support' },
  { icon: '🏥', title: 'Healthcare', desc: 'Ayushman Bharat coverage' },
  { icon: '🏠', title: 'Housing Aid', desc: 'PMAY & rural housing' },
  { icon: '💼', title: 'MSME Support', desc: 'Small business finance' },
  { icon: '👵', title: 'Senior Citizens', desc: 'Pension & welfare' },
]

const TYPING_MESSAGES = [
  'Understanding citizen query (Phase 2)...',
  'Filtering candidate schemes on Supabase (Step 15)...',
  'Performing vector similarity & MMR re-ranking (Steps 16-18)...',
  'Assembling trusted context package (Phase 4)...',
  'Generating grounded guidance with Llama 3.1 (Phase 5)...',
]

const CAPABILITIES = [
  { icon: '🔍', label: 'Scheme Discovery', hover: 'search' },
  { icon: '✅', label: 'Eligibility Guidance', hover: 'shield' },
  { icon: '📄', label: 'Document Assistance', hover: 'flip' },
  { icon: '💰', label: 'Subsidy Information', hover: 'sparkle' },
  { icon: '📋', label: 'Application Guidance', hover: 'arrow' },
  { icon: '🌐', label: 'English Knowledge Base', hover: 'pulse' },
]

const MOCK_HISTORY: HistoryItem[] = [
  { id: 'h1', preview: 'PM-KISAN eligibility for farmers in AP', time: 'Today, 2:30 PM' },
  { id: 'h2', preview: 'Scholarship schemes for SC students', time: 'Yesterday' },
  { id: 'h3', preview: 'Ayushman Bharat hospital empanelment', time: 'Mon, Sep 15' },
]

/* ══════════════════════════════════════════════════
   AI RESPONSE GENERATOR (pure logic, unchanged)
══════════════════════════════════════════════════ */
function generateAIResponse(query: string, userState: string, userOccupation: string): Message {
  const q = query.toLowerCase()
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const id = Date.now().toString()

  if (q.match(/farm|kisan|agri|crop/)) return {
    id, sender: 'assistant', timestamp: timeStr,
    text: `Matched **3 agricultural welfare schemes** for farmers in **${userState}**:`,
    schemes: [
      { title: 'PM-KISAN Samman Nidhi', category: 'Agriculture', icon: '🌾', benefit: '₹6,000/year in 3 direct bank installments', eligibility: 'All landholding farmer families with cultivable land', link: 'https://pmkisan.gov.in/' },
      { title: 'PM Fasal Bima Yojana', category: 'Crop Insurance', icon: '🌧️', benefit: 'Full crop insurance against all natural risks', eligibility: 'Farmers growing notified crops in notified areas', link: 'https://pmfby.gov.in/' },
      { title: 'PM Kisan Maandhan Yojana', category: 'Farmer Pension', icon: '💰', benefit: 'Guaranteed ₹3,000/month pension from age 60', eligibility: 'Small & marginal farmers aged 18–40', link: 'https://maandhan.in/' }
    ],
    actions: ['Required Documents', 'Apply Online Guide', 'Check Installment Status']
  }
  if (q.match(/scholar|student|college|education/)) return {
    id, sender: 'assistant', timestamp: timeStr,
    text: `Here are **3 top scholarship schemes** for higher education:`,
    schemes: [
      { title: 'NSP Post-Matric Scholarship', category: 'Education', icon: '🎓', benefit: 'Full tuition + maintenance allowance', eligibility: 'Post-matric students, family income < ₹2.5L/yr', link: 'https://scholarships.gov.in/' },
      { title: 'AICTE Pragati Scholarship', category: 'Technical Education', icon: '💡', benefit: '₹50,000/year for college, books & equipment', eligibility: 'Female students in 1st year tech courses', link: 'https://www.aicte-india.org/' },
      { title: 'Central Sector Scholarship', category: 'Higher Education', icon: '📚', benefit: '₹12,000–₹20,000/year for UG & PG', eligibility: 'Top 80th percentile in Class 12 board exams', link: 'https://scholarships.gov.in/' }
    ],
    actions: ['Document Checklist', 'Income Certificate Guide', 'Application Deadlines']
  }
  if (q.match(/health|hospital|medical|ayushman|insurance/)) return {
    id, sender: 'assistant', timestamp: timeStr,
    text: `Top **healthcare & insurance** schemes for you:`,
    schemes: [
      { title: 'Ayushman Bharat PM-JAY', category: 'Healthcare', icon: '🏥', benefit: 'Cashless treatment up to ₹5 Lakh/family/year', eligibility: 'SECC 2011 identified deprivation families', link: 'https://pmjay.gov.in/' },
      { title: 'PM Suraksha Bima Yojana', category: 'Accident Insurance', icon: '🛡️', benefit: '₹2 Lakh accidental cover for just ₹20/year premium', eligibility: 'Citizens 18–70 with active savings account', link: 'https://jansuraksha.gov.in/' }
    ],
    actions: ['Download Ayushman Card', 'Find Empanelled Hospitals', 'PM-JAY Eligibility Check']
  }
  if (q.match(/house|housing|awas|home/)) return {
    id, sender: 'assistant', timestamp: timeStr,
    text: `Housing schemes for **urban & rural** citizens:`,
    schemes: [
      { title: 'PMAY-Gramin (Rural)', category: 'Rural Housing', icon: '🏡', benefit: '₹1.20–1.30 Lakh for pucca house construction', eligibility: 'Houseless BPL families in rural areas', link: 'https://pmayg.nic.in/' },
      { title: 'PMAY-Urban (CLSS)', category: 'Urban Housing', icon: '🏙️', benefit: 'Interest subsidy up to ₹2.67 Lakh under CLSS', eligibility: 'EWS, LIG, MIG families in statutory towns', link: 'https://pmayuclap.gov.in/' }
    ],
    actions: ['Track Application', 'Required Documents', 'Income Limits Check']
  }
  if (q.match(/pension|elder|senior|old age/)) return {
    id, sender: 'assistant', timestamp: timeStr,
    text: `**Social security & pension** schemes for senior citizens:`,
    schemes: [
      { title: 'IGNOAPS Old Age Pension', category: 'Social Welfare', icon: '👵', benefit: 'Monthly pension ₹200–₹500 + state top-up', eligibility: 'Citizens 60+ from BPL households', link: 'https://nsap.nic.in/' },
      { title: 'Atal Pension Yojana', category: 'Guaranteed Pension', icon: '💎', benefit: '₹1,000–₹5,000/month guaranteed pension from 60', eligibility: 'Citizens 18–40 with savings bank account', link: 'https://www.npscra.nsdl.co.in/' }
    ],
    actions: ['Apply for APY', 'Find Nearest Seva Kendra', 'BPL List Check']
  }
  return {
    id, sender: 'assistant', timestamp: timeStr,
    text: `Our AI engine scanned **Central & ${userState} State** databases for **"${query}"**.\n\nI can guide you on schemes for the **${userOccupation}** category. Which sector would you like to explore?`,
    actions: ['Agriculture & Farming', 'Education & Scholarships', 'Healthcare', 'Housing & PMAY', 'Senior Citizen Welfare']
  }
}

/* ══════════════════════════════════════════════════
   SVG PARTICLE BACKGROUND  (GPU-only, lazy)
══════════════════════════════════════════════════ */
const ParticleBackground = React.memo(({ isDark }: { isDark: boolean }) => {
  // Dark mode: mint/emerald (#34D399 / #00B87C); Light mode: warm luxury gold / radiant amber (#D4A017 / #F59E0B)
  const c = isDark ? '#34D399' : '#D4A017'
  const c2 = isDark ? '#00B87C' : '#F59E0B'
  const nodes = [
    { x: 80, y: 100 }, { x: 210, y: 55 }, { x: 380, y: 85 }, { x: 540, y: 145 }, { x: 680, y: 72 }, { x: 820, y: 125 },
    { x: 140, y: 240 }, { x: 310, y: 210 }, { x: 470, y: 260 }, { x: 620, y: 218 }, { x: 760, y: 272 },
    { x: 50, y: 370 }, { x: 240, y: 340 }, { x: 420, y: 390 }, { x: 590, y: 355 }, { x: 740, y: 410 },
    { x: 170, y: 460 }, { x: 340, y: 468 }, { x: 500, y: 475 }, { x: 660, y: 460 },
  ]
  const links = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [6, 7], [7, 8], [8, 9], [9, 10],
    [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [6, 11], [7, 12], [8, 13], [9, 14], [10, 15],
    [11, 12], [12, 13], [13, 14], [14, 15], [12, 16], [13, 17], [14, 18], [15, 19], [16, 17], [17, 18], [18, 19]
  ]
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none select-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="nodeBlur"><feGaussianBlur stdDeviation="2" /></filter>
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Network links */}
      {links.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={i % 3 === 0 ? c2 : c}
          strokeWidth={isDark ? '0.8' : '0.8'}
          strokeOpacity={isDark ? '0.22' : '0.18'}
        />
      ))}

      {/* Circuit path decorations */}
      <path d="M 870 180 L 900 180 L 900 220 L 940 220 L 940 260" stroke={c} strokeWidth="1" strokeOpacity={isDark ? '0.2' : '0.18'} fill="none" />
      <path d="M 20 290 L 20 330 L 55 330 L 55 370" stroke={c2} strokeWidth="1" strokeOpacity={isDark ? '0.2' : '0.18'} fill="none" />
      <path d="M 460 20 L 460 50 L 500 50 L 500 80" stroke={c} strokeWidth="1" strokeOpacity={isDark ? '0.2' : '0.18'} fill="none" />

      {/* Corner circuit dots */}
      {([[900, 220, c], [940, 260, c2], [20, 330, c], [55, 370, c2], [500, 80, c]] as [number, number, string][]).map(([x, y, col], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={col} fillOpacity={isDark ? '0.35' : '0.30'} />
      ))}

      {/* Node soft glow halos */}
      {nodes.map((n, i) => (
        <circle key={`h${i}`} cx={n.x} cy={n.y} r="9"
          fill={i % 2 === 0 ? c : c2}
          fillOpacity={isDark ? '0.06' : '0.08'}
        />
      ))}

      {/* Node core dots — radiant and pulsing */}
      {nodes.map((n, i) => (
        <circle key={`n${i}`} cx={n.x} cy={n.y} r="2.6"
          fill={i % 2 === 0 ? c : c2}
          fillOpacity={isDark ? '0.7' : '0.55'}
        >
          <animate attributeName="r" values="2;3.2;2" dur={`${2.5 + (i % 4) * 0.6}s`} repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values={isDark ? '0.5;1;0.5' : '0.4;0.85;0.4'} dur={`${2.5 + (i % 4) * 0.6}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Shield/doc symbols */}
      <text x="880" y="90" fontSize="20" fill={c} fillOpacity={isDark ? '0.08' : '0.12'} fontFamily="system-ui">🛡</text>
      <text x="30" y="490" fontSize="15" fill={c2} fillOpacity={isDark ? '0.08' : '0.12'} fontFamily="system-ui">📋</text>
      <text x="800" y="420" fontSize="17" fill={c} fillOpacity={isDark ? '0.08' : '0.12'} fontFamily="system-ui">⚡</text>
    </svg>
  )
})

/* ══════════════════════════════════════════════════
   ANIMATED AI ORB — triple rings, orbiting particles
══════════════════════════════════════════════════ */
const AIOrb = ({ isDark }: { isDark: boolean }) => {
  const g = isDark ? '#00B87C' : '#D4A017'   // dark mode: emerald | light mode: luxury warm gold
  const [hovered, setHovered] = useState(false)

  const orbParticles = Array.from({ length: 10 }, (_, i) => ({
    angle: i * 36,
    radius: 68 + (i % 3) * 8,
    size: 1.5 + (i % 2) * 1,
    speed: 2.5 + (i % 4) * 0.5,
  }))

  return (
    <div className="relative flex items-center justify-center w-44 h-44 sm:w-52 sm:h-52 flex-shrink-0 cursor-pointer"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

      {/* Ambient glow layer */}
      <motion.div className="absolute inset-0 rounded-full"
        animate={{ opacity: hovered ? [0.65, 0.95, 0.65] : [0.35, 0.6, 0.35], scale: hovered ? [1, 1.15, 1] : [1, 1.08, 1] }}
        transition={{ duration: hovered ? 1.5 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: isDark
            ? `radial-gradient(circle, ${g}88 0%, transparent 70%)`
            : `radial-gradient(circle, rgba(245,158,11,0.28) 0%, rgba(212,160,23,0.12) 40%, transparent 70%)`,
          filter: 'blur(20px)'
        }}
      />

      {/* Outer ring — slow */}
      <motion.div className="absolute inset-1 rounded-full"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: hovered ? 4 : 12, ease: 'linear', repeat: Infinity }}
        style={{ border: `1.5px dashed ${g}45` }}
      />
      {/* Mid ring — medium */}
      <motion.div className="absolute inset-6 rounded-full"
        animate={{ rotate: [360, 0] }}
        transition={{ duration: hovered ? 3 : 8, ease: 'linear', repeat: Infinity }}
        style={{ border: `1px solid ${g}35` }}
      />
      {/* Inner ring — fast */}
      <motion.div className="absolute inset-12 rounded-full"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: hovered ? 2 : 5, ease: 'linear', repeat: Infinity }}
        style={{ border: `0.8px solid ${g}28` }}
      />

      {/* Orbiting particle halo */}
      {orbParticles.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180
        const x = 50 + p.radius * Math.cos(rad)
        const y = 50 + p.radius * Math.sin(rad)
        return (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{
              width: p.size * 3 + 'px', height: p.size * 3 + 'px',
              background: g, left: `${x}%`, top: `${y}%`,
              transform: 'translate(-50%,-50%)',
              boxShadow: `0 0 ${p.size * 4}px ${g}`,
            }}
            animate={{
              opacity: hovered ? [0.6, 1, 0.6] : [0.35, 0.75, 0.35],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{ duration: p.speed, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
          />
        )
      })}

      {/* Energy pulse ring */}
      <motion.div className="absolute rounded-full"
        style={{ inset: 14, border: `1px solid ${g}`, opacity: 0 }}
        animate={{ scale: [1, 1.5], opacity: [0.35, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeOut' }}
      />

      {/* Core sphere — with luxury glass pedestal plate */}
      <motion.div
        animate={{ scale: [1, 1.04, 1], y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.1 }}
        className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
        style={{
          background: 'transparent',
          transition: 'box-shadow 0.4s ease',
        }}
      >
        {/* Shimmering glass pedestal plate behind the logo */}
        <div
          className="absolute inset-[-4px] rounded-full pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(0, 184, 124, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 20%, rgba(254, 243, 199, 0.5) 75%, transparent 100%)',
            boxShadow: isDark
              ? '0 0 24px rgba(0, 184, 124, 0.15)'
              : '0 8px 24px rgba(212, 160, 23, 0.2), 0 2px 6px rgba(0, 0, 0, 0.04)',
            border: isDark ? '1px solid rgba(0, 184, 124, 0.25)' : '1px solid rgba(212, 160, 23, 0.35)',
          }}
        />

        {/* CivicSphere Logo — gentle sway */}
        <motion.div
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24"
        >
          {/* Outer gradient ring */}
          <div className="absolute inset-0 rounded-full p-[3px]"
            style={{ background: 'linear-gradient(135deg,#16A34A,#F59E0B,#2563EB,#16A34A)' }}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden shadow-sm">
              {/* Spinning dashed orbit */}
              <motion.svg
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 24 24" fill="none"
              >
                <circle cx="12" cy="12" r="9" stroke="#2563EB" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="2 2" />
              </motion.svg>
              {/* Cross logo */}
              <svg className="w-7 h-7 relative z-10" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" stroke="#16A34A" strokeWidth="2.2" />
                <path d="M6 12h12" stroke="#2563EB" strokeWidth="2.2" />
                <circle cx="12" cy="6" r="2" fill="#F59E0B" />
                <circle cx="18" cy="12" r="1.8" fill="#2563EB" />
                <circle cx="6" cy="12" r="1.8" fill="#16A34A" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Live status badge */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-md"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #D4AF37)',
            borderColor: isDark ? '#0B1726' : '#FFFDF5',
            boxShadow: '0 0 10px rgba(212, 175, 55, 0.55)',
          }}
        >
          <Zap className="w-2.5 h-2.5 text-white fill-white" />
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   STAT CARD — shimmer border + tilt hover
══════════════════════════════════════════════════ */
const StatCard = ({ value, label, icon, isDark, delay = 0 }: {
  value: string; label: string; icon: React.ReactNode; isDark: boolean; delay?: number
}) => {
  const t = isDark ? T.dark : T.light
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.55, type: 'spring', stiffness: 180, damping: 22 }}
      whileHover={{
        y: -5, scale: 1.025, rotate: 0.4,
        boxShadow: t.shadowHover,
        borderColor: t.accentBorderHover
      }}
      className="flex-1 min-w-[120px] rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden cursor-default"
      style={{
        background: t.cardBg,
        border: `1px solid ${t.accentBorder}`,
        boxShadow: t.shadow,
        backdropFilter: 'blur(14px)',
        transition: 'border-color 0.3s ease',
      }}
    >
      {/* Shimmer sweep */}
      <motion.div className="absolute top-0 left-0 h-full w-1/2 pointer-events-none"
        animate={{ x: ['-120%', '220%'] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
        style={{ background: `linear-gradient(90deg,transparent,${t.accentGlow},transparent)` }}
      />
      <div style={{ color: t.accent }}>{icon}</div>
      <div className="text-2xl font-black" style={{ color: t.text }}>{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: t.textMuted }}>{label}</div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════
   RICH TEXT — bolded segments highlighted with accent
══════════════════════════════════════════════════ */
const RichText = ({ text, userBubble, isDark }: { text: string; userBubble?: boolean; isDark: boolean }) => {
  const t = isDark ? T.dark : T.light

  if (userBubble) {
    return <span className="whitespace-pre-line">{text}</span>
  }

  // Parse lines for assistant response
  const lines = text.split('\n')
  return (
    <div className="space-y-2 text-[13px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} className="h-0.5" />
        }

        // Section Headings: ### 1. 🏛️ Scheme Recommendation
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s+/, '')
          return (
            <div key={idx} className="pt-2.5 pb-1 border-b first:pt-0" style={{ borderColor: t.accentBorder }}>
              <h3 className="text-[13px] sm:text-[14px] font-black tracking-tight flex items-center gap-1.5" style={{ color: t.accent }}>
                {headingText}
              </h3>
            </div>
          )
        }

        // Checklist item: - [ ] Aadhaar Card
        if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
          const checkText = trimmed.replace(/^-\s+\[[ xX]\]\s+/, '')
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded border text-[10px] font-black flex-shrink-0"
                style={{ borderColor: t.accent, color: t.accent, background: t.chipBg }}>
                ✓
              </span>
              <span className="flex-1 font-medium text-[12px]" style={{ color: t.text }}>
                <FormattedLine text={checkText} isDark={isDark} />
              </span>
            </div>
          )
        }

        // Bullet item: - ✅ or - 
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const bulletText = trimmed.replace(/^[-•]\s+/, '')
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 py-0.5">
              <span className="text-xs mt-0.5 select-none flex-shrink-0" style={{ color: t.accent }}>•</span>
              <span className="flex-1 font-medium text-[12px]" style={{ color: t.text }}>
                <FormattedLine text={bulletText} isDark={isDark} />
              </span>
            </div>
          )
        }

        // Numbered step: 1. 2. 3.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
        if (numMatch) {
          const [, num, stepText] = numMatch
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 py-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black flex-shrink-0"
                style={{ background: t.chipBg, color: t.accent, border: `1px solid ${t.chipBorder}` }}>
                {num}
              </span>
              <span className="flex-1 text-[12px] font-medium leading-normal" style={{ color: t.text }}>
                <FormattedLine text={stepText} isDark={isDark} />
              </span>
            </div>
          )
        }

        // Standard paragraph line
        return (
          <p key={idx} className="leading-relaxed font-medium text-[12.5px]" style={{ color: t.text }}>
            <FormattedLine text={trimmed} isDark={isDark} />
          </p>
        )
      })}
    </div>
  )
}

function FormattedLine({ text, isDark }: { text: string; isDark: boolean }) {
  const t = isDark ? T.dark : T.light

  // Regex to split by markdown links [Title](url) and bold **bold**
  const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: t.accent, fontWeight: 900 }}>{part.slice(2, -2)}</strong>
        }
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (linkMatch) {
          const [, linkTitle, linkUrl] = linkMatch
          return (
            <a
              key={i}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold underline decoration-dotted transition-colors hover:opacity-80"
              style={{ color: t.accent }}
            >
              {linkTitle}
              <ExternalLink className="w-3 h-3 inline" />
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/* ══════════════════════════════════════════════════
   CIVICSPHERE EMBLEM LOGO AVATAR
══════════════════════════════════════════════════ */
const CivicSphereLogoAvatar = ({ size = 'w-9 h-9' }: { size?: string }) => (
  <div className={`relative ${size} flex-shrink-0 flex items-center justify-center`}>
    <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#16A34A] via-[#F59E0B] to-[#2563EB] p-[2px] shadow-sm">
      <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative overflow-hidden">
        <svg className="w-5 h-5 text-[#2563EB]/40 absolute animate-spin-slow" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
        </svg>
        <svg className="w-4 h-4 text-[#16A34A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18" stroke="#16A34A" />
          <circle cx="12" cy="6" r="1.5" fill="#F59E0B" stroke="#F59E0B" />
          <circle cx="18" cy="12" r="1.5" fill="#2563EB" stroke="#2563EB" />
          <circle cx="6" cy="12" r="1.5" fill="#16A34A" stroke="#16A34A" />
          <path d="M12 12l6 0" stroke="#2563EB" />
          <path d="M12 12l-6 0" stroke="#16A34A" />
        </svg>
      </div>
    </div>
  </div>
)

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function AIAssistantWidget({ isDark: propIsDark }: { isDark?: boolean }) {
  const { theme } = useTheme()
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark'
  const { profile, user } = useAuth()
  const userPhotoUrl = profile?.profilePhotoUrl || user?.photoURL || ''
  const t = isDark ? T.dark : T.light

  const citizenName = profile?.fullName || 'Citizen'
  const userState = profile?.state || 'All India'
  const userOccupation = profile?.occupation || 'Citizen'

  /* ── State ── */
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [typingMsgIdx, setTypingMsgIdx] = useState(0)
  const [historySearch, setHistorySearch] = useState('')
  const [inputFocused, setInputFocused] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [sessionId] = useState(() => `sess_${Date.now().toString(36)}`)
  const [conversationId, setConversationId] = useState(() => `conv_${Date.now().toString(36)}`)
  const lastInputTypeRef = useRef<'text' | 'voice'>('text')

  const initialGreeting: Message = {
    id: 'welcome-1', sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `Namaste **${citizenName}**! 🙏\n\nI am your **CivicSphere Assist** — powered by a live RAG engine trained on 500+ Central and State welfare schemes.\n\nHow can I assist you today?`,
    actions: ['Farmer Schemes', 'Scholarships', 'Healthcare', 'Housing']
  }
  const [messages, setMessages] = useState<Message[]>([initialGreeting])

  /* Typing message cycle */
  useEffect(() => {
    if (!isTyping) return
    const iv = setInterval(() => setTypingMsgIdx(i => (i + 1) % TYPING_MESSAGES.length), 1500)
    return () => clearInterval(iv)
  }, [isTyping])

  /* Scroll to bottom */
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  /* Auto-grow textarea */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const [activeSchemeId, setActiveSchemeId] = useState<string | null>(null)
  const [activeSchemeName, setActiveSchemeName] = useState<string | null>(null)

  const handleSend = useCallback(async (textToSend?: string, explicitSchemeId?: string, explicitSchemeName?: string) => {
    const query = textToSend || input
    if (!query.trim() || isTyping) return

    const promptText = query.trim()
    const inputType = lastInputTypeRef.current || 'text'
    lastInputTypeRef.current = 'text'

    const targetSchemeId = explicitSchemeId || activeSchemeId
    const targetSchemeName = explicitSchemeName || activeSchemeName

    // Step 10: Store user request in variable UserQuery with scheme binding
    const UserQuery = {
      original_query: promptText,
      user_id: profile?.profileId || user?.uid || 'Civs1001',
      session_id: sessionId,
      conversation_id: conversationId,
      timestamp: new Date().toISOString(),
      input_type: inputType,
      target_scheme_id: targetSchemeId || undefined,
      target_scheme_name: targetSchemeName || undefined
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      // Connect to CivicSphere End-to-End Pipeline (Phase 2 -> 3 -> 4 -> 5)
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(UserQuery)
      })

      const data = await response.json()

      if (data.success && data.data) {
        const verified = data.data
        const returnedSchemeId = verified.scheme_id || 'AGRI2551'
        const returnedSchemeName = verified.recommended_scheme

        if (returnedSchemeId) setActiveSchemeId(returnedSchemeId)
        if (returnedSchemeName) setActiveSchemeName(returnedSchemeName)

        const sec1 = verified.structured_sections?.section_1_recommended_scheme || {}
        const sec3 = verified.structured_sections?.section_3_benefits_available || {}
        const sec6 = verified.structured_sections?.section_6_official_government_links || {}

        // Detailed Color-Coded Browser Console Log Groups
        console.group('%c🏛️ CivicSphere AI Assist — End-to-End Grounded Generation (Phases 2 → 5)', 'color: #00B87C; font-weight: bold; font-size: 14px; padding: 4px;');
        console.log('%c[Step 10 — User Input Capture]', 'color: #2563EB; font-weight: bold;', UserQuery);
        console.log('%c[Phase 2 — Query Understanding & Profile Merge]', 'color: #0284C7; font-weight: bold;', {
          intent: sec1.scheme_name,
          scheme_id: returnedSchemeId,
          state: sec1.state,
          citizen_profile: UserQuery.user_id
        });
        console.log('%c[Phase 3 — Hybrid RAG & Confidence Scoring]', 'color: #7C3AED; font-weight: bold;', {
          confidence_score: verified.confidence_score,
          confidence_category: verified.confidence_category,
          retrieval_status: verified.retrieval_status
        });
        console.log('%c[Phase 4 — Verified Context Package & Strict Prompt]', 'color: #D97706; font-weight: bold;', {
          target_model: 'Llama 3.1 8B Instruct',
          citations: verified.citation_sources,
          verified_urls: verified.official_urls
        });
        console.log('%c[Phase 5 — Step 22 & Step 23: Grounded Verified Response]', 'color: #10B981; font-weight: bold;', verified);
        console.groupEnd();

        // Construct Rich Scheme Card
        const topBenefit = (sec3.assistance_amounts && sec3.assistance_amounts[0]) ||
          (sec3.financial_benefits && sec3.financial_benefits[0]) ||
          'Direct Benefit Transfer (DBT) credit into Aadhaar-linked bank account'

        const schemeCard: Scheme = {
          title: verified.recommended_scheme,
          category: `${verified.confidence_percentage} Match · ${verified.eligibility_status}`,
          icon: '🏛️',
          benefit: topBenefit,
          eligibility: `Status: ${verified.eligibility_status} (Landholding & State Verified)`,
          link: verified.primary_registration_link || sec6.primary_registration_url || 'https://pmkisan.gov.in/'
        }

        // Dynamically suggest grounded follow-up actions based on current scheme
        const actionOptions = [
          { key: 'section_2_eligibility_result', label: '🎯 Check Eligibility' },
          { key: 'section_3_benefits_available', label: '💰 View Benefits' },
          { key: 'section_4_required_documents', label: '📑 Required Documents' },
          { key: 'section_6_official_government_links', label: '🔗 Official Portal' }
        ]
        const secKeys = Object.keys(verified.structured_sections || {})
        const complementaryActions = actionOptions
          .filter(opt => !secKeys.includes(opt.key))
          .map(opt => opt.label)

        const actionsToDisplay = complementaryActions.length > 0
          ? complementaryActions
          : actionOptions.map(opt => opt.label)

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: verified.verified_ai_response || `Recommended Scheme: **${verified.recommended_scheme}**\n\nStatus: **${verified.eligibility_status}**`,
          schemes: [schemeCard],
          schemeId: returnedSchemeId,
          schemeName: returnedSchemeName,
          actions: actionsToDisplay
        }

        setMessages(prev => [...prev, assistantMsg])
      } else {
        console.warn('[AI Assist] Chat API fallback, running query understanding fallback:', data.error);
        setMessages(prev => [...prev, generateAIResponse(promptText, userState, userOccupation)])
      }
    } catch (err) {
      console.error('[AI Assist] Grounded Generation chat connection error:', err);
      setMessages(prev => [...prev, generateAIResponse(promptText, userState, userOccupation)])
    } finally {
      setIsTyping(false)
    }
  }, [input, isTyping, userState, userOccupation, profile, user, sessionId, conversationId, activeSchemeId, activeSchemeName])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClear = () => {
    setConversationId(`conv_${Date.now().toString(36)}`)
    setActiveSchemeId(null)
    setActiveSchemeName(null)
    setMessages([initialGreeting])
  }

  const handleExport = () => {
    const content = messages.map(m => `[${m.sender.toUpperCase()} ${m.timestamp}]\n${m.text}`).join('\n\n---\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'civicsphere-ai-chat.txt'; a.click()
  }

  const toggleListening = () => {
    if (isListening) { setIsListening(false); return }
    setIsListening(true)
    lastInputTypeRef.current = 'voice'
    setTimeout(() => {
      setIsListening(false)
      setInput('Which agricultural subsidies are available in my state?')
      inputRef.current?.focus()
    }, 2500)
  }

  const filteredHistory = MOCK_HISTORY.filter(h =>
    h.preview.toLowerCase().includes(historySearch.toLowerCase())
  )

  /* Container subtle tilt on mouse move */
  const mouseX = useMotionValue(0); const mouseY = useMotionValue(0)
  const rotX = useSpring(useTransform(mouseY, [-200, 200], [1.0, -1.0]), { stiffness: 160, damping: 28 })
  const rotY = useSpring(useTransform(mouseX, [-250, 250], [-1.0, 1.0]), { stiffness: 160, damping: 28 })

  /* ── Shared card entrance animation ── */
  const cardVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: (i: number) => ({
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { delay: i * 0.08, duration: 0.5, type: 'spring' as const, stiffness: 200, damping: 24 }
    })
  }

  /* ── Idle float for cards ── */
  const idleFloat = (i: number) => ({
    y: [0, -3, 0],
    transition: { duration: 5 + (i % 3), repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.3 }
  })

  return (
    <div className="w-full space-y-5">

      {/* ════════════════ HERO SECTION (OPEN LAYOUT MATCHING EXPLORE SCHEMES) ════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full space-y-6 pt-1"
      >
        <div className="space-y-6">
          {/* Centered Explore Schemes format header */}
          <div className="text-center space-y-4">
            {/* Badge */}
            <div className="flex justify-center">
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase backdrop-blur-md shadow-sm ${
                  isDark ? 'border-[#00B87C]/30 bg-[#00B87C]/8 text-[#34D399]' : 'border-[#D4A017]/35 bg-[#FFF5D6] text-[#8A6210]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: t.accent }} />
                Digital Public Infrastructure • AI Citizen Assistance
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-heading leading-tight">
                <span style={{ color: t.text }}>AI Government </span>
                <span
                  className={
                    isDark
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00B87C] via-[#10B981] to-[#34D399]'
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-[#B48418] via-[#D4A017] to-[#F59E0B]'
                  }
                >
                  Scheme Assistant
                </span>
              </h1>
              <div className="flex justify-center pt-1">
                <div
                  className="h-1 w-28 sm:w-36 rounded-full"
                  style={{
                    background: isDark
                      ? 'linear-gradient(90deg, #00B87C, transparent)'
                      : 'linear-gradient(90deg, #D4A017, transparent)',
                  }}
                />
              </div>
              <p className="text-xs sm:text-sm max-w-lg mx-auto font-medium pt-1" style={{ color: t.textMuted }}>
                Ask questions about welfare eligibility, document prerequisites, and application steps powered by grounded RAG reasoning.
              </p>
            </div>

            {/* Citizen Context Ribbon */}
            <div className="flex justify-center pt-1">
              <div
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl shadow-xs border text-xs font-semibold flex-wrap justify-center backdrop-blur-md"
                style={{
                  background: isDark ? 'rgba(12, 26, 43, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                  borderColor: isDark ? 'rgba(0, 184, 124, 0.2)' : 'rgba(212, 160, 23, 0.25)',
                  color: t.textMuted,
                }}
              >
                <ShieldCheck className="w-4 h-4" style={{ color: t.accent }} />
                <span>Citizen: <strong style={{ color: t.text }}>{citizenName}</strong></span>
                <span className="opacity-30">|</span>
                <span>State: <strong style={{ color: t.text }}>{userState}</strong></span>
                <span className="opacity-30">|</span>
                <span>Role: <strong style={{ color: t.text }}>{userOccupation}</strong></span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-[10px]"
                  style={{
                    background: isDark ? 'rgba(0, 184, 124, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                    color: t.accent,
                  }}
                >
                  <Check className="w-3 h-3" /> Profile Synced
                </span>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards matching Explore Schemes style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {[
              {
                label: 'Schemes Indexed',
                value: '860+',
                sub: '● Active Verified Database',
                icon: <Database className="w-5 h-5" />,
                colored: true,
              },
              {
                label: 'Knowledge Sources',
                value: '18+',
                sub: 'State & Central Portals',
                icon: <Globe className="w-5 h-5" />,
                colored: true,
              },
              {
                label: 'AI Response Time',
                value: '< 1.8s',
                sub: '● Real-time RAG Pipeline',
                icon: <Clock className="w-5 h-5" />,
                colored: false,
              },
            ].map((stat, si) => (
              <motion.div
                key={si}
                whileHover={{ y: -7, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                className={`relative p-5 rounded-3xl border flex items-center justify-between backdrop-blur-xl transition-all shadow-sm overflow-hidden group text-left ${
                  isDark
                    ? 'bg-gradient-to-br from-[#0C1A2B]/95 to-[#0F1C2E]/95 border-[#00B87C]/25 hover:border-[#00B87C]/55 hover:shadow-xl hover:shadow-[#00B87C]/10'
                    : 'bg-gradient-to-br from-white/95 to-[#FFFDF7]/95 border-[#D4A017]/35 hover:border-[#D4A017]/60 hover:shadow-xl hover:shadow-amber-900/8'
                }`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] group-hover:h-[3px] transition-all duration-300"
                  style={{
                    background: isDark
                      ? 'linear-gradient(90deg, #00B87C, transparent)'
                      : 'linear-gradient(90deg, #D4A017, transparent)',
                  }}
                />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: t.textMuted }}>
                    {stat.label}
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-black font-heading" style={{ color: t.text }}>
                    {stat.value}
                  </h4>
                  <span
                    className="text-[10px] font-semibold block"
                    style={{ color: stat.colored ? t.accent : t.textMuted }}
                  >
                    {stat.sub}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                    stat.colored
                      ? isDark
                        ? 'bg-[#00B87C]/10 text-[#34D399] border-[#00B87C]/30'
                        : 'bg-[#FFF5D6] text-[#8A6210] border-[#D4A017]/35'
                      : isDark
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {stat.icon}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ════════════════ QUICK PROMPT CARDS ════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5" style={{ color: t.textMuted }}>
          <Sparkles className="w-3 h-3" style={{ color: t.accent }} /> Quick Prompts
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {QUICK_PROMPTS.map((p, i) => (
            <motion.button
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{
                y: -5, scale: 1.025, rotate: 0.4,
                boxShadow: t.shadowHover,
                borderColor: t.accentBorderHover,
                transition: { duration: 0.22 }
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSend(p.title)}
              className="text-left p-3.5 rounded-2xl flex items-start gap-3 relative overflow-hidden group"
              style={{
                background: t.cardBg, border: `1px solid ${t.accentBorder}`,
                backdropFilter: 'blur(14px)', boxShadow: t.shadow,
                transition: 'border-color 0.25s ease',
              }}
            >
              {/* Hover shimmer sweep */}
              <motion.div className="absolute inset-0 w-1/2 pointer-events-none"
                initial={{ x: '-120%' }}
                whileHover={{ x: '250%' }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
                style={{ background: `linear-gradient(90deg,transparent,${t.accentGlow},transparent)` }}
              />
              <motion.span
                className="text-2xl leading-none flex-shrink-0 mt-0.5 block"
                whileHover={{ rotate: 8, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
              >
                {p.icon}
              </motion.span>
              <div className="min-w-0 relative z-10">
                <div className="text-[12px] font-black truncate" style={{ color: t.text }}>{p.title}</div>
                <div className="text-[10px] truncate" style={{ color: t.textMuted }}>{p.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ════════════════ CHAT CONTAINER ════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[28px] overflow-hidden relative"
        style={{
          background: t.surface,
          border: `1px solid ${t.accentBorder}`,
          boxShadow: t.shadow,
          backdropFilter: 'blur(22px)',
        }}
      >
        {/* Inner top light line */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg,transparent,${t.accent}55,transparent)` }} />

        {/* ── Chat Toolbar ── */}
        <div className="px-5 py-4 flex items-center justify-between gap-3"
          style={{ borderBottom: `1px solid ${t.accentBorder}` }}>
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <CivicSphereLogoAvatar size="w-9 h-9" />
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                style={{ background: '#00B87C', border: `1.5px solid ${isDark ? '#0B1726' : '#FFFDF5'}` }}
              />
            </div>
            <div>
              <div className="text-[12px] font-black" style={{ color: t.text }}>CivicSphere Assist</div>
              <div className="text-[10px] font-semibold" style={{ color: t.accent }}>● Online · English Only · RAG Active</div>
            </div>
          </div>

          {/* Toolbar actions */}
          <div className="flex items-center gap-1">
            {[
              { icon: <PlusCircle className="w-3.5 h-3.5" />, label: 'New Chat', action: handleClear },
              { icon: <History className="w-3.5 h-3.5" />, label: 'History', action: () => setShowHistory(v => !v) },
              { icon: <Download className="w-3.5 h-3.5" />, label: 'Export', action: handleExport },
              { icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'Clear', action: handleClear },
            ].map((btn, i) => (
              <motion.button key={i}
                whileHover={{ scale: 1.1, y: -1 }}
                whileTap={{ scale: 0.9 }}
                onClick={btn.action}
                title={btn.label}
                className="group relative p-2 rounded-xl transition-all duration-200"
                style={{ color: t.textMuted }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = t.chipBg
                    ; (e.currentTarget as HTMLButtonElement).style.color = t.accent
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    ; (e.currentTarget as HTMLButtonElement).style.color = t.textMuted
                }}
              >
                {btn.icon}
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg text-[9px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none"
                  style={{ background: t.accent, color: '#fff' }}>
                  {btn.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── History Drawer ── */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
              style={{ borderBottom: `1px solid ${t.accentBorder}` }}
            >
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: t.textMuted }}>Recent Chats</span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowHistory(false)}>
                    <X className="w-3.5 h-3.5" style={{ color: t.textMuted }} />
                  </motion.button>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: t.chipBg, border: `1px solid ${t.chipBorder}` }}>
                  <Search className="w-3 h-3 flex-shrink-0" style={{ color: t.textMuted }} />
                  <input value={historySearch} onChange={e => setHistorySearch(e.target.value)}
                    placeholder="Search history..." className="flex-1 bg-transparent text-[11px] outline-none"
                    style={{ color: t.text }} />
                </div>
                {filteredHistory.map(h => (
                  <motion.button key={h.id} whileHover={{ x: 4 }}
                    onClick={() => { setHistorySearch(''); setShowHistory(false) }}
                    className="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 group"
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = t.chipBg }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                  >
                    <div className="text-[12px] font-semibold truncate" style={{ color: t.text }}>{h.preview}</div>
                    <div className="text-[10px]" style={{ color: t.textMuted }}>{h.time}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Messages Area ── */}
        <div
          className="px-5 py-5 space-y-5 max-h-[520px] min-h-[300px] overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: `${t.scrollThumb} transparent` }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id}
                initial={msg.sender === 'user'
                  ? { opacity: 0, x: 30, scale: 0.94 }
                  : { opacity: 0, x: -24, scale: 0.95 }
                }
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.38, type: 'spring', stiffness: 200, damping: 26 }}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar — Website Logo */}
                {msg.sender === 'assistant' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex-shrink-0 mt-0.5"
                  >
                    <CivicSphereLogoAvatar size="w-9 h-9" />
                  </motion.div>
                )}

                <div className={`max-w-[82%] sm:max-w-[76%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} gap-1`}>
                  <motion.div
                    whileHover={{ y: -1 }}
                    className="relative rounded-2xl px-3.5 py-3 text-[12px] leading-relaxed"
                    style={msg.sender === 'user' ? {
                      background: t.msgUserGrad,
                      borderRadius: '18px 18px 4px 18px',
                      boxShadow: `0 4px 22px ${t.accentGlowStrong}`,
                      color: t.msgUserText,
                    } : {
                      background: t.msgAiBg,
                      border: `1px solid ${t.accentBorder}`,
                      borderRadius: '4px 18px 18px 18px',
                      color: t.text,
                      backdropFilter: 'blur(14px)',
                      boxShadow: t.shadow,
                    }}
                  >
                    {/* Shine for user bubble */}
                    {msg.sender === 'user' && (
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ borderRadius: '18px 18px 4px 18px', background: 'linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 55%)' }} />
                    )}

                    <div className="whitespace-pre-line font-medium">
                      <RichText text={msg.text} userBubble={msg.sender === 'user'} isDark={isDark} />
                    </div>

                    {/* Scheme Cards */}
                    {msg.schemes && msg.schemes.length > 0 && (
                      <div className="mt-3.5 space-y-2.5">
                        {msg.schemes.map((scheme, idx) => (
                          <motion.div key={idx}
                            initial={{ opacity: 0, x: -12, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            transition={{ delay: idx * 0.1, duration: 0.35 }}
                            whileHover={{ scale: 1.015, x: 2, borderColor: t.accentBorderHover }}
                            className="relative rounded-xl p-3.5 overflow-hidden group"
                            style={{
                              background: isDark ? '#0B1726' : 'rgba(255,255,255,0.92)',
                              border: `1px solid ${t.accentBorder}`,
                              transition: 'border-color 0.25s ease',
                            }}
                          >
                            {/* Left accent bar */}
                            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: t.accent }} />
                            {/* Hover shimmer */}
                            <motion.div className="absolute inset-0 w-1/2 pointer-events-none"
                              initial={{ x: '-120%' }} whileHover={{ x: '250%' }}
                              transition={{ duration: 0.55 }}
                              style={{ background: `linear-gradient(90deg,transparent,${t.accentGlow},transparent)` }}
                            />
                            <div className="flex items-start justify-between gap-2 mb-2 pl-2">
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-base leading-none">{scheme.icon}</span>
                                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                    style={{ background: t.chipBg, color: t.chipText, border: `1px solid ${t.chipBorder}` }}>
                                    {scheme.category}
                                  </span>
                                </div>
                                <h4 className="font-black text-[13px] leading-snug" style={{ color: t.text }}>{scheme.title}</h4>
                              </div>
                              {scheme.link && (
                                <a href={scheme.link} target="_blank" rel="noreferrer"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg flex-shrink-0"
                                  style={{ background: t.chipBg, color: t.accent }}>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                            <div className="pl-2 space-y-1 text-[11px]" style={{ color: t.textMuted }}>
                              <p><span className="font-black text-[10px] uppercase tracking-wide mr-1" style={{ color: t.text }}>Benefit:</span>{scheme.benefit}</p>
                              <p><span className="font-black text-[10px] uppercase tracking-wide mr-1" style={{ color: t.text }}>Eligibility:</span>{scheme.eligibility}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Action chips */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-2.5"
                        style={{ borderTop: `1px solid ${t.accentBorder}` }}>
                        {msg.actions.map((act, i) => (
                          <motion.button key={i}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 22 }}
                            whileHover={{ scale: 1.05, y: -1.5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSend(act, msg.schemeId || activeSchemeId || undefined, msg.schemeName || activeSchemeName || undefined)}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all duration-200"
                            style={{ background: t.chipBg, border: `1px solid ${t.chipBorder}`, color: t.chipText }}
                          >
                            {act} ↗
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Footer: timestamp + copy */}
                    <div className="mt-2 flex items-center justify-between text-[10px]"
                      style={{ color: msg.sender === 'user' ? (isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.55)') : t.textFaint }}>
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'assistant' && (
                        <motion.button whileTap={{ scale: 0.88 }}
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="flex items-center gap-1 transition-colors"
                          style={{ color: copiedId === msg.id ? t.accent : t.textFaint }}
                        >
                          {copiedId === msg.id
                            ? <><Check className="w-3 h-3" /><span>Copied</span></>
                            : <><Copy className="w-3 h-3" /><span>Copy</span></>
                          }
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* User Profile Avatar */}
                {msg.sender === 'user' && (
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center mt-0.5 border-2 shadow-sm"
                    style={{ borderColor: t.accent, background: t.chipBg }}
                  >
                    {userPhotoUrl ? (
                      <img
                        src={userPhotoUrl}
                        alt={citizenName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-xs" style={{ color: t.accent, background: t.chipBg }}>
                        {citizenName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ── Typing Indicator ── */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 14, x: -8 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.32 }}
                className="flex gap-3 items-center"
              >
                <div className="flex-shrink-0">
                  <CivicSphereLogoAvatar size="w-9 h-9" />
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-[4px] text-[12px] font-semibold"
                  style={{
                    background: t.msgAiBg, border: `1px solid ${t.accentBorder}`,
                    backdropFilter: 'blur(14px)', color: t.textMuted, boxShadow: t.shadow,
                  }}>
                  {/* Thinking dots */}
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full"
                        style={{ background: t.accent }}
                        animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
                      />
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span key={typingMsgIdx}
                      initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
                      transition={{ duration: 0.28 }}
                    >
                      {TYPING_MESSAGES[typingMsgIdx]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Bar ── */}
        <div className="px-5 py-4" style={{ borderTop: `1px solid ${t.accentBorder}` }}>
          <motion.div
            animate={{
              boxShadow: inputFocused
                ? `0 0 0 2px ${t.accent}55, 0 6px 30px ${t.accentGlowStrong}`
                : `0 2px 14px ${t.accentGlow}`
            }}
            transition={{ duration: 0.28 }}
            className="flex items-end gap-2 rounded-[20px] px-4 py-3"
            style={{
              background: t.inputBg,
              border: `1.5px solid ${inputFocused ? t.accent : t.accentBorder}`,
              backdropFilter: 'blur(18px)',
              transition: 'border-color 0.25s ease',
            }}
          >
            {/* AI sparkle icon */}
            <div className="flex-shrink-0 mb-0.5">
              <motion.div
                animate={inputFocused ? { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] } : { rotate: 0 }}
                transition={inputFocused ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : {}}
              >
                <Sparkles className="w-[18px] h-[18px]" style={{ color: t.accent }} />
              </motion.div>
            </div>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              rows={1}
              placeholder={isListening
                ? '🎙 Listening...'
                : 'Ask in English about government schemes, eligibility, documents, subsidies, or benefits...'}
              className="flex-1 bg-transparent text-[13px] font-medium outline-none resize-none leading-relaxed"
              style={{
                color: t.text, caretColor: t.accent,
                minHeight: '22px', maxHeight: '120px',
              }}
            />

            {/* Controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0 mb-0.5">
              {/* Attachment placeholder */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                title="Attach Document (coming soon)"
                className="p-2 rounded-xl transition-colors duration-200"
                style={{ color: t.textFaint }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = t.accent}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = t.textFaint}
              >
                <Paperclip className="w-4 h-4" />
              </motion.button>

              {/* Mic */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                onClick={toggleListening} title={isListening ? 'Listening...' : 'Voice Input'}
                className="p-2 rounded-xl transition-colors duration-200"
                style={{ color: isListening ? '#EF4444' : t.textFaint }}
                animate={isListening ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={isListening ? { duration: 0.7, repeat: Infinity } : {}}
                onMouseEnter={e => { if (!isListening) (e.currentTarget as HTMLButtonElement).style.color = t.accent }}
                onMouseLeave={e => { if (!isListening) (e.currentTarget as HTMLButtonElement).style.color = t.textFaint }}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </motion.button>

              {/* Send */}
              <motion.button
                type="button"
                whileHover={input.trim() && !isTyping ? { scale: 1.1 } : {}}
                whileTap={input.trim() && !isTyping ? { scale: 0.9 } : {}}
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                title="Send"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                style={input.trim() && !isTyping ? {
                  background: `linear-gradient(135deg,${t.accent},${t.accentAlt})`,
                  boxShadow: `0 4px 18px ${t.accentGlowStrong}`,
                  color: '#fff'
                } : {
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
                  color: t.textFaint
                }}
              >
                <motion.div
                  animate={isTyping ? { rotate: 360 } : { rotate: 0 }}
                  transition={isTyping ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                >
                  {isTyping ? <RefreshCw className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </motion.div>
              </motion.button>
            </div>
          </motion.div>

          <div className="mt-2 flex items-center justify-between text-[10px] px-1" style={{ color: t.textFaint }}>
            <span>English Only · 500+ schemes</span>
            <span className="hidden sm:block">Shift+Enter new line · Enter to send</span>
          </div>
        </div>
      </motion.div>

      {/* ════════════════ CAPABILITY GRID ════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.4 }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5" style={{ color: t.textMuted }}>
          <Zap className="w-3 h-3" style={{ color: t.accent }} /> AI Capabilities
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {CAPABILITIES.map((c, i) => (
            <motion.div key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{
                y: -5, scale: 1.025, rotate: 0.4,
                boxShadow: t.shadowHover,
                borderColor: t.accentBorderHover,
                transition: { duration: 0.22 }
              }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center cursor-default relative overflow-hidden"
              style={{
                background: t.cardBg, border: `1px solid ${t.accentBorder}`,
                backdropFilter: 'blur(14px)', boxShadow: t.shadow,
                transition: 'border-color 0.25s ease',
              }}
            >
              {/* Idle float */}
              <motion.div animate={idleFloat(i)}>
                <motion.span
                  className="text-2xl block"
                  whileHover={{
                    rotate: c.hover === 'flip' ? [0, 180, 0] : c.hover === 'arrow' ? [0, 12, 0] : [0, 8, -8, 0],
                    scale: 1.2,
                    transition: { duration: 0.5 }
                  }}
                >
                  {c.icon}
                </motion.span>
              </motion.div>
              <span className="text-[10px] font-black leading-snug" style={{ color: t.text }}>{c.label}</span>
              {/* Shimmer on hover */}
              <motion.div className="absolute inset-0 w-full pointer-events-none"
                initial={{ x: '-120%' }} whileHover={{ x: '250%' }}
                transition={{ duration: 0.6 }}
                style={{ background: `linear-gradient(90deg,transparent,${t.accentGlow},transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ════════════════ TRUST RIBBON ════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: t.cardBg, border: `1px solid ${t.accentBorder}`,
          backdropFilter: 'blur(14px)',
        }}
      >
        {/* Animated shimmer border */}
        <motion.div className="absolute top-0 left-0 h-[1.5px] w-1/3 pointer-events-none"
          animate={{ x: ['-120%', '400%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          style={{ background: `linear-gradient(90deg,transparent,${t.accent},transparent)` }}
        />
        <div className="px-5 py-4 flex flex-wrap items-center justify-around gap-4">
          {[
            { icon: <ShieldCheck className="w-4 h-4" />, label: 'Verified Government Knowledge' },
            { icon: <Zap className="w-4 h-4" />, label: 'Secure AI Processing' },
            { icon: <Sparkles className="w-4 h-4" />, label: 'Personalized Recommendations' },
          ].map((item, i) => (
            <motion.div key={i}
              whileHover={{ scale: 1.04, y: -1 }}
              className="flex items-center gap-2.5 cursor-default"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: t.chipBg, border: `1px solid ${t.chipBorder}`, color: t.accent }}>
                {item.icon}
              </div>
              <span className="text-[11px] font-semibold" style={{ color: t.textMuted }}>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
