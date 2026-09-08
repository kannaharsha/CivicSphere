import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, Briefcase, MapPin, Globe, ShieldCheck, CheckCircle2,
  Bookmark, FileText, Bell, Zap, ChevronRight, UserCheck, BookOpen,
  Cpu, ArrowUpRight, TrendingUp, Award
} from 'lucide-react'

interface TopHeroSectionProps {
  profile: any
  completionPercent: number
  onOpenOnboarding: () => void
  onNavigateTab?: (tabId: string) => void
  isDark: boolean
}

const TYPING_MESSAGES = [
  'Scanning eligible schemes...',
  'AI eligibility verified.',
  '2 new schemes matched today.'
]

const LIVE_NOTIFICATIONS = [
  {
    id: 1,
    title: 'PM-KISAN 16th Installment Credited',
    desc: '₹2,000 Direct Benefit Transfer executed to your linked account.',
    time: '10m ago',
    type: 'benefit',
    badge: '₹2,000 Paid'
  },
  {
    id: 2,
    title: 'Rythu Bandhu Scheme Deadline Alert',
    desc: 'Telangana Agriculture Dept deadline approaching on Sept 15.',
    time: '45m ago',
    type: 'deadline',
    badge: 'Urgent'
  },
  {
    id: 3,
    title: 'AI Eligibility Verified for 2 Schemes',
    desc: 'PM Kusum Solar Pump & Crop Insurance eligibility confirmed.',
    time: '2h ago',
    type: 'ai',
    badge: '98% Match'
  },
  {
    id: 4,
    title: 'Aadhaar e-KYC Verification Successful',
    desc: 'Citizen identity verified via UIDAI portal.',
    time: '5h ago',
    type: 'verified',
    badge: 'Verified'
  },
  {
    id: 5,
    title: 'Free Fertilizer Subsidy Passbook Issued',
    desc: 'Collect passbook from Mandal Agriculture Office.',
    time: '1d ago',
    type: 'benefit',
    badge: 'Approved'
  }
]

const TOP_SCHEMES_PREVIEW = [
  {
    id: 'pm-kisan',
    title: 'PM-Kisan Samman Nidhi',
    category: 'Agriculture • Central Scheme',
    benefit: '₹6,000 / Year',
    matchScore: 98,
    deadline: 'Ongoing',
    status: 'High Eligibility'
  },
  {
    id: 'rythu-bandhu',
    title: 'Telangana Rythu Bandhu Scheme',
    category: 'State Scheme • Telangana',
    benefit: '₹10,000 / Acre',
    matchScore: 96,
    deadline: 'Sept 15, 2026',
    status: 'Deadline Soon'
  }
]

export default function TopHeroSection({
  profile,
  completionPercent,
  onOpenOnboarding: _onOpenOnboarding,
  onNavigateTab,
  isDark
}: TopHeroSectionProps) {
  const [greeting, setGreeting] = useState('Good Evening')
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  const [msgIndex, setMsgIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentMsg = TYPING_MESSAGES[msgIndex]
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(currentMsg.substring(0, displayedText.length + 1))
        if (displayedText === currentMsg) {
          setTimeout(() => setIsDeleting(true), 1800)
        }
      } else {
        setDisplayedText(currentMsg.substring(0, displayedText.length - 1))
        if (displayedText === '') {
          setIsDeleting(false)
          setMsgIndex((prev) => (prev + 1) % TYPING_MESSAGES.length)
        }
      }
    }, isDeleting ? 30 : 60)

    return () => clearTimeout(timer)
  }, [displayedText, isDeleting, msgIndex])

  const [isTickerHovered, setIsTickerHovered] = useState(false)

  return (
    <div className="w-full font-sans select-none space-y-6">
      {/* ==================== 1. TOP HERO SECTION (50% LEFT / 50% RIGHT) ==================== */}
      <div className="grid lg:grid-cols-12 gap-6 items-center w-full">

        {/* LEFT SIDE: UNBOXED / SEAMLESS */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 space-y-4"
        >
          {/* AI Engine Active Pill */}
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold transition-all backdrop-blur-xl ${isDark
              ? 'bg-[#D4A537]/20 border border-[#D4A537]/45 text-[#E7C66B] shadow-[0_0_15px_rgba(212,165,55,0.2)] animate-pulse'
              : 'bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#B48418] shadow-xs'
            }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-[#D4A537]' : 'bg-[#F59E0B]'
                }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? 'bg-[#D4A537]' : 'bg-[#F59E0B]'
                }`}></span>
            </span>
            <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-[#E7C66B]' : 'text-[#B48418]'}`} />
            <span className="tracking-wide uppercase text-[11px] font-extrabold">AI Citizen Match Engine Active</span>
          </div>

          {/* Greeting Heading */}
          <div className="space-y-1">
            <h1 className={`text-2xl sm:text-3xl lg:text-3.5xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#0F172A]'
              }`}>
              {greeting},{' '}
              <span className="bg-gradient-to-r from-[#D4A537] via-[#F59E0B] to-[#B48418] bg-clip-text text-transparent drop-shadow-xs">
                {profile?.fullName || 'Harsha'}
              </span>{' '}
              <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#334155]'
              }`}>
              Your AI Citizen Match Engine has found new government opportunities for you today.
            </p>
          </div>

          {/* Live Typing Animation Bar */}
          <div className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border text-xs font-mono transition-all shadow-sm backdrop-blur-xl ${isDark
              ? 'bg-black/50 border-[#D4A537]/40 text-[#E7C66B]'
              : 'bg-white/70 border-[#D4A537]/40 text-[#0F172A]'
            }`}>
            <Zap className={`w-3.5 h-3.5 shrink-0 animate-spin-slow ${isDark ? 'text-[#D4A537]' : 'text-[#F59E0B]'}`} />
            <span className={`font-black shrink-0 ${isDark ? 'text-[#4ADE80]' : 'text-[#B48418]'}`}>AI Engine:</span>
            <span className="truncate font-bold">{displayedText}</span>
            <span className={`w-1.5 h-3.5 animate-pulse shrink-0 ${isDark ? 'bg-[#D4A537]' : 'bg-[#F59E0B]'}`} />
          </div>

          {/* Identity Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs backdrop-blur-xl ${isDark
                  ? 'bg-black/45 border-[#D4A537]/35 text-slate-200'
                  : 'bg-[#FFF9EA]/75 border-[#D4A537]/50 text-[#0F172A]'
                }`}
            >
              <Briefcase className={`w-3.5 h-3.5 ${isDark ? 'text-[#4ADE80]' : 'text-[#D4A537]'}`} />
              <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Occupation:</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{profile?.occupation || 'Agriculture / Farmer'} 🌾</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs backdrop-blur-xl ${isDark
                  ? 'bg-black/45 border-[#D4A537]/35 text-slate-200'
                  : 'bg-[#FFF9EA]/75 border-[#D4A537]/50 text-[#0F172A]'
                }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${isDark ? 'text-[#E7C66B]' : 'text-[#D4A017]'}`} />
              <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>State:</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{profile?.state || 'Telangana'} 📍</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs backdrop-blur-xl ${isDark
                  ? 'bg-black/45 border-[#D4A537]/35 text-slate-200'
                  : 'bg-[#FFF9EA]/75 border-[#D4A537]/50 text-[#0F172A]'
                }`}
            >
              <Globe className={`w-3.5 h-3.5 ${isDark ? 'text-teal-400' : 'text-teal-700'}`} />
              <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Language:</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{profile?.language || 'English'} 🌐</span>
            </motion.div>
          </div>

          {/* Integrated Animated Profile Completion Bar */}
          <motion.div
            whileHover={{ scale: 1.015 }}
            className={`p-4 rounded-2xl border relative overflow-hidden backdrop-blur-2xl transition-all duration-300 shadow-sm ${isDark
                ? 'bg-gradient-to-r from-[#0A1A2F]/90 via-[#0D263B]/85 to-[#08131F]/90 border-[#00B87C]/50 shadow-[#00B87C]/15 ring-1 ring-[#00B87C]/30'
                : 'bg-gradient-to-r from-[#FFFDF5] via-[#FFFBEB] to-[#FEF3C7]/40 border-[#FCD34D]/60 shadow-xs shadow-[#FBBF24]/10'
              }`}
          >
            {/* Ambient Radial Glow Graphic (Softest Light Yellow in Light Mode) */}
            <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-xl pointer-events-none ${
              isDark ? 'bg-[#00B87C]/20' : 'bg-[#FDE68A]/35'
            }`} />

            <div className="flex items-center justify-between text-xs font-black mb-2 relative z-10">
              <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#1E293B]'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-xs ${
                  isDark
                    ? 'bg-gradient-to-tr from-[#00B87C] to-[#0F766E]'
                    : 'bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24]'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Profile Completion</span>
              </div>
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black text-white shadow-xs flex items-center gap-1 ${
                  isDark
                    ? 'bg-gradient-to-r from-[#00B87C] to-[#0F766E] border border-emerald-300/30'
                    : 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] border border-amber-200/50'
                }`}
              >
                <Sparkles className="w-3 h-3 text-white animate-spin-slow" />
                {completionPercent}% Complete
              </motion.span>
            </div>

            <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 relative shadow-inner z-10 ${
              isDark
                ? 'bg-slate-900/90 border border-[#00B87C]/40'
                : 'bg-[#FEF3C7] border border-[#FCD34D]/60'
            }`}>
              <motion.div
                className={`h-full rounded-full relative overflow-hidden shadow-xs ${
                  isDark
                    ? 'bg-gradient-to-r from-[#00B87C] via-[#0F766E] to-[#D4A537]'
                    : 'bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#10B981]'
                }`}
                initial={{ width: '0%' }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
              </motion.div>
            </div>

            <div className="flex items-center justify-between text-[10.5px] font-extrabold mt-2 pt-0.5 relative z-10">
              <span className={`flex items-center gap-1 ${isDark ? 'text-emerald-300' : 'text-[#B48418]'}`}>
                <CheckCircle2 className={`w-3 h-3 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A537]'}`} />
                {completionPercent === 100 ? '100% Matched for Scheme Accuracy' : 'Complete fields for scheme matching'}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE: 4 TRANSLUCENT CARDS */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-6"
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-3.5">

            {/* Card 1: Eligible Schemes */}
            <motion.div
              whileHover={{ y: -4, scale: 1.015 }}
              onClick={() => onNavigateTab && onNavigateTab('eligibility')}
              className={`p-3.5 sm:p-4 rounded-xl transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
              }`}
            >
              {/* Royal Ambient Glow & Grid Graphic */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-[#0F9D58]/20 via-[#D4A537]/15 to-transparent blur-lg pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[radial-gradient(#D4A537_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none" />

              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className={`text-[10.5px] font-black uppercase tracking-wider ${
                  isDark ? 'text-slate-200' : 'text-[#334155]'
                }`}>
                  Eligible Schemes
                </span>
                <div className={`p-1.5 rounded-lg shadow-xs transition-transform duration-300 group-hover:rotate-12 ${
                  isDark
                    ? 'bg-gradient-to-tr from-[#0F9D58]/30 to-[#0D9488]/30 text-[#4ADE80] border border-[#0F9D58]/40'
                    : 'bg-gradient-to-tr from-[#F59E0B]/20 to-[#FBBF24]/20 text-[#B48418] border border-[#F59E0B]/30'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 mb-1 relative z-10">
                <span className={`text-2.5xl sm:text-3xl font-black tracking-tight drop-shadow-xs ${
                  isDark ? 'text-[#4ADE80]' : 'text-[#B48418]'
                }`}>
                  12
                </span>
                <span className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>matching</span>
              </div>

              <span className={`text-[10.5px] font-extrabold inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform relative z-10 ${
                isDark ? 'text-[#4ADE80]' : 'text-[#B48418]'
              }`}>
                View eligibility <ChevronRight className="w-3 h-3" />
              </span>
            </motion.div>

            {/* Card 2: Saved Schemes */}
            <motion.div
              whileHover={{ y: -4, scale: 1.015 }}
              onClick={() => onNavigateTab && onNavigateTab('explore')}
              className={`p-3.5 sm:p-4 rounded-xl transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
              }`}
            >
              {/* Royal Ambient Glow & Grid Graphic */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-[#D4A537]/25 via-[#B48418]/15 to-transparent blur-lg pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[radial-gradient(#D4A537_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none" />

              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className={`text-[10.5px] font-black uppercase tracking-wider ${
                  isDark ? 'text-slate-200' : 'text-[#334155]'
                }`}>
                  Saved Schemes
                </span>
                <div className={`p-1.5 rounded-lg shadow-xs transition-transform duration-300 group-hover:rotate-12 ${
                  isDark
                    ? 'bg-gradient-to-tr from-[#D4A537]/30 to-[#B48418]/30 text-[#E7C66B] border border-[#D4A537]/40'
                    : 'bg-gradient-to-tr from-[#D4A537]/20 to-[#B48418]/20 text-[#B48418] border border-[#D4A537]/40'
                }`}>
                  <Bookmark className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 mb-1 relative z-10">
                <span className={`text-2.5xl sm:text-3xl font-black tracking-tight drop-shadow-xs ${
                  isDark ? 'text-[#E7C66B]' : 'text-[#B48418]'
                }`}>
                  5
                </span>
                <span className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>bookmarks</span>
              </div>

              <span className={`text-[10.5px] font-extrabold inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform relative z-10 ${
                isDark ? 'text-[#E7C66B]' : 'text-[#B48418]'
              }`}>
                Explore bookmarks <ChevronRight className="w-3 h-3" />
              </span>
            </motion.div>

            {/* Card 3: Applied Schemes */}
            <motion.div
              whileHover={{ y: -4, scale: 1.015 }}
              onClick={() => onNavigateTab && onNavigateTab('documents')}
              className={`p-3.5 sm:p-4 rounded-xl transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
              }`}
            >
              {/* Royal Ambient Glow & Grid Graphic */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-teal-500/25 via-[#D4A537]/15 to-transparent blur-lg pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none" />

              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className={`text-[10.5px] font-black uppercase tracking-wider ${
                  isDark ? 'text-slate-200' : 'text-[#334155]'
                }`}>
                  Applied Schemes
                </span>
                <div className={`p-1.5 rounded-lg shadow-xs transition-transform duration-300 group-hover:rotate-12 ${
                  isDark
                    ? 'bg-gradient-to-tr from-teal-500/30 to-emerald-500/30 text-teal-300 border border-teal-500/40'
                    : 'bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 text-teal-800 border border-teal-500/30'
                }`}>
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 mb-1 relative z-10">
                <span className={`text-2.5xl sm:text-3xl font-black tracking-tight drop-shadow-xs ${
                  isDark ? 'text-teal-300' : 'text-teal-800'
                }`}>
                  3
                </span>
                <span className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>tracked</span>
              </div>

              <span className={`text-[10.5px] font-extrabold inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform relative z-10 ${
                isDark ? 'text-teal-300' : 'text-teal-800'
              }`}>
                Track applications <ChevronRight className="w-3 h-3" />
              </span>
            </motion.div>

            {/* Card 4: Notifications */}
            <motion.div
              whileHover={{ y: -4, scale: 1.015 }}
              onClick={() => onNavigateTab && onNavigateTab('notifications')}
              className={`p-3.5 sm:p-4 rounded-xl transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
              }`}
            >
              {/* Royal Ambient Glow & Grid Graphic */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/25 via-[#D4A537]/15 to-transparent blur-lg pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none" />

              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className={`text-[10.5px] font-black uppercase tracking-wider ${
                  isDark ? 'text-slate-200' : 'text-[#334155]'
                }`}>
                  Notifications
                </span>
                <div className={`p-1.5 rounded-lg border border-amber-500/40 relative shadow-xs transition-transform duration-300 group-hover:rotate-12 ${
                  isDark ? 'bg-gradient-to-tr from-amber-500/30 to-orange-500/30 text-amber-400' : 'bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-700'
                }`}>
                  <Bell className="w-3.5 h-3.5" />
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 mb-1 relative z-10">
                <span className={`text-2.5xl sm:text-3xl font-black tracking-tight drop-shadow-xs ${
                  isDark ? 'text-amber-400' : 'text-amber-700'
                }`}>
                  4
                </span>
                <span className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>unread</span>
              </div>

              <span className={`text-[10.5px] font-extrabold inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform relative z-10 ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}>
                View live alerts <ChevronRight className="w-3 h-3" />
              </span>
            </motion.div>

          </div>
        </motion.div>

      </div>

      {/* ==================== 2. QUICK ACTION BUTTONS STRIP ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className={`p-3 sm:p-3.5 rounded-xl transition-all relative overflow-hidden ${
          isDark ? 'glass-profile-card-dark' : 'glass-profile-card-light'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10">
          <div className="flex items-center gap-2 shrink-0">
            <div className={`p-1.5 rounded-lg ${
              isDark ? 'bg-[#0F9D58]/25 text-[#4ADE80] border border-[#0F9D58]/40' : 'bg-[#F59E0B]/15 text-[#B48418] border border-[#F59E0B]/30'
            }`}>
              <Zap className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <h3 className={`text-xs sm:text-sm font-black tracking-tight ${
              isDark ? 'text-white' : 'text-[#0F172A]'
            }`}>
              Quick Action Buttons
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigateTab && onNavigateTab('eligibility')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90'
                  : 'bg-amber-50/90 border-amber-300 text-[#B48418] hover:bg-amber-100/90'
              }`}
            >
              <UserCheck className={`w-3.5 h-3.5 ${isDark ? 'text-[#0F9D58]' : 'text-[#D4A017]'}`} />
              <span>Check Eligibility</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-[#D4A017] text-white font-black shadow-xs">12</span>
            </motion.button>

            <span className={`hidden sm:inline ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>•</span>

            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigateTab && onNavigateTab('explore')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-amber-950/70 border-amber-500/50 text-amber-300 hover:bg-amber-900/90'
                  : 'bg-amber-50/90 border-amber-300 text-[#B48418] hover:bg-amber-100/90'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D4A017]" />
              <span>Explore Schemes</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-[#D4A017] text-white font-black shadow-xs">48</span>
            </motion.button>

            <span className={`hidden sm:inline ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>•</span>

            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigateTab && onNavigateTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-teal-950/70 border-teal-500/50 text-teal-300 hover:bg-teal-900/90'
                  : 'bg-teal-50/90 border-teal-300 text-teal-800 hover:bg-teal-100/90'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              <span>Ask AI Assistant</span>
            </motion.button>

            <span className={`hidden sm:inline ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>•</span>

            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigateTab && onNavigateTab('documents')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-slate-100/90 border-slate-300 text-[#0F172A] hover:bg-slate-200/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>View Documents</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-slate-600 text-white font-black shadow-xs">3</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ==================== 3. MAIN DASHBOARD SECTION ==================== */}
      <div className="grid lg:grid-cols-12 gap-5 items-start w-full">

        {/* LEFT / CENTER: TOP SCHEMES PREVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="lg:col-span-7 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${
                isDark ? 'bg-[#0F9D58]/25 text-[#4ADE80] border border-[#0F9D58]/40' : 'bg-[#F59E0B]/15 text-[#B48418] border border-[#F59E0B]/30'
              }`}>
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm sm:text-base font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-[#0F172A]'
                }`}>
                  Top AI-Matched Schemes (12 Total)
                </h3>
                <p className={`text-[10.5px] font-semibold ${
                  isDark ? 'text-slate-400' : 'text-[#5F6C7B]'
                }`}>
                  Personalized government benefits recommended for your profile
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab && onNavigateTab('explore')}
              className={`text-xs font-bold hover:underline flex items-center gap-0.5 cursor-pointer shrink-0 ${
                isDark ? 'text-[#4ADE80]' : 'text-[#B48418]'
              }`}
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid gap-3">
            {TOP_SCHEMES_PREVIEW.map((scheme) => (
              <motion.div
                key={scheme.id}
                whileHover={{ y: -2, scale: 1.01 }}
                className={`p-3.5 sm:p-4 rounded-xl border backdrop-blur-2xl transition-all shadow-xs group cursor-pointer relative overflow-hidden ${
                  isDark
                    ? 'bg-gradient-to-br from-[#07130C]/75 via-[#0A1813]/65 to-[#07130C]/75 border-[#D4A537]/35 hover:border-[#D4A537] hover:shadow-[0_6px_25px_rgba(212,165,55,0.2)]'
                    : 'bg-gradient-to-br from-[#FFFDF8]/70 via-[#FFF9EA]/55 to-[#FFFDF8]/65 border-[#D4A537]/35 hover:border-[#D4A537] hover:shadow-[0_6px_25px_rgba(212,165,55,0.18)]'
                }`}
              >
                {/* Royal Light Sweep Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4A537]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shadow-xs ${
                        isDark
                          ? 'bg-[#0F9D58]/25 text-[#4ADE80] border-[#0F9D58]/40'
                          : 'bg-[#F59E0B]/15 text-[#B48418] border-[#F59E0B]/30'
                      }`}>
                        {scheme.matchScore}% AI Match
                      </span>
                      <span className={`text-[10.5px] font-extrabold ${
                        isDark ? 'text-slate-300' : 'text-[#475569]'
                      }`}>
                        {scheme.category}
                      </span>
                    </div>

                    <h4 className={`text-xs sm:text-sm font-black tracking-tight transition-colors ${
                      isDark ? 'text-white group-hover:text-[#4ADE80]' : 'text-[#0F172A] group-hover:text-[#B48418]'
                    }`}>
                      {scheme.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs font-bold pt-0.5">
                      <span className={`font-bold flex items-center gap-1 ${
                        isDark ? 'text-[#E7C66B]' : 'text-[#B48418]'
                      }`}>
                        <TrendingUp className="w-3.5 h-3.5" /> Benefit: {scheme.benefit}
                      </span>
                      <span className={`font-medium text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Deadline: {scheme.deadline}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateTab && onNavigateTab('eligibility')}
                    className={`self-start sm:self-center px-3.5 py-1.5 rounded-lg text-white text-xs font-black flex items-center gap-1 shadow-xs hover:brightness-110 transition-all shrink-0 cursor-pointer ${
                      isDark
                        ? 'bg-gradient-to-r from-[#0F9D58] via-[#0D9488] to-[#0F9D58]'
                        : 'bg-gradient-to-r from-[#D4A537] via-[#F59E0B] to-[#D4A537]'
                    }`}
                  >
                    <span>Check & Apply</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT SIDE: LIVE MOVING NOTIFICATIONS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg relative ${
                isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
              }`}>
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
              </div>
              <div>
                <h3 className={`text-sm sm:text-base font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-[#0F172A]'
                }`}>
                  Live AI Alerts & Stream
                </h3>
                <p className={`text-[10.5px] font-semibold ${
                  isDark ? 'text-slate-400' : 'text-[#5F6C7B]'
                }`}>
                  Moving live notification stream (Bottom to Top)
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab && onNavigateTab('notifications')}
              className={`text-xs font-bold hover:underline flex items-center gap-0.5 cursor-pointer shrink-0 ${
                isDark ? 'text-amber-400' : 'text-amber-600'
              }`}
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            onMouseEnter={() => setIsTickerHovered(true)}
            onMouseLeave={() => setIsTickerHovered(false)}
            className={`p-3 sm:p-3.5 rounded-xl border backdrop-blur-2xl overflow-hidden relative transition-all shadow-xs h-[210px] ${
              isDark
                ? 'bg-gradient-to-br from-[#07130C]/75 via-[#0A1813]/65 to-[#07130C]/75 border-[#D4A537]/35'
                : 'bg-gradient-to-br from-[#FFFDF8]/70 via-[#FFF9EA]/55 to-[#FFFDF8]/65 border-[#D4A537]/35'
            }`}
          >
            <div className={`absolute top-0 inset-x-0 h-6 bg-gradient-to-b ${
              isDark ? 'from-[#07130C]' : 'from-[#FFFDF8]'
            } to-transparent z-10 pointer-events-none`} />
            <div className={`absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t ${
              isDark ? 'from-[#07130C]' : 'from-[#FFFDF8]'
            } to-transparent z-10 pointer-events-none`} />

            <motion.div
              animate={{ y: isTickerHovered ? 0 : [0, -290] }}
              transition={{
                repeat: Infinity,
                duration: 16,
                ease: 'linear'
              }}
              className="space-y-2.5"
            >
              {[...LIVE_NOTIFICATIONS, ...LIVE_NOTIFICATIONS].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className={`p-3 rounded-xl border transition-all text-xs space-y-1 shadow-xs ${
                    isDark
                      ? 'bg-black/60 border-[#D4A537]/30 text-slate-200 hover:border-[#D4A537]'
                      : 'bg-[#FFF8E7]/90 border-[#D4A537]/40 text-[#0F172A] hover:border-[#D4A537]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${
                      item.type === 'benefit'
                        ? `bg-amber-500/20 ${isDark ? 'text-[#4ADE80] border border-emerald-500/40' : 'text-[#B48418] border border-amber-500/30'}`
                        : item.type === 'deadline'
                        ? 'bg-rose-500/20 text-rose-600 border border-rose-500/30'
                        : `bg-amber-500/20 ${isDark ? 'text-amber-400 border border-amber-500/40' : 'text-amber-700 border border-amber-500/30'}`
                    }`}>
                      {item.badge}
                    </span>
                    <span className={`text-[9.5px] font-bold ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {item.time}
                    </span>
                  </div>

                  <h5 className={`font-black text-xs leading-snug ${
                    isDark ? 'text-white' : 'text-[#0F172A]'
                  }`}>
                    {item.title}
                  </h5>
                  <p className={`text-[10.5px] font-medium line-clamp-1 ${
                    isDark ? 'text-slate-300' : 'text-[#475569]'
                  }`}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
