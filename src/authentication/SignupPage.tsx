import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, Cpu, TrendingUp, Check, MailCheck, ArrowRight,
  ShieldCheck, LockKeyhole, Sparkles
} from 'lucide-react'
import AuthNavbar from './AuthNavbar'
import AuthParticles from './AuthParticles'
import { useAuth } from '../firebase/useAuth'
import { useTheme } from '../context/ThemeContext'

function getPasswordStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500']

export default function SignupPage() {
  const { theme } = useTheme()
  const { googleLogin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const pwdScore = getPasswordStrength(form.password)
  const isDark = theme === 'dark'

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX - window.innerWidth / 2) / 50
    const y = (e.clientY - window.innerHeight / 2) / 50
    setMousePos({ x, y })
  }

  const set = (k: keyof typeof form) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
    if (formError) setFormError('')
  }

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Full Name is required.'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email is required.'
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setFormError('')
    if (!validateForm()) return
    setLoading(true)
    try {
      const response = await axios.post('/api/auth/register', {
        fullName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })

      if (response.data && response.data.success) {
        setSuccessEmail(form.email.trim())
        setSignupSuccess(true)
      } else {
        setFormError(response.data?.message || 'Failed to create account.')
      }
    } catch (err: any) {
      const status = err.response?.status
      const msg = err.response?.data?.message || err.message || 'Failed to create account.'
      if (status === 409 || msg.toLowerCase().includes('already exists')) {
        toast.error('User already exists. Redirecting to login...')
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setFormError(msg)
      }
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
        ease: [0.22, 1, 0.36, 1],
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
          {/* Neural Particles */}
          <AuthParticles dark={isDark} />

          <div
            style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
            className="absolute top-10 left-10 w-96 h-96 rounded-full bg-purple-500/20 blur-[120px] pointer-events-none animate-pulse"
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

          {/* Floating Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ transform: `translate3d(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px, 0)` }}
            className="w-full max-w-[620px] rounded-3xl bg-[#121215] border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.6)] overflow-hidden text-slate-200 z-10 relative group"
          >
            {/* Continuous Flowing Border Beam */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 animate-border-flow" />

            {/* AI Vertical Laser Beam Overlay */}
            <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan pointer-events-none z-20" />

            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/40 relative z-30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-xs font-bold text-slate-400">CivicSphere AI Onboarding</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Instant Verification
              </span>
            </div>

            <div className="p-6 space-y-5 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-white font-heading">Citizen Registration</h4>
                  <p className="text-xs text-slate-400">Instant AI scheme eligibility match</p>
                </div>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} type="button" className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black cursor-pointer shadow-md shadow-emerald-500/20">
                  Create Profile
                </motion.button>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#18181B] border border-white/10 flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Supported Welfare Schemes</span>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                    500+ <span className="text-xs font-bold text-slate-400">State & Central</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <span className="text-base font-black text-emerald-400">99.8%</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Accuracy</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <span className="text-base font-black text-cyan-400">Instant</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Verification</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <span className="text-base font-black text-purple-400">100%</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Encrypted</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ==================== RIGHT PANEL: MINIMALIST SAAS SIGNUP FORM (50%) ==================== */}
        <div className={`lg:w-[50%] w-full flex items-center justify-center p-4 sm:p-8 z-10 relative overflow-hidden ${
          isDark ? 'bg-[#09090B]' : 'bg-[#F8F7F2]'
        }`}>
          {/* Right Side Particles & Glow Blobs */}
          <AuthParticles dark={isDark} />

          <div
            style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
            className={`absolute top-20 right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none ${
              isDark ? 'bg-cyan-500/10' : 'bg-emerald-400/15'
            }`}
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[400px] space-y-4 z-10 relative"
          >
            {/* Top Brand Tag Header */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
                ▲
              </div>
              <span className={`text-base sm:text-lg font-black tracking-tight font-heading ${isDark ? 'text-white' : 'text-slate-950'}`}>
                CivicSphere
              </span>
            </div>

            <AnimatePresence mode="wait">
              {signupSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 text-center py-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                    <MailCheck className="w-6 h-6" />
                  </div>
                  <h2 className={`text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-950'}`}>Verify your email</h2>
                  <p className={`text-xs leading-relaxed font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    We sent a verification link to <strong className={isDark ? 'text-white' : 'text-slate-950'}>{successEmail}</strong>. Please check your inbox.
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full h-12 rounded-xl bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Proceed to Sign In
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3.5">
                  <div>
                    <h1 className={`text-2xl sm:text-3xl font-black tracking-tight font-heading ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      Create your account
                    </h1>
                  </div>

                  {formError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-2.5">
                    {/* FULL NAME */}
                    <div>
                      <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => set('name')(e.target.value)}
                        placeholder="Your full name"
                        required
                        className={`w-full h-10 px-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-all outline-none ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 shadow-xs'
                        }`}
                      />
                      {errors.name && <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-black">{errors.name}</p>}
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                        EMAIL
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set('email')(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className={`w-full h-10 px-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-all outline-none ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 shadow-xs'
                        }`}
                      />
                      {errors.email && <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-black">{errors.email}</p>}
                    </div>

                    {/* PASSWORD */}
                    <div>
                      <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                        PASSWORD
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={form.password}
                          onChange={(e) => set('password')(e.target.value)}
                          placeholder="Create password"
                          required
                          className={`w-full h-10 px-3.5 pr-10 rounded-xl text-xs sm:text-sm font-bold border transition-all outline-none ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 shadow-xs'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 text-slate-500 hover:text-slate-950 dark:hover:text-white cursor-pointer transition-colors"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {form.password && (
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`flex-1 h-1 rounded-full ${i < pwdScore ? strengthColors[pwdScore] : 'bg-slate-200 dark:bg-slate-800'}`} />
                          ))}
                        </div>
                      )}
                      {errors.password && <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-black">{errors.password}</p>}
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div>
                      <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                        CONFIRM PASSWORD
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={form.confirmPassword}
                          onChange={(e) => set('confirmPassword')(e.target.value)}
                          placeholder="Confirm password"
                          required
                          className={`w-full h-10 px-3.5 pr-10 rounded-xl text-xs sm:text-sm font-bold border transition-all outline-none ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 shadow-xs'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 text-slate-500 hover:text-slate-950 dark:hover:text-white cursor-pointer transition-colors"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-black">{errors.confirmPassword}</p>}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className={`w-full h-11 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mt-1 ${
                        isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20' : 'bg-[#111111] hover:bg-black text-white'
                      }`}
                    >
                      {loading ? <Cpu className="w-4 h-4 animate-spin" /> : 'Continue'}
                    </motion.button>
                  </form>

                  {/* FOOTER LINK */}
                  <div className="pt-1 text-center">
                    <p className={`text-xs font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>
                      Already have an account?{' '}
                      <Link to="/login" className={`font-black underline transition-colors ${isDark ? 'text-white hover:text-emerald-400' : 'text-slate-950 hover:text-emerald-600'}`}>
                        Sign in
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
