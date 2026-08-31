import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, BookOpen, CheckCircle, Cpu, FileText, Bell, User, Settings, LogOut,
  Sun, Moon, Shield, ArrowRight
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import AuthParticles from '../authentication/AuthParticles'
import { useAuth } from '../firebase/AuthProvider'

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
  const [activeTab, setActiveTab] = useState('home')

  // Parallax coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const x = (clientX - window.innerWidth / 2) / 60
    const y = (clientY - window.innerHeight / 2) / 60
    setMousePos({ x, y })
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen flex flex-col justify-between overflow-hidden relative transition-colors duration-500 ${
        theme === 'dark' ? 'bg-[#050816] text-white' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Background blobs & grids */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,rgba(167,243,208,0.1)_35%,rgba(191,219,254,0.1)_75%,rgba(248,250,252,1)_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(10,15,35,0.3)_0%,rgba(5,8,22,1)_100%)]" />
        
        {/* Shifting blobs */}
        <div
          style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
          className="absolute top-[5%] left-[5%] w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[130px] transition-transform"
        />
        <div
          style={{ transform: `translate(${-mousePos.x * 0.4}px, ${-mousePos.y * 0.4}px)` }}
          className="absolute bottom-[5%] right-[5%] w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[130px] transition-transform"
        />

        <AuthParticles dark={theme === 'dark'} />
      </div>

      {/* Main Core Dashboard Layout */}
      <div className="flex-1 flex z-10 relative w-full h-screen overflow-hidden">
        
        {/* ==================== LEFT SIDEBAR ==================== */}
        <aside className="w-[280px] bg-white/72 dark:bg-[#0a0f23]/75 backdrop-blur-[24px] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between p-5 shrink-0 select-none">
          <div className="space-y-6">
            
            {/* User Profile Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/85">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-xs">
                  {(profile?.fullName || 'Citizen').charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-slate-850 dark:text-white">
                    {profile?.fullName || 'Citizen'}
                  </span>
                  <span className="w-2.5 h-2.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[7px]">✔</span>
                </div>
                <span className="block text-[9px] text-slate-400 font-extrabold tracking-wider">
                  ID: {profile?.uid ? `CS-${profile.uid.slice(0, 6).toUpperCase()}` : 'CS-GUEST'}
                </span>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                      active
                        ? 'bg-[#00A86B]/10 dark:bg-emerald-500/10 text-[#00A86B] dark:text-[#00D084]'
                        : 'text-[#64748B] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#00A86B] dark:bg-[#00D084] rounded-r"
                      />
                    )}
                    <Icon className={`w-4 h-4 ${active ? 'text-[#00A86B] dark:text-[#00D084]' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Sidebar Footer controls */}
          <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/85">
            <div className="flex items-center justify-between">
              <button onClick={toggleTheme} className="w-8.5 h-8.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 flex items-center justify-center text-slate-500 cursor-pointer">
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={async () => {
                  try {
                    await logout()
                    navigate('/')
                  } catch (e) {
                    console.error(e)
                  }
                }}
                className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[8px] font-extrabold text-[#64748B] dark:text-emerald-400 uppercase tracking-widest">Government Verified</span>
            </div>
          </div>

        </aside>

        {/* ==================== CENTER MAIN CONTAINER ==================== */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top Sticky Header */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-[#050816]/60 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 select-none">
            <div>
              <span className="block text-[9px] text-[#64748B] dark:text-[#CBD5E1] font-bold uppercase tracking-wider">Citizen Platform</span>
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
                Good Morning, {profile?.fullName?.split(' ')[0] || 'Citizen'}
              </h1>
            </div>
          </header>

          {/* Scrollable Center viewport */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-center items-center">

            {/* Welcome wishes banner ONLY */}
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-[28px] bg-white/72 dark:bg-[#0a0f23]/75 border border-slate-200 dark:border-slate-800 text-center max-w-lg shadow-xl"
            >
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#00D084] to-[#2563EB] bg-clip-text text-transparent leading-tight font-heading">
                Good Morning, {profile?.fullName?.split(' ')[0] || 'Citizen'} 👋
              </h2>
              <p className="text-[#64748B] dark:text-[#CBD5E1] text-xs mt-3 leading-relaxed font-semibold">
                Welcome back to your CivicSphere Citizen dashboard. Let's see what matching welfare initiatives are waiting for you today.
              </p>
            </motion.section>

          </div>
        </main>

      </div>

    </div>
  )
}
