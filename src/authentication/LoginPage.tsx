import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, Cpu, Sparkles, TrendingUp, Check, ShieldCheck
} from 'lucide-react'
import AuthNavbar from './AuthNavbar'
import AuthParticles from './AuthParticles'
import { useAuth } from '../firebase/useAuth'
import { useTheme } from '../context/ThemeContext'

export default function LoginPage() {
  const { theme } = useTheme()
  const { login, googleLogin, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [activeNavTab, setActiveNavTab] = useState<'overview' | 'schemes' | 'analytics'>('overview')
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX - window.innerWidth / 2) / 50
    const y = (e.clientY - window.innerHeight / 2) / 50
    setMousePos({ x, y })
  }

  const validate = () => {
    const errs: { email?: string; password?: string } = {}
    if (!email) errs.email = 'Email address is required.'
    else if (!email.includes('@')) errs.email = 'Please enter a valid email.'
    if (!password) errs.password = 'Password is required.'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err: any) {
      console.error(err)
      setErrors({ form: err.message || 'Failed to authenticate login credentials.' })
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
        staggerChildren: 0.08,
      },
    },
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen w-full flex flex-col justify-between select-none relative overflow-x-hidden font-sans transition-colors duration-500 ease-in-out ${
        isDark ? 'bg-[#09090B] text-white' : 'bg-[#F8F7F2] text-slate-900'
      }`}
    >
      <AuthNavbar />

      {/* Main 50/50 Split Screen Content Container */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-screen pt-16">
        
        {/* ==================== LEFT PANEL: SAAS DASHBOARD PREVIEW (50%) ==================== */}
        <div className="lg:w-[50%] w-full flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-gradient-to-br from-[#8B5CF6]/20 via-[#D946EF]/15 to-[#3B82F6]/25 dark:from-[#1E1B4B] dark:via-[#311042] dark:to-[#0F172A]">
          {/* Neural Mesh Particles Canvas */}
          <AuthParticles dark={isDark} />

          {/* Animated Ambient Radial Lighting & Glowing Blobs */}
          <div
            style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
            className="absolute top-10 left-10 w-96 h-96 rounded-full bg-purple-500/20 blur-[120px] pointer-events-none animate-pulse"
          />
          <div
            style={{ transform: `translate(${-mousePos.x * 0.4}px, ${-mousePos.y * 0.4}px)` }}
            className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none animate-pulse"
          />

          {/* Floating Benefit Holographic Chips around Card */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 1, -1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
            className="absolute top-12 right-12 hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 backdrop-blur-md text-[11px] font-black shadow-lg z-20"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            PM-Kisan Matched (₹6,000/yr)
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0], rotate: [0, -1, 1, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{ transform: `translate(${-mousePos.x * 0.4}px, ${-mousePos.y * 0.4}px)` }}
            className="absolute bottom-16 left-12 hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 backdrop-blur-md text-[11px] font-black shadow-lg z-20"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Ayushman Bharat Verified
          </motion.div>

          {/* Floating SaaS Dashboard Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ transform: `translate3d(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px, 0)` }}
            className="w-full max-w-[620px] rounded-3xl bg-[#121215] border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.6)] overflow-hidden text-slate-200 z-10 relative group"
          >
            {/* Continuous Animated Flowing Border Beam */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 animate-border-flow" />

            {/* AI Vertical Laser Beam Overlay */}
            <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan pointer-events-none z-20" />

            {/* Window Top Controls & Header */}
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/40 relative z-30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-xs font-bold text-slate-400">CivicSphere AI Portal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Engine
                </span>
              </div>
            </div>

            {/* Dashboard Inner Body */}
            <div className="p-6 flex gap-5 relative z-30">
              {/* Mini Left Sidebar */}
              <div className="w-36 hidden sm:flex flex-col justify-between border-r border-white/10 pr-4 space-y-4 text-xs font-medium text-slate-400">
                <div className="space-y-1.5">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Navigation</div>
                  <button
                    onClick={() => setActiveNavTab('overview')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeNavTab === 'overview'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeNavTab === 'overview' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} /> Overview
                  </button>

                  <button
                    onClick={() => setActiveNavTab('schemes')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeNavTab === 'schemes'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeNavTab === 'schemes' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} /> Welfare Schemes
                  </button>

                  <button
                    onClick={() => setActiveNavTab('analytics')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeNavTab === 'analytics'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeNavTab === 'analytics' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} /> Analytics
                  </button>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Status</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> System Active
                  </div>
                </div>
              </div>

              {/* Main Content Dashboard Grid with Tab Switching */}
              <div className="flex-1 space-y-4">
                <AnimatePresence mode="wait">
                  {activeNavTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                      {/* Header Title & Action Button */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-black text-white font-heading">Overview</h4>
                          <p className="text-xs text-slate-400 font-medium">Real-time citizen benefit tracking</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-slate-950" />
                          Transfer & Withdraw
                        </motion.button>
                      </div>

                      {/* Available Balance Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#18181B] border border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Available Benefits Balance</span>
                          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                            ₹78,000<span className="text-sm font-bold text-slate-400">.00</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">Ready for disbursement</span>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>

                      {/* 4 Analytics Grid Widgets */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Matched Today</span>
                          <span className="text-base font-black text-white mt-0.5 block">4</span>
                          <span className="text-[9px] text-emerald-400 font-bold">+100%</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[9px] font-black uppercase text-slate-400 block">This Month</span>
                          <span className="text-base font-black text-white mt-0.5 block">12</span>
                          <span className="text-[9px] text-emerald-400 font-bold">Verified</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[9px] font-black uppercase text-slate-400 block">All Time</span>
                          <span className="text-base font-black text-white mt-0.5 block">28</span>
                          <span className="text-[9px] text-blue-400 font-bold">Approved</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Net Earnings</span>
                          <span className="text-base font-black text-white mt-0.5 block">₹78,000</span>
                          <span className="text-[9px] text-slate-400 font-bold">After fees</span>
                        </div>
                      </div>

                      {/* Recent Transactions List */}
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                          <span>Recent Welfare Disbursements</span>
                          <span className="text-[10px] text-emerald-400 cursor-pointer">View all</span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <div>
                              <div className="font-extrabold text-white text-[11px]">PM Surya Ghar Solar Subsidy</div>
                              <div className="text-[9.5px] text-slate-400">Today, 04:09 PM</div>
                            </div>
                          </div>
                          <span className="font-black text-emerald-400 text-xs">+₹78,000.00</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeNavTab === 'schemes' && (
                    <motion.div key="schemes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-white font-heading">Verified Welfare Schemes</h4>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">4 Active Matches</span>
                      </div>

                      <div className="space-y-2">
                        {[
                          { title: 'PM-Kisan Samman Nidhi', amt: '₹6,000/yr', badge: 'Active' },
                          { title: 'Ayushman Bharat PM-JAY', amt: '₹5,000,000 Limit', badge: 'Verified' },
                          { title: 'PM Fasal Bima Yojana', amt: 'Crop Covered', badge: 'Approved' },
                          { title: 'Atal Pension Yojana', amt: 'Monthly Pension', badge: 'Enrolled' },
                        ].map((s, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-black text-white">{s.title}</div>
                              <div className="text-[10px] text-emerald-400 font-bold">{s.amt}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {s.badge}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeNavTab === 'analytics' && (
                    <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                      <h4 className="text-base font-black text-white font-heading">Disbursement Performance</h4>

                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold">Verification Speed</span>
                          <span className="text-emerald-400 font-black">99.98% Instant</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="w-[98%] h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full animate-pulse" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center pt-1">
                          <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                            <span className="text-base font-black text-cyan-400">12ms</span>
                            <span className="text-[9px] text-slate-400 font-bold block">AI Latency</span>
                          </div>
                          <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                            <span className="text-base font-black text-emerald-400">100%</span>
                            <span className="text-[9px] text-slate-400 font-bold block">Encryption</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ==================== RIGHT PANEL: MINIMALIST SAAS LOGIN FORM (50%) ==================== */}
        <div
          className={`lg:w-[50%] w-full flex items-center justify-center p-6 sm:p-12 z-10 relative overflow-hidden ${
            isDark ? 'bg-[#09090B]' : 'bg-[#F8F7F2]'
          }`}
        >
          {/* Animated Particles & Glow Blobs on Right Side */}
          <AuthParticles dark={isDark} />

          <div
            style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
            className={`absolute top-20 right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none ${
              isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/15'
            }`}
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[400px] space-y-6 z-10 relative"
          >
            {/* Top Brand Tag Header */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
                ▲
              </div>
              <span
                className={`text-lg font-black tracking-tight font-heading ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                CivicSphere
              </span>
            </div>

            {/* Main Welcome Heading - 100% BLACK ON LIGHT MODE */}
            <div>
              <h1
                className={`text-3xl sm:text-4xl font-black tracking-tight font-heading ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Welcome back
              </h1>
            </div>

            {/* Error Banner */}
            {errors.form && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black"
              >
                {errors.form}
              </motion.div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* EMAIL FIELD */}
              <div>
                <label
                  className={`block text-[11px] font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-slate-300' : 'text-slate-900'
                  }`}
                >
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className={`w-full h-12 px-4 rounded-xl text-sm font-bold border transition-all outline-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 shadow-xs'
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-black">{errors.email}</p>}
              </div>

              {/* PASSWORD FIELD */}
              <div>
                <label
                  className={`block text-[11px] font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-slate-300' : 'text-slate-900'
                  }`}
                >
                  PASSWORD
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={`w-full h-12 px-4 pr-11 rounded-xl text-sm font-bold border transition-all outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 shadow-xs'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 text-slate-500 hover:text-slate-950 dark:hover:text-white cursor-pointer transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-black">{errors.password}</p>}

                {/* Reset Password Right Aligned Link */}
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className={`text-xs font-black transition-colors cursor-pointer ${
                      isDark ? 'text-slate-300 hover:text-white' : 'text-slate-900 hover:text-black underline'
                    }`}
                  >
                    Reset password
                  </button>
                </div>
              </div>

              {/* Continue Solid Primary Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading || success}
                className={`w-full h-12 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isDark
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : 'bg-[#111111] hover:bg-black text-white'
                } disabled:opacity-75`}
              >
                {loading ? (
                  <span className="flex items-center gap-2 font-black">
                    <Cpu className="w-4 h-4 animate-spin" /> Verifying…
                  </span>
                ) : success ? (
                  <span className="flex items-center gap-2 font-black">
                    <Check className="w-4 h-4" /> Success
                  </span>
                ) : (
                  <span className="font-black">Continue</span>
                )}
              </motion.button>
            </form>

            {/* Minimalist Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full h-[1px] ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} />
              </div>
              <div
                className={`relative px-3 text-[10px] font-black uppercase tracking-widest ${
                  isDark ? 'bg-[#09090B] text-slate-400' : 'bg-[#F8F7F2] text-slate-700'
                }`}
              >
                OR
              </div>
            </div>

            {/* Single Social Authentication Pill: Continue with Google */}
            <div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={async () => {
                  setGoogleLoading(true)
                  try {
                    await googleLogin()
                    navigate('/dashboard')
                  } catch (e) {
                    console.error(e)
                  } finally {
                    setGoogleLoading(false)
                  }
                }}
                className={`w-full h-12 rounded-xl border text-xs sm:text-sm font-black flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                    : 'bg-white border-slate-300 text-slate-950 hover:bg-slate-50'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{googleLoading ? 'Connecting Google SSO…' : 'Continue with Google'}</span>
              </motion.button>
            </div>

            {/* Bottom Footer Navigation Link - 100% BLACK ON LIGHT MODE */}
            <div className="pt-2 text-center">
              <p className={`text-xs font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className={`font-black underline transition-colors ${
                    isDark ? 'text-white hover:text-emerald-400' : 'text-slate-950 hover:text-emerald-600'
                  }`}
                >
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <h3 className="text-lg font-black text-slate-950 dark:text-white font-heading">Reset Password</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-bold">Enter your email to receive a secure recovery link.</p>
              <form onSubmit={async (e) => { e.preventDefault(); if (resetEmail.includes('@')) { await resetPassword(resetEmail); setShowResetModal(false) } }} className="mt-4 space-y-4">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-950 dark:text-white text-sm font-bold outline-none"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 h-10 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-300">Cancel</button>
                  <button type="submit" className="flex-1 h-10 rounded-xl bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-black">Send Reset Link</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
