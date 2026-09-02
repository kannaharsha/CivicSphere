import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, BookOpen, CheckCircle, Cpu, FileText, Bell, User, Settings, LogOut,
  Sun, Moon, Sparkles, Clock, PanelLeftClose, PanelLeftOpen, Mic,
  ChevronDown, Briefcase, MapPin, Globe, UserCheck
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import AuthParticles from '../authentication/AuthParticles'
import { useAuth } from '../firebase/AuthProvider'

// Navigation Sidebar Items (Matches exact 8 menu items from spec)
const navItems = [
  { label: 'Home Dashboard', icon: Home, id: 'home' },
  { label: 'Explore Schemes', icon: BookOpen, id: 'explore' },
  { label: 'Check Eligibility', icon: CheckCircle, id: 'eligibility' },
  { label: 'AI Assistant', icon: Cpu, id: 'ai' },
  { label: 'My Documents', icon: FileText, id: 'documents' },
  { label: 'Notifications', icon: Bell, id: 'notifications' },
  { label: 'Profile', icon: User, id: 'profile' },
  { label: 'Settings', icon: Settings, id: 'settings' }
]

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme()
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const mainRef = useRef<HTMLDivElement>(null)

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('English')

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date())

  // Auto scroll main container to top smoothly on section redirect/tab change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activeTab])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const isDark = theme === 'dark'

  return (
    <div
      className={`min-h-screen flex flex-col h-screen overflow-hidden relative transition-colors duration-500 font-sans ${isDark ? 'bg-[#08131F] text-white' : 'bg-[#FAF7F2] text-[#17324D]'
        }`}
    >
      {/* ==================== Layered Ambient Background & Neural Mesh ==================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Layer 1: Radial Light Mesh (Only active in dark mode) */}
        {isDark && <div className="absolute inset-0 bg-mesh-civic-dark opacity-90" />}

        {/* Layer 4: Horizontal & Vertical Blueprint Grid Lines (Light Yellow / Gold in Light Mode) */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            opacity: isDark ? 0.035 : 0.25,
            backgroundImage: `linear-gradient(${isDark ? '#FFFFFF' : '#D4A537'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#FFFFFF' : '#D4A537'} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Layer 3: High-Visibility Curved AI Network & Design Lines (Light Yellow / Gold in Light Mode) */}
        <svg className={`absolute inset-0 w-full h-full stroke-current ${isDark ? 'opacity-20 text-white' : 'opacity-40 text-[#D4A537]'
          }`} fill="none">
          <path d="M-100,250 Q450,80 900,420 T1900,280" strokeWidth="2" />
          <path d="M-100,550 Q600,320 1200,620 T2000,420" strokeWidth="2" />
          <path d="M-100,150 Q750,450 1500,200 T2200,500" strokeWidth="1.5" strokeDasharray="6 6" className="animate-pulse" />
          <circle cx="450" cy="150" r="5" className="fill-[#D4A537] animate-ping-slow" />
          <circle cx="900" cy="420" r="6" className="fill-[#E7C66B] animate-ping-slow" />
          <circle cx="1200" cy="620" r="5" className="fill-[#D4A537] animate-ping-slow" />
        </svg>

        {/* Layer 2: Animated Canvas Particles with Network Lines (Pure Black in Light Mode) */}
        <AuthParticles dark={isDark} />
      </div>

      {/* ==================== Main Core Dashboard Outer Shell ==================== */}
      <div className="flex-1 flex z-10 relative w-full h-screen overflow-hidden">

        {/* ==================== 1. SIDEBAR (PERMANENT FIXED, ZERO SCROLL) ==================== */}
        <aside
          className={`fixed top-0 left-0 bottom-0 h-screen z-30 flex flex-col justify-between p-5 select-none border-r backdrop-blur-2xl transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-[80px]' : 'w-[320px]'
            } ${isDark
              ? 'bg-[#08131F]/95 border-slate-800/80 shadow-2xl'
              : 'bg-[#F5E6CA]/95 border-[#D4A537]/40 shadow-xl shadow-[#D4A537]/15'
            }`}
        >
          <div className="space-y-6">

            {/* TOP CONTROL ICONS BAR (Minimize/Expand & Theme Toggle) */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D4A537]/30 dark:border-slate-800">
              {/* Minimize/Expand Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    : 'bg-[#EEDCAE] border-[#D4A537]/40 text-[#17324D] hover:bg-[#E4CE98] shadow-xs'
                  }`}
                title={isSidebarCollapsed ? 'Expand Left Navbar' : 'Minimize Left Navbar'}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4.5 h-4.5 text-[#00B87C]" />
                ) : (
                  <PanelLeftClose className="w-4.5 h-4.5 text-[#00B87C]" />
                )}
              </motion.button>

              {!isSidebarCollapsed && (
                <div className="flex items-center gap-2">
                  {/* Single Theme Toggle at Top */}
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTheme}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${isDark
                        ? 'bg-slate-900 border-slate-800 text-[#E7C66B] hover:bg-slate-800'
                        : 'bg-[#EEDCAE] border-[#D4A537]/40 text-[#17324D] hover:bg-[#E4CE98] shadow-xs'
                      }`}
                    title="Switch Light/Dark Mode"
                  >
                    {isDark ? <Sun className="w-4.5 h-4.5 text-[#E7C66B]" /> : <Moon className="w-4.5 h-4.5 text-[#17324D]" />}
                  </motion.button>
                </div>
              )}
            </div>

            {/* Navigation Items (Distinct Sleek Icon Badges for Minimized Mode & Smooth LayoutId Green Pill for Expanded Mode) */}
            <nav className="space-y-2 pt-1" aria-label="Dashboard Navigation">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = activeTab === item.id

                if (isSidebarCollapsed) {
                  // Minimized Sidebar Navigation Item
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      title={item.label}
                      className="w-full flex items-center justify-center py-1.5 relative cursor-pointer select-none"
                    >
                      {/* Active Left Accent Line */}
                      {active && (
                        <motion.div
                          layoutId="collapsedActiveBar"
                          className="w-1 h-6 bg-[#00B87C] rounded-r-full absolute left-0 shadow-xs z-20"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}

                      {/* Active Highlighted Icon Badge */}
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 relative z-10 ${active
                          ? 'bg-gradient-to-tr from-[#00B87C] to-[#0F766E] text-white shadow-md shadow-[#00B87C]/35 scale-105'
                          : isDark
                            ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                            : 'bg-slate-100/80 text-[#17324D] hover:bg-[#DDFBF2] hover:text-[#00B87C] shadow-xs'
                        }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                    </motion.button>
                  )
                }

                // Expanded Sidebar Navigation Item
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-colors cursor-pointer relative z-10 select-none"
                  >
                    {/* Smooth Framer Motion Active Green Pill */}
                    {active && (
                      <motion.div
                        layoutId="sidebarActivePill"
                        className="absolute inset-0 bg-gradient-to-r from-[#00B87C] to-[#0F766E] rounded-2xl shadow-md shadow-[#00B87C]/30 z-0"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}

                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${active
                          ? 'bg-white/20 text-white'
                          : isDark
                            ? 'bg-slate-800 text-slate-200'
                            : 'bg-slate-100 text-[#17324D]'
                        }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`tracking-tight font-black ${active
                          ? 'text-white'
                          : isDark
                            ? 'text-slate-200 hover:text-white'
                            : 'text-[#17324D] hover:text-[#00B87C]'
                        }`}>
                        {item.label}
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </nav>
          </div>

          {/* ==================== BOTTOM PINNED SECTION OF SIDEBAR ==================== */}
          <div className="space-y-3 pt-4 border-t border-[#F3E8D2] dark:border-slate-800 mt-auto">

            {/* USER PROFILE INFO CARD (Black Name Text & Blue ID in Light Theme with Elegant Card Background) */}
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className={`rounded-2xl border transition-all duration-300 ${isSidebarCollapsed ? 'p-2 flex justify-center border-transparent bg-transparent' : 'p-3.5'
                } ${!isSidebarCollapsed
                  ? isDark
                    ? 'bg-slate-900/90 border-slate-800 text-white shadow-lg'
                    : 'bg-[#EEDCAE] border-[#D4A537]/40 shadow-xs'
                  : ''
                }`}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="relative shrink-0 cursor-pointer"
                  title={`${profile?.fullName || 'Harsha'} (ID: ${profile?.uid ? `CS-${profile.uid.slice(0, 6).toUpperCase()}` : 'CS-80FCRR'})`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00B87C] via-[#D4A537] to-[#0F766E] p-[2px] shadow-sm flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#17324D] flex items-center justify-center font-black text-xs text-white">
                      {(profile?.fullName || 'Harsha').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00B87C] border-2 border-white dark:border-slate-900 rounded-full" />
                </motion.div>

                {!isSidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{ color: isDark ? '#FFFFFF' : '#000000' }}
                        className="text-xs font-black truncate tracking-tight"
                      >
                        {profile?.fullName || 'Harsha'}
                      </span>
                      <span className="w-3.5 h-3.5 bg-[#00B87C] text-white rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 shadow-xs">✔</span>
                    </div>
                    <span
                      style={{ color: isDark ? '#93C5FD' : '#1E40AF' }}
                      className="block text-[10.5px] font-extrabold tracking-wider truncate mt-0.5"
                    >
                      ID: {profile?.uid ? `CS-${profile.uid.slice(0, 6).toUpperCase()}` : 'CS-80FCRR'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* LOG OUT BUTTON (Ultra-Modern Interactive Crimson Motion Button) */}
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={async () => {
                try {
                  await logout()
                  navigate('/')
                } catch (e) {
                  console.error(e)
                }
              }}
              className={`w-full flex items-center group transition-all duration-300 cursor-pointer relative overflow-hidden ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-center gap-2.5 px-4 py-2.5'
                } rounded-2xl text-xs font-black border shadow-xs ${isDark
                  ? 'bg-red-950/40 border-red-900/60 text-red-400 hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-600/30'
                  : 'bg-red-50/90 border-red-200/80 text-red-600 hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 hover:text-white hover:border-red-600 hover:shadow-lg hover:shadow-red-500/30'
                }`}
              title="Log Out"
            >
              {/* Light Sweep Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              <LogOut className="w-4 h-4 transition-all duration-300 group-hover:-translate-x-1 group-hover:scale-110 shrink-0" />
              {!isSidebarCollapsed && (
                <span className="tracking-tight font-black transition-colors duration-300">Log Out</span>
              )}
            </motion.button>

          </div>

        </aside>

        {/* ==================== 2. MAIN DASHBOARD VIEWPORT (SINGLE SEAMLESS SCROLL) ==================== */}
        <main
          ref={mainRef}
          className={`flex-1 flex flex-col h-screen overflow-y-auto relative transition-all duration-300 ${isSidebarCollapsed ? 'ml-[80px]' : 'ml-[320px]'
            }`}
        >

          {/* 5. TOP NAVIGATION BAR (Sticky Floating Glass) */}
          <header className={`sticky top-0 h-16 border-b backdrop-blur-xl px-8 flex items-center justify-between shrink-0 select-none z-20 transition-colors ${isDark ? 'bg-[#08131F]/85 border-slate-800' : 'bg-[#F5E6CA]/95 border-[#D4A537]/40 shadow-sm'
            }`}>
            {/* Left Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg border border-[#D4A537]/40 dark:border-slate-800 text-[#17324D] dark:text-slate-200 hover:bg-[#EEDCAE] dark:hover:bg-slate-900 transition-all cursor-pointer md:hidden"
                title="Toggle Sidebar"
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-3">
                {/* Landing Page Official CivicSphere Emblem Logo */}
                <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center">
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

                <span
                  style={{ color: isDark ? '#FFFFFF' : '#000000' }}
                  className="text-lg font-black tracking-tight"
                >
                  Civic<span className="text-[#16A34A]">Sphere</span>
                </span>
              </div>
            </div>

            {/* Middle Search Input with AI Sparkle & Voice Search */}
            <div className="hidden md:flex items-center relative w-80">
              <Sparkles className="w-4 h-4 text-[#00B87C] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Ask AI search or type scheme name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full h-9 pl-9 pr-14 text-xs font-black rounded-full border transition-all outline-none ${isDark
                    ? 'bg-slate-900/80 border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00B87C]'
                    : 'bg-[#EEDCAE] border-[#D4A537]/50 text-[#17324D] placeholder-slate-600 focus:ring-2 focus:ring-[#00B87C] shadow-xs'
                  }`}
              />
              <button className="absolute right-8 p-1 text-slate-600 hover:text-[#00B87C]" title="Voice Search">
                <Mic className="w-3.5 h-3.5" />
              </button>
              <kbd className="absolute right-2 text-[9px] font-black text-[#17324D] bg-[#E4CE98] dark:bg-slate-800 dark:text-slate-300 px-1.5 py-0.5 rounded border border-[#D4A537]/40 dark:border-slate-700">
                ⌘K
              </kbd>
            </div>

            {/* Right Header Badges */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className={`h-8 px-3 pr-6 text-xs font-black rounded-full border outline-none cursor-pointer appearance-none ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-[#EEDCAE] border-[#D4A537]/50 text-[#17324D] shadow-xs'
                    }`}
                >
                  <option>English</option>
                  <option>Telugu</option>
                  <option>Hindi</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-600 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Real-time Clock */}
              <div className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-black ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-[#EEDCAE] border-[#D4A537]/50 text-[#17324D] shadow-xs'
                }`}>
                <Clock className="w-3.5 h-3.5 text-[#00B87C]" />
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Notification Quick Bell */}
              <button
                onClick={() => setActiveTab('notifications')}
                className={`relative p-2 rounded-full border transition-all cursor-pointer ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-[#EEDCAE] border-[#D4A537]/50 text-[#17324D] hover:bg-[#E4CE98] shadow-xs'
                  }`}
              >
                <Bell className="w-4 h-4 text-[#17324D] dark:text-white" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#D4A537] rounded-full ring-2 ring-white dark:ring-slate-900" />
              </button>
            </div>
          </header>

          {/* Scrollable Center Content Container (12-Column Responsive Grid with Large 28-36px Spacing) */}
          <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">

            <AnimatePresence mode="wait">
              {/* ==================== TAB 1: HOME DASHBOARD ==================== */}
              {activeTab === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="space-y-6"
                >
                  {/* Top Section Banner (Welcome message with user's name, occupation, state, language, profile completion) */}
                  <div className={`relative overflow-hidden p-8 sm:p-10 rounded-[32px] border transition-all min-h-[220px] flex items-center ${isDark
                      ? 'bg-gradient-to-r from-[#08131F] via-[#0F766E]/30 to-[#08131F] border-slate-800 shadow-2xl'
                      : 'bg-white/90 border-[#F3E8D2] shadow-xl shadow-[#17324D]/05'
                    }`}>
                    {/* Background Lighting Aura */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#DDFBF2] via-[#E7C66B]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center w-full">
                      {/* LEFT SIDE: Welcome Message + User Profile Metadata Pills */}
                      <div className="md:col-span-7 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DDFBF2] border border-[#00B87C]/30 text-[#0F766E] text-xs font-black">
                          <Sparkles className="w-3.5 h-3.5 text-[#00B87C]" />
                          <span>AI Citizen Match Engine Active</span>
                        </div>

                        {/* Welcome Message with User's Name */}
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                          Good Morning, <span className="bg-gradient-to-r from-[#00B87C] via-[#17324D] to-[#D4A537] bg-clip-text text-transparent">{profile?.fullName || 'Harsha'}</span> 👋
                        </h2>

                        {/* User Metadata: Occupation, State, Language */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F9F7F2] dark:bg-slate-900 border border-[#F3E8D2] dark:border-slate-800 text-xs font-black shadow-xs">
                            <Briefcase className="w-3.5 h-3.5 text-[#00B87C]" />
                            <span className="text-slate-400 font-medium">Occupation:</span>
                            <span className="text-[#17324D] dark:text-white">{profile?.occupation || 'Agriculture / Farmer'}</span>
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F9F7F2] dark:bg-slate-900 border border-[#F3E8D2] dark:border-slate-800 text-xs font-black shadow-xs">
                            <MapPin className="w-3.5 h-3.5 text-[#D4A537]" />
                            <span className="text-slate-400 font-medium">State:</span>
                            <span className="text-[#17324D] dark:text-white">{profile?.state || 'Telangana'}</span>
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F9F7F2] dark:bg-slate-900 border border-[#F3E8D2] dark:border-slate-800 text-xs font-black shadow-xs">
                            <Globe className="w-3.5 h-3.5 text-[#0F766E]" />
                            <span className="text-slate-400 font-medium">Language:</span>
                            <span className="text-[#17324D] dark:text-white">{profile?.language || selectedLanguage || 'English'}</span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT SIDE: Profile Completion Percentage Card */}
                      <div className="md:col-span-5">
                        <div className={`p-5 rounded-[24px] border space-y-3 relative ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-[#F9F7F2]/90 border-[#F3E8D2] shadow-md'
                          }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-[#00B87C]" />
                              <span className="text-xs font-black text-[#17324D] dark:text-white">Profile Completion</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#DDFBF2] text-[#0F766E] border border-[#00B87C]/30">
                              85% Complete
                            </span>
                          </div>

                          <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-[#F3E8D2] dark:border-slate-700">
                            <div
                              className="h-full bg-gradient-to-r from-[#00B87C] via-[#0F766E] to-[#D4A537] rounded-full transition-all duration-1000 shadow-sm"
                              style={{ width: '85%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 2: EXPLORE SCHEMES ==================== */}
              {activeTab === 'explore' && (
                <motion.div
                  key="explore"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-black text-[#17324D] dark:text-white">Explore Schemes</h2>
                    <p className="text-xs text-[#0F766E] dark:text-[#E7C66B] font-black">Browse schemes</p>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 3: CHECK ELIGIBILITY ==================== */}
              {activeTab === 'eligibility' && (
                <motion.div
                  key="eligibility"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-black text-[#17324D] dark:text-white">Check Eligibility</h2>
                    <p className="text-xs text-[#0F766E] dark:text-[#E7C66B] font-black">Eligibility engine</p>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 4: AI ASSISTANT ==================== */}
              {activeTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-black text-[#17324D] dark:text-white">AI Assistant</h2>
                    <p className="text-xs text-[#0F766E] dark:text-[#E7C66B] font-black">Chatbot powered by RAG</p>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 5: MY DOCUMENTS ==================== */}
              {activeTab === 'documents' && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-black text-[#17324D] dark:text-white">My Documents</h2>
                    <p className="text-xs text-[#0F766E] dark:text-[#E7C66B] font-black">Document explanations</p>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 6: NOTIFICATIONS ==================== */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-black text-[#17324D] dark:text-white">Notifications</h2>
                    <p className="text-xs text-[#0F766E] dark:text-[#E7C66B] font-black">Scheme alerts</p>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 7: PROFILE ==================== */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-black text-[#17324D] dark:text-white">Profile</h2>
                    <p className="text-xs text-[#0F766E] dark:text-[#E7C66B] font-black">User information</p>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 8: SETTINGS ==================== */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-black text-[#17324D] dark:text-white">Settings</h2>
                    <p className="text-xs text-[#0F766E] dark:text-[#E7C66B] font-black">Language / preferences</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>

      </div>

      {/* ==================== 12. FLOATING AI ASSISTANT ORB (Bottom Right) ==================== */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setActiveTab('ai')}
          className="relative group p-4 rounded-full bg-gradient-to-tr from-[#00B87C] via-[#0F766E] to-[#D4A537] text-white shadow-2xl shadow-[#00B87C]/40 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
          title="Open AI Assistant Orb"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#D4A537] rounded-full border-2 border-white animate-ping" />
        </button>
      </div>

    </div>
  )
}