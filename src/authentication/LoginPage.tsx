import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, Cpu, Sparkles, Volume2, ArrowRight,
  Building2, Shield, ShieldCheck, Database, CheckCircle
} from 'lucide-react'
import AuthNavbar from './AuthNavbar'
import FloatingInput from './FloatingInput'
import GradientButton from './GradientButton'
import AuthParticles from './AuthParticles'
import { useAuth } from '../firebase/useAuth'
import { useTheme } from '../context/ThemeContext'

const floatingInfoCards = [
  { text: 'PM-Kisan ₹6000', x: '4%', y: '12%', delay: 0.1 },
  { text: 'Ayushman Verified', x: '68%', y: '15%', delay: 0.3 },
  { text: 'Scholarship Approved', x: '6%', y: '80%', delay: 0.5 },
  { text: 'Skill India Training', x: '60%', y: '85%', delay: 0.7 },
  { text: 'Pension Eligible', x: '74%', y: '48%', delay: 0.9 },
]

const conversationScenarios = [
  {
    citizen: 'I am a farmer from Andhra Pradesh. Which schemes am I eligible for?',
    thinking: 'Scanning state & central agricultural database...',
    schemes: [
      { name: 'PM-KISAN', desc: '₹6,000/yr Direct Support', source: 'Central Ministry' },
      { name: 'YSR Rythu Bharosa', desc: 'State Farm Input Subsidy', source: 'AP Agriculture' },
      { name: 'Soil Health Card', desc: 'Diagnostic & Advice', source: 'Ministry of Agriculture' },
      { name: 'PM Fasal Bima', desc: 'Crop Damage Insurance', source: 'Agri Insurance India' },
    ]
  },
  {
    citizen: 'Are there any higher education scholarships for students in Telangana?',
    thinking: 'Matching academic & community scholarships...',
    schemes: [
      { name: 'NSP Scholarships', desc: 'National Scholarship Portal', source: 'Min. of Electronics & IT' },
      { name: 'Telangana ePass', desc: 'Post-Matric Fee Reimbursement', source: 'TS Welfare Dept' },
      { name: 'Central Sector Scheme', desc: 'College/University Support', source: 'Ministry of Education' },
      { name: 'Pragati Scholarship', desc: 'Technical Support for Girls', source: 'AICTE Official' },
    ]
  },
  {
    citizen: 'Looking for family healthcare scheme options. We live in Delhi.',
    thinking: 'Analyzing medical insurance & coverage rules...',
    schemes: [
      { name: 'Ayushman Bharat', desc: '₹5 Lakh Medical Coverage', source: 'National Health Authority' },
      { name: 'PM-JAY Family Card', desc: 'Cashless Hospital Network', source: 'Ministry of Health' },
      { name: 'CGHS Wellness', desc: 'Central Govt Health Network', source: 'CGHS Directorate' },
      { name: 'PM Suraksha Bima', desc: 'Accident Insurance Coverage', source: 'DFS India' },
    ]
  },
]

export default function LoginPage() {
  const { theme } = useTheme()
  const { login, googleLogin, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [typedText, setTypedText] = useState('')

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [chatStep, setChatStep] = useState(0)
  const [typedQuery, setTypedQuery] = useState('')
  const [activeSchemesCount, setActiveSchemesCount] = useState(0)

  const [accuracy, setAccuracy] = useState(0)
  const [rules, setRules] = useState(0)
  const [languages, setLanguages] = useState(0)

  const fullText = 'Welcome back, Citizen.'
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1))
      i++
      if (i >= fullText.length) clearInterval(timer)
    }, 60)
    return () => clearInterval(timer)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX - window.innerWidth / 2) / 60
    const y = (e.clientY - window.innerHeight / 2) / 60
    setMousePos({ x, y })
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const runChatLoop = (index: number) => {
      setScenarioIdx(index)
      setChatStep(0)
      setTypedQuery('')
      setActiveSchemesCount(0)
      const q = conversationScenarios[index].citizen
      let i = 0
      const typeQ = () => {
        if (i < q.length) { setTypedQuery(q.slice(0, ++i)); timer = setTimeout(typeQ, 22) }
        else timer = setTimeout(() => {
          setChatStep(1)
          timer = setTimeout(() => {
            setChatStep(2)
            let c = 0
            const reveal = () => {
              if (c < 4) { setActiveSchemesCount(++c); timer = setTimeout(reveal, 450) }
              else timer = setTimeout(() => runChatLoop((index + 1) % conversationScenarios.length), 4000)
            }
            reveal()
          }, 900)
        }, 700)
      }
      timer = setTimeout(typeQ, 300)
    }
    runChatLoop(0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let f = 0
    const go = () => {
      f++; const p = f / 60
      setAccuracy(parseFloat((p * 99.8).toFixed(1)))
      setRules(Math.min(500, Math.floor(p * 500)))
      setLanguages(Math.min(3, Math.floor(p * 3)))
      if (f < 60) requestAnimationFrame(go)
      else { setAccuracy(99.8); setRules(500); setLanguages(3) }
    }
    requestAnimationFrame(go)
  }, [])

  const validate = () => {
    const e: typeof errors = {}
    if (!email.includes('@')) e.email = 'Enter a valid email address'
    if (password.length < 6) e.password = 'Password must be 6+ characters'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const cardVariants = {
    hidden: (d: number) => ({ opacity: 0, x: d * 35, scale: 0.96 }),
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 90, damping: 18 } }
  }

  const flowItemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 + 0.2, duration: 0.45, ease: 'easeOut' as const } })
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen flex flex-col justify-between overflow-x-hidden relative select-none"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #030712 0%, #081026 40%, #051329 70%, #020614 100%)'
          : 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 25%, #E0F2FE 55%, #DCFCE7 80%, #E2E8F0 100%)',
      }}
    >
      <AuthNavbar />

      {/* ========== RICH ATMOSPHERIC BACKGROUND ========== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated ambient mesh blobs */}
        <div style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
          className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-[130px] animate-blob" />
        <div style={{ transform: `translate(${-mousePos.x * 0.4}px, ${-mousePos.y * 0.4}px)` }}
          className="absolute top-[25%] -right-32 w-[500px] h-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[130px] animate-blob animation-delay-2000" />
        <div style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
          className="absolute -bottom-32 left-[25%] w-[520px] h-[520px] rounded-full bg-indigo-400/15 dark:bg-purple-600/10 blur-[130px] animate-blob animation-delay-4000" />

        {/* Blueprint grid overlay */}
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
          }}
        />

        {/* Subtle Ashoka Orbit Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-slate-900/[0.05] dark:border-white/[0.02] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-dashed border-emerald-600/[0.1] dark:border-emerald-400/[0.04] animate-spin-slow pointer-events-none" />

        {/* Floating Government Tech Icons (Light mode) */}
        {!isDark && (
          <>
            <div className="absolute top-[16%] left-[7%] opacity-[0.08] text-slate-800 animate-float-slow pointer-events-none">
              <Building2 className="w-20 h-20 stroke-[1]" />
            </div>
            <div className="absolute bottom-[16%] left-[44%] opacity-[0.07] text-slate-800 animate-float pointer-events-none">
              <Shield className="w-24 h-24 stroke-[1]" />
            </div>
            <div className="absolute top-[12%] right-[38%] opacity-[0.08] text-emerald-800 animate-float-slow pointer-events-none">
              <Sparkles className="w-16 h-16 stroke-[1]" />
            </div>
          </>
        )}

        <AuthParticles dark={isDark} />
      </div>

      {/* ========== MAIN CONTENT CONTAINER ========== */}
      <div className="flex-1 flex items-center justify-center relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8 items-center justify-center">

          {/* ==================== LEFT SIDE: AI PORTAL SHOWCASE ==================== */}
          <motion.div
            custom={-1} variants={cardVariants} initial="hidden" animate="visible"
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className={`lg:w-[50%] w-full flex flex-col justify-between p-6 sm:p-7 rounded-[28px] relative overflow-hidden transition-all duration-300 ${
              isDark
                ? 'bg-[#081224]/85 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40'
                : 'bg-gradient-to-br from-[#F8FAFC]/95 via-[#F1F5F9]/95 to-[#ECFDF5]/95 backdrop-blur-2xl border border-slate-300/80 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.14)] hover:shadow-[0_25px_60px_-10px_rgba(16,185,129,0.2)]'
            }`}
          >
            {/* Soft inner greenish corner glow */}
            {!isDark && (
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
            )}

            {/* Top gradient highlight beam */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 rounded-t-[28px] overflow-hidden z-20">
              <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                className="w-1/2 h-full bg-white/60 dark:bg-emerald-400/60 absolute top-0" />
            </div>

            {/* Header badge */}
            <div className="flex items-center justify-between z-10 relative">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span className={`text-[11px] font-black uppercase tracking-widest font-heading ${isDark ? 'text-emerald-400' : 'text-slate-900'}`}>
                  CivicSphere AI Portal
                </span>
              </div>
              <span className={`text-[9.5px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                isDark ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/25' : 'text-emerald-900 bg-emerald-500/20 border border-emerald-500/35 shadow-xs'
              }`}>
                Direct Govt Match
              </span>
            </div>

            {/* AI Assistant Chat Panel */}
            <div className="relative flex items-center justify-center w-full z-10 py-5 my-auto">
              <motion.div
                style={{ x: mousePos.x * 0.3, y: mousePos.y * 0.3 }}
                className={`w-full max-w-[380px] rounded-[24px] p-5 relative overflow-hidden transition-all duration-300 ${
                  isDark
                    ? 'bg-[#091329]/90 backdrop-blur-2xl border border-white/10 shadow-2xl'
                    : 'bg-gradient-to-b from-white to-[#F0FDF4] backdrop-blur-2xl border border-emerald-200/90 shadow-lg shadow-emerald-500/5'
                }`}
              >
                {/* Chat Header */}
                <div className={`flex items-center justify-between pb-3 mb-3 border-b ${isDark ? 'border-slate-800' : 'border-emerald-200/80'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className={`text-[11px] font-black uppercase tracking-wider font-heading ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      CivicSphere AI Engine
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded border ${
                      isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' : 'text-emerald-800 bg-emerald-100/90 border border-emerald-300'
                    }`}>Govt Verified</span>
                  </div>
                </div>

                {/* Animated Chat Viewport */}
                <div className="space-y-3 min-h-[185px] flex flex-col justify-end">
                  {typedQuery && (
                    <div className="self-end max-w-[85%] bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-[11px] font-bold px-3.5 py-2.5 rounded-2xl rounded-tr-none shadow-md">
                      {typedQuery}
                    </div>
                  )}

                  {chatStep === 1 && (
                    <div className={`self-start flex items-center gap-2 text-[11px] px-3.5 py-2 rounded-2xl rounded-tl-none border font-bold ${
                      isDark ? 'bg-slate-900/90 border-slate-800 text-emerald-400' : 'bg-slate-100 border border-slate-300 text-slate-800'
                    }`}>
                      <Cpu className="w-4 h-4 animate-spin text-emerald-500" />
                      <span>{conversationScenarios[scenarioIdx].thinking}</span>
                    </div>
                  )}

                  {chatStep === 2 && (
                    <div className="self-start w-full space-y-2">
                      {conversationScenarios[scenarioIdx].schemes.slice(0, activeSchemesCount).map((s) => (
                        <motion.div
                          key={s.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer ${
                            isDark ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white hover:bg-emerald-50/60 border-slate-200/90 text-slate-900 shadow-xs'
                          }`}
                        >
                          <div>
                            <span className="font-extrabold block text-[11px]">{s.name}</span>
                            <span className="text-[9.5px] opacity-75 font-medium">{s.desc}</span>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-400/30">
                            Matched
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Floating Benefit Chips */}
              {floatingInfoCards.map((chip, idx) => (
                <motion.div
                  key={idx}
                  style={{
                    left: chip.x, top: chip.y,
                    x: mousePos.x * (1.1 + idx * 0.08), y: mousePos.y * (1.1 + idx * 0.08)
                  }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: chip.delay }}
                  className={`absolute hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9.5px] font-extrabold cursor-pointer backdrop-blur-md transition-all ${
                    isDark
                      ? 'bg-[#071123]/95 border border-white/12 text-emerald-400 shadow-none'
                      : 'bg-white border border-slate-300/80 text-slate-900 shadow-md shadow-slate-300/50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  {chip.text}
                </motion.div>
              ))}
            </div>

            {/* Bottom Real-Time AI Stats */}
            <div className={`border-t pt-3.5 flex items-center justify-between text-center gap-2 z-10 relative ${
              isDark ? 'border-slate-800' : 'border-slate-300/80'
            }`}>
              <div className="flex-1">
                <span className="block text-base font-black text-emerald-600 dark:text-emerald-400">{accuracy}%</span>
                <span className="block text-[8.5px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider">Match Accuracy</span>
              </div>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-800" />
              <div className="flex-1">
                <span className="block text-base font-black text-blue-600 dark:text-blue-400">{rules}+</span>
                <span className="block text-[8.5px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider">Welfare Rules</span>
              </div>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-800" />
              <div className="flex-1">
                <span className="block text-base font-black text-purple-600 dark:text-purple-400">{languages} Langs</span>
                <span className="block text-[8.5px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider">Supported</span>
              </div>
            </div>
          </motion.div>

          {/* ==================== RIGHT SIDE: AUTHENTICATION CARD ==================== */}
          <div className="lg:w-[50%] w-full flex items-center justify-center z-10">
            <motion.div
              custom={1} variants={cardVariants} initial="hidden" animate="visible"
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className={`w-full max-w-[460px] p-6 sm:p-7 rounded-[28px] relative select-none transition-all duration-300 ${
                isDark
                  ? 'bg-[#081224]/85 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40'
                  : 'bg-gradient-to-br from-[#F8FAFC]/95 via-[#F1F5F9]/95 to-[#ECFDF5]/95 backdrop-blur-2xl border border-slate-300/80 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.14)] hover:shadow-[0_25px_60px_-10px_rgba(37,99,235,0.2)]'
              }`}
            >
              {/* Soft inner greenish corner glow */}
              {!isDark && (
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
              )}

              {/* Top border animated gradient highlight beam */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 rounded-t-[28px] overflow-hidden z-20">
                <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                  className="w-1/2 h-full bg-white/60 dark:bg-emerald-400/60 absolute top-0" />
              </div>

              {/* Header Title with Flow Motion */}
              <motion.div custom={0} variants={flowItemVariants} initial="hidden" animate="visible" className="mb-5">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent leading-tight font-heading">
                  Welcome Back
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-xs mt-1.5 leading-normal font-bold">
                  Secure access to official government welfare services.
                </p>

                {/* Typing welcome cursor */}
                <div className="flex items-center gap-1 mt-2 min-h-[1.25rem]">
                  <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold font-mono">
                    {typedText}
                  </span>
                  {typedText.length < fullText.length && (
                    <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-[2px] h-3.5 bg-emerald-500 inline-block" />
                  )}
                </div>
              </motion.div>

              {/* Form Flow */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <motion.div custom={1} variants={flowItemVariants} initial="hidden" animate="visible">
                  <FloatingInput
                    id="login-email"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    icon={<Mail className="w-4 h-4" />}
                    error={errors.email}
                    required
                    autoComplete="email"
                  />
                </motion.div>

                <motion.div custom={2} variants={flowItemVariants} initial="hidden" animate="visible">
                  <FloatingInput
                    id="login-password"
                    label="Password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    icon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    error={errors.password}
                    required
                    autoComplete="current-password"
                  />
                </motion.div>

                {/* Options Row - VIBRANT EMERALD GREEN REMEMBER ME */}
                <motion.div custom={3} variants={flowItemVariants} initial="hidden" animate="visible" className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="sr-only"
                      />
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          remember
                            ? 'bg-emerald-600 border-emerald-600 shadow-md shadow-emerald-500/30'
                            : isDark ? 'border-emerald-500 bg-slate-900' : 'border-emerald-600 bg-white shadow-xs'
                        }`}
                      >
                        {remember && (
                          <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </motion.div>
                    </div>
                    <span className="text-[#00A86B] dark:text-emerald-400 font-extrabold text-xs sm:text-sm tracking-tight hover:text-emerald-700 transition-colors">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="text-xs font-black text-[#00A86B] dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </motion.div>

                {/* Primary Action Button CTA */}
                <motion.div custom={4} variants={flowItemVariants} initial="hidden" animate="visible" className="pt-1.5">
                  <GradientButton type="submit" loading={loading} success={success}>
                    Login to CivicSphere
                  </GradientButton>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div custom={5} variants={flowItemVariants} initial="hidden" animate="visible" className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300/80 dark:border-slate-800" /></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#F1F5F9] dark:bg-[#081224] px-2.5 text-slate-600 dark:text-slate-400 font-black">Or continue with</span></div>
              </motion.div>

              {/* Google SSO Motion Button */}
              <motion.div custom={6} variants={flowItemVariants} initial="hidden" animate="visible">
                <motion.button
                  type="button"
                  whileHover={{ 
                    scale: 1.02, 
                    y: -2.5, 
                    boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 12px 28px -5px rgba(16, 185, 129, 0.25)' 
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    try {
                      await googleLogin()
                      navigate('/dashboard')
                    } catch (e) { console.error(e) }
                  }}
                  className="relative overflow-hidden w-full h-11 sm:h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-md shadow-slate-200/50 transition-all duration-300 cursor-pointer group/gbtn"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent translate-x-[-150%] group-hover/gbtn:animate-[shimmer_1.2s_infinite]" />
                  <svg className="w-5 h-5 shrink-0 group-hover/gbtn:scale-110 group-hover/gbtn:rotate-6 transition-transform duration-300" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="group-hover/gbtn:text-emerald-700 dark:group-hover/gbtn:text-emerald-400 transition-colors">Google Authentication</span>
                </motion.button>
              </motion.div>

              {/* Security Badges & Footer Switch Link */}
              <motion.div custom={7} variants={flowItemVariants} initial="hidden" animate="visible" className="mt-4 pt-3 border-t border-slate-300/80 dark:border-slate-800 flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-4 text-[10px] font-extrabold text-slate-700 dark:text-slate-400">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Govt Verified</span>
                  <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Firebase Auth</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> DPDP Compliant</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-300 font-bold flex items-center justify-center gap-1 mt-1">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-emerald-700 dark:text-emerald-400 font-black inline-flex items-center gap-0.5 hover:underline">
                    Create Account
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </p>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal Dialog Overlay */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <h3 className="text-lg font-black bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
                Reset Password Link
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold">
                Provide your email address to receive a secure password recovery instruction link from Firebase.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!resetEmail.includes('@')) return;
                  try {
                    await resetPassword(resetEmail);
                    setShowResetModal(false);
                    setResetEmail('');
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="mt-4 space-y-4"
              >
                <FloatingInput
                  id="reset-email"
                  label="Email Address"
                  type="email"
                  value={resetEmail}
                  onChange={setResetEmail}
                  icon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setResetEmail('');
                    }}
                    className="flex-1 h-10 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 text-xs font-bold bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl hover:shadow-lg cursor-pointer"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
