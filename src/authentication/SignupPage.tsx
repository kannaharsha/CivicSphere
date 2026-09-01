import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Lock, Eye, EyeOff, Sparkles,
  Cpu, ArrowRight, AlertCircle, MailCheck,
  Building2, Shield, ShieldCheck, Database, CheckCircle
} from 'lucide-react'
import AuthNavbar from './AuthNavbar'
import FloatingInput from './FloatingInput'
import GradientButton from './GradientButton'
import AuthParticles from './AuthParticles'
import { useTheme } from '../context/ThemeContext'

const floatingBenefitChips = [
  { text: 'PM-KISAN Eligible', x: '5%', y: '10%' },
  { text: 'Ayushman Verified', x: '68%', y: '12%' },
  { text: 'Scholarship Match', x: '4%', y: '82%' },
  { text: 'Pension Approved', x: '72%', y: '48%' },
  { text: 'Skill India Match', x: '62%', y: '84%' },
  { text: 'Income Verified', x: '74%', y: '25%' },
  { text: 'Land Record Linked', x: '35%', y: '4%' },
]

const onboardingScenarios = [
  {
    citizen: "I'm a farmer from Andhra Pradesh. Which schemes am I eligible for?",
    ai: "I found 4 verified schemes matching your profile.",
    schemes: ['PM-Kisan Samman Nidhi', 'YSR Rythu Bharosa', 'Soil Health Card', 'PM Fasal Bima']
  },
  {
    citizen: "I'm a college student in Telangana. Any scholarships available?",
    ai: "I found 3 scholarship programs available for your course.",
    schemes: ['NSP Post-Matric Scholarship', 'Telangana ePass Reimbursement', 'Pragati Technical Support']
  },
  {
    citizen: "Looking for family healthcare coverage options in Delhi.",
    ai: "I matched 3 medical coverage options.",
    schemes: ['Ayushman Bharat PM-JAY', 'Delhi CGHS Network Card', 'PM Suraksha Bima']
  },
  {
    citizen: "Welfare support for a 68-year-old grandfather in Uttar Pradesh.",
    ai: "I matched 3 senior pension and security schemes.",
    schemes: ['IGNOAPS National Pension', 'UP State Senior Pension', 'Atal Pension Yojana']
  }
]

function getPasswordStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']
const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500']

export default function SignupPage() {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [typedWelcome, setTypedWelcome] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')
  const [formError, setFormError] = useState('')
  const navigate = useNavigate()

  // Form States — ONLY Authentication Information
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Onboarding chat timeline states
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [typedCitizenText, setTypedCitizenText] = useState('')
  const [aiTyping, setAiTyping] = useState(false)
  const [typedAiResponse, setTypedAiResponse] = useState('')
  const [revealedSchemesCount, setRevealedSchemesCount] = useState(0)

  // Animated counters on load
  const [accuracy, setAccuracy] = useState(0)
  const [schemesCount, setSchemesCount] = useState(0)
  const [languagesCount, setLanguagesCount] = useState(0)

  const welcomeFullText = "Join CivicSphere Authentication Portal"
  const pwdScore = getPasswordStrength(form.password)
  const isDark = theme === 'dark'

  // Title Welcome Typing
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setTypedWelcome(welcomeFullText.slice(0, i + 1))
      i++
      if (i >= welcomeFullText.length) clearInterval(timer)
    }, 45)
    return () => clearInterval(timer)
  }, [])

  // Auto conversation playback loop for left side AI window
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const playScenario = (index: number) => {
      setScenarioIdx(index)
      setTypedCitizenText('')
      setAiTyping(false)
      setTypedAiResponse('')
      setRevealedSchemesCount(0)

      const sc = onboardingScenarios[index]
      let charIdx = 0

      const typeCitizen = () => {
        if (charIdx < sc.citizen.length) {
          setTypedCitizenText(sc.citizen.slice(0, charIdx + 1))
          charIdx++
          timer = setTimeout(typeCitizen, 22)
        } else {
          timer = setTimeout(() => {
            setAiTyping(true)
            timer = setTimeout(() => {
              setAiTyping(false)
              let aiCharIdx = 0
              const typeAi = () => {
                if (aiCharIdx < sc.ai.length) {
                  setTypedAiResponse(sc.ai.slice(0, aiCharIdx + 1))
                  aiCharIdx++
                  timer = setTimeout(typeAi, 18)
                } else {
                  let sIdx = 0
                  const revealSchemes = () => {
                    if (sIdx < sc.schemes.length) {
                      sIdx++
                      setRevealedSchemesCount(sIdx)
                      timer = setTimeout(revealSchemes, 400)
                    } else {
                      timer = setTimeout(() => {
                        playScenario((index + 1) % onboardingScenarios.length)
                      }, 4500)
                    }
                  }
                  timer = setTimeout(revealSchemes, 400)
                }
              }
              typeAi()
            }, 1000)
          }, 500)
        }
      }

      timer = setTimeout(typeCitizen, 300)
    }

    playScenario(0)
    return () => clearTimeout(timer)
  }, [])

  // Parallax coordinates
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX - window.innerWidth / 2) / 60
    const y = (e.clientY - window.innerHeight / 2) / 60
    setMousePos({ x, y })
  }

  // Count animations on mount
  useEffect(() => {
    let frame = 0
    const totalFrames = 60
    const updateCounters = () => {
      frame++
      const progress = frame / totalFrames
      setAccuracy(parseFloat((progress * 99.8).toFixed(1)))
      setSchemesCount(Math.min(500, Math.floor(progress * 500)))
      setLanguagesCount(Math.min(3, Math.floor(progress * 3)))
      if (frame < totalFrames) {
        requestAnimationFrame(updateCounters)
      } else {
        setAccuracy(99.8)
        setSchemesCount(500)
        setLanguagesCount(3)
      }
    }
    requestAnimationFrame(updateCounters)
  }, [])

  const set = (k: keyof typeof form) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) {
      setErrors(e => ({ ...e, [k]: '' }))
    }
    if (formError) setFormError('')
  }

  // Strict Client-Side Validation
  const validateForm = () => {
    const e: Record<string, string> = {}

    const trimmedName = form.name.trim()
    if (!trimmedName) {
      e.name = 'Full Name is required.'
    } else if (trimmedName.length < 3) {
      e.name = 'Full Name must be at least 3 characters.'
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      e.name = 'Full Name can only contain alphabets and spaces.'
    }

    const trimmedEmail = form.email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmedEmail) {
      e.email = 'Email Address is required.'
    } else if (!emailRegex.test(trimmedEmail)) {
      e.email = 'Please enter a valid email address.'
    }

    const pw = form.password
    if (!pw) {
      e.password = 'Password is required.'
    } else if (pw.length < 8) {
      e.password = 'Password must be at least 8 characters long.'
    } else if (!/[A-Z]/.test(pw)) {
      e.password = 'Must contain at least one uppercase letter (A-Z).'
    } else if (!/[a-z]/.test(pw)) {
      e.password = 'Must contain at least one lowercase letter (a-z).'
    } else if (!/[0-9]/.test(pw)) {
      e.password = 'Must contain at least one number (0-9).'
    } else if (!/[^A-Za-z0-9]/.test(pw)) {
      e.password = 'Must contain at least one special character (!@#$%^&*).'
    }

    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.'
    } else if (form.confirmPassword !== form.password) {
      e.confirmPassword = 'Passwords do not match.'
    }

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
      const msg = err.response?.data?.message || err.message || 'Failed to create account. Try again later.'

      if (status === 409 || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already registered')) {
        const redirectNotice = 'User already exists. Redirecting to login page...'
        toast.error(redirectNotice)
        setFormError(redirectNotice)
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      } else {
        toast.error(msg)
        setFormError(msg)
      }
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
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 + 0.15, duration: 0.4, ease: 'easeOut' as const } })
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

        {/* Blueprint grid */}
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
          }}
        />

        {/* Ashoka Orbit Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-slate-900/[0.05] dark:border-white/[0.02] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-dashed border-emerald-600/[0.1] dark:border-emerald-400/[0.04] animate-spin-slow pointer-events-none" />

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
      <div className="flex-1 flex items-center justify-center relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4">
        <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8 items-center justify-center">

          {/* ==================== LEFT SIDE: CIVICSPHERE AI SHOWCASE (50%) ==================== */}
          <motion.div
            custom={-1} variants={cardVariants} initial="hidden" animate="visible"
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className={`lg:w-[50%] w-full flex flex-col justify-between p-5 sm:p-6 rounded-[28px] relative overflow-hidden transition-all duration-300 ${
              isDark
                ? 'bg-[#081224]/85 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40'
                : 'bg-gradient-to-br from-[#F8FAFC]/95 via-[#F1F5F9]/95 to-[#ECFDF5]/95 backdrop-blur-2xl border border-slate-300/80 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.14)] hover:shadow-[0_25px_60px_-10px_rgba(16,185,129,0.2)]'
            }`}
          >
            {/* Soft inner greenish corner glow */}
            {!isDark && (
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
            )}

            {/* Top border animated gradient highlight beam */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 rounded-t-[28px] overflow-hidden z-20">
              <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                className="w-1/2 h-full bg-white/60 dark:bg-emerald-400/60 absolute top-0" />
            </div>

            <div className="flex items-center justify-between z-10 relative">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span className={`text-[11px] font-black uppercase tracking-widest font-heading ${isDark ? 'text-emerald-400' : 'text-slate-900'}`}>
                  CivicSphere AI Onboarding
                </span>
              </div>
              <span className={`text-[9.5px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                isDark ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/25' : 'text-emerald-900 bg-emerald-500/20 border border-emerald-500/35 shadow-xs'
              }`}>
                Digital Welfare Preview
              </span>
            </div>

            {/* AI Assistant Chat Panel */}
            <div className="relative flex items-center justify-center w-full z-10 py-4 my-auto">
              <motion.div
                style={{ x: mousePos.x * 0.3, y: mousePos.y * 0.3 }}
                className={`w-full max-w-[380px] rounded-[24px] p-4 sm:p-5 relative overflow-hidden transition-all duration-300 ${
                  isDark
                    ? 'bg-[#091329]/90 backdrop-blur-2xl border border-white/10 shadow-2xl'
                    : 'bg-gradient-to-b from-white to-[#F0FDF4] backdrop-blur-2xl border border-emerald-200/90 shadow-lg shadow-emerald-500/5'
                }`}
              >
                {/* Chat Header */}
                <div className={`flex items-center justify-between pb-3 mb-2.5 border-b ${isDark ? 'border-slate-800' : 'border-emerald-200/80'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className={`text-[11px] font-black uppercase tracking-wider font-heading ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      CivicSphere AI Engine
                    </span>
                  </div>
                  <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded border ${
                    isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' : 'text-emerald-800 bg-emerald-100/90 border border-emerald-300'
                  }`}>Govt Verified</span>
                </div>

                {/* Animated Chat Viewport */}
                <div className="space-y-2.5 min-h-[175px] flex flex-col justify-end">
                  {typedCitizenText && (
                    <div className="self-end max-w-[85%] bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-[11px] font-bold px-3.5 py-2 rounded-2xl rounded-tr-none shadow-md">
                      {typedCitizenText}
                    </div>
                  )}

                  {aiTyping && (
                    <div className={`self-start flex items-center gap-2 text-[11px] px-3.5 py-2 rounded-2xl rounded-tl-none border font-bold ${
                      isDark ? 'bg-slate-900/90 border-slate-800 text-emerald-400' : 'bg-slate-100 border border-slate-300 text-slate-800'
                    }`}>
                      <Cpu className="w-4 h-4 animate-spin text-emerald-500" />
                      <span>AI is searching...</span>
                    </div>
                  )}

                  {typedAiResponse && (
                    <div className={`self-start max-w-[85%] text-[11px] font-bold px-3.5 py-2 rounded-2xl rounded-tl-none border ${
                      isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    }`}>
                      {typedAiResponse}
                    </div>
                  )}

                  {revealedSchemesCount > 0 && (
                    <div className="self-start w-full space-y-1.5 mt-1">
                      {onboardingScenarios[scenarioIdx].schemes.slice(0, revealedSchemesCount).map((sc) => (
                        <motion.div
                          key={sc}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer ${
                            isDark ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white hover:bg-emerald-50/60 border-slate-200/90 text-slate-900 shadow-xs'
                          }`}
                        >
                          <span className="text-[11px] font-extrabold">{sc}</span>
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
              {floatingBenefitChips.map((chip, idx) => (
                <motion.div
                  key={idx}
                  style={{
                    left: chip.x, top: chip.y,
                    x: mousePos.x * (1.1 + idx * 0.08), y: mousePos.y * (1.1 + idx * 0.08)
                  }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.2 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.15 }}
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

            {/* Bottom Real-time AI Trust Statistics */}
            <div className={`border-t pt-3 flex items-center justify-between text-center gap-2 z-10 relative ${
              isDark ? 'border-slate-800' : 'border-slate-300/80'
            }`}>
              <div className="flex-1">
                <span className="block text-base font-black text-emerald-600 dark:text-emerald-400">{accuracy}%</span>
                <span className="block text-[8.5px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider">Match Accuracy</span>
              </div>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-800" />
              <div className="flex-1">
                <span className="block text-base font-black text-blue-600 dark:text-blue-400">{schemesCount}+</span>
                <span className="block text-[8.5px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider">Welfare Schemes</span>
              </div>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-800" />
              <div className="flex-1">
                <span className="block text-base font-black text-purple-600 dark:text-purple-400">{languagesCount} Langs</span>
                <span className="block text-[8.5px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider">Supported</span>
              </div>
            </div>

          </motion.div>

          {/* ==================== RIGHT SIDE: AUTHENTICATION SIGNUP CARD (50%) ==================== */}
          <div className="lg:w-[50%] w-full flex items-center justify-center z-10">
            <motion.div
              custom={1} variants={cardVariants} initial="hidden" animate="visible"
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className={`w-full max-w-[460px] p-5 sm:p-6 rounded-[28px] relative select-none transition-all duration-300 ${
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

              <AnimatePresence mode="wait">
                {signupSuccess ? (
                  /* ================= EMAIL VERIFICATION SUCCESS VIEW ================= */
                  <motion.div
                    key="verification-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-4 text-center space-y-3.5"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                      <MailCheck className="w-7 h-7" />
                    </div>

                    <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                      Verify Your Email
                    </h2>

                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold leading-relaxed">
                      Account created successfully. Please verify your email before logging in.
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal font-medium px-2">
                      We have sent a verification link to <strong className="text-slate-900 dark:text-white">{successEmail}</strong>. 
                      Click the link in the email to activate your CivicSphere account.
                    </p>

                    <div className="pt-2 space-y-2.5">
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer"
                      >
                        Proceed to Login Page
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              toast.loading('Resending verification email...', { id: 'resend-toast' });
                              await axios.post('/api/auth/resend-verification', {
                                email: successEmail,
                                password: form.password,
                              });
                              toast.success('Verification email resent! Check your inbox.', { id: 'resend-toast' });
                            } catch (e: any) {
                              toast.error(e.response?.data?.message || 'Failed to resend verification link.', { id: 'resend-toast' });
                            }
                          }}
                          className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Didn't receive the email? Resend verification link
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* ================= AUTHENTICATION SIGNUP FORM ================= */
                  <motion.div key="signup-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Title & Subtitle */}
                    <motion.div custom={0} variants={flowItemVariants} initial="hidden" animate="visible" className="mb-3.5">
                      <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent leading-tight font-heading">
                        Create Account
                      </h2>
                      <p className="text-slate-700 dark:text-slate-300 text-xs mt-1 font-bold">
                        Simple authentication to access government schemes.
                      </p>

                      {/* Blinking welcome typing cursor */}
                      <div className="flex items-center gap-1 mt-1 min-h-[1.1rem]">
                        <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold font-mono">
                          {typedWelcome}
                        </span>
                        {typedWelcome.length < welcomeFullText.length && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="w-[2px] h-3 bg-emerald-500 inline-block"
                          />
                        )}
                      </div>
                    </motion.div>

                    {/* Server Error Alert Banner */}
                    {formError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{formError}</span>
                      </motion.div>
                    )}

                    {/* Form Fields - STRICTLY NO INNER SCROLLBAR */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                      {/* 1. Full Name */}
                      <motion.div custom={1} variants={flowItemVariants} initial="hidden" animate="visible">
                        <FloatingInput
                          id="su-name"
                          label="Full Name"
                          value={form.name}
                          onChange={set('name')}
                          icon={<User className="w-4 h-4" />}
                          error={errors.name}
                          required
                          autoComplete="name"
                        />
                      </motion.div>

                      {/* 2. Email Address */}
                      <motion.div custom={2} variants={flowItemVariants} initial="hidden" animate="visible">
                        <FloatingInput
                          id="su-email"
                          label="Email Address"
                          type="email"
                          value={form.email}
                          onChange={set('email')}
                          icon={<Mail className="w-4 h-4" />}
                          error={errors.email}
                          required
                          autoComplete="email"
                        />
                      </motion.div>

                      {/* 3. Password */}
                      <motion.div custom={3} variants={flowItemVariants} initial="hidden" animate="visible" className="space-y-1">
                        <FloatingInput
                          id="su-password"
                          label="Password"
                          type={showPass ? 'text' : 'password'}
                          value={form.password}
                          onChange={set('password')}
                          icon={<Lock className="w-4 h-4" />}
                          rightIcon={
                            <button
                              type="button"
                              onClick={() => setShowPass(s => !s)}
                              className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                          error={errors.password}
                          required
                          autoComplete="new-password"
                        />

                        {/* Password Strength Indicator */}
                        {form.password && (
                          <div className="space-y-0.5 pt-0.5">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={{ opacity: i < pwdScore ? 1 : 0.2 }}
                                  className={`flex-1 h-1 rounded-full ${i < pwdScore ? strengthColors[pwdScore] : 'bg-slate-200 dark:bg-slate-700'}`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between items-center text-[9.5px] font-bold">
                              <span className={['', 'text-red-500', 'text-orange-500', 'text-amber-500', 'text-blue-500', 'text-emerald-500'][pwdScore]}>
                                Password Strength: {strengthLabels[pwdScore]}
                              </span>
                              <span className="text-slate-400 text-[8.5px]">Min 8 chars</span>
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* 4. Confirm Password */}
                      <motion.div custom={4} variants={flowItemVariants} initial="hidden" animate="visible">
                        <FloatingInput
                          id="su-confirm"
                          label="Confirm Password"
                          type={showConfirmPass ? 'text' : 'password'}
                          value={form.confirmPassword}
                          onChange={set('confirmPassword')}
                          icon={<Lock className="w-4 h-4" />}
                          rightIcon={
                            <button
                              type="button"
                              onClick={() => setShowConfirmPass(s => !s)}
                              className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                              {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                          error={errors.confirmPassword}
                          required
                          autoComplete="new-password"
                        />
                      </motion.div>

                      {/* Submit CTA */}
                      <motion.div custom={5} variants={flowItemVariants} initial="hidden" animate="visible" className="pt-1.5">
                        <GradientButton type="submit" loading={loading}>
                          Create Account
                        </GradientButton>
                      </motion.div>
                    </form>

                    {/* Security Badges & Footer Switch Link */}
                    <motion.div custom={6} variants={flowItemVariants} initial="hidden" animate="visible" className="mt-3.5 pt-2.5 border-t border-slate-300/80 dark:border-slate-800 flex flex-col items-center gap-2 text-center">
                      <div className="flex items-center gap-4 text-[10px] font-extrabold text-slate-700 dark:text-slate-400">
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Govt Verified</span>
                        <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Firebase Auth</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> DPDP Compliant</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-300 font-bold flex items-center justify-center gap-1 mt-0.5">
                        Already have an account?{' '}
                        <Link to="/login" className="text-emerald-700 dark:text-emerald-400 font-black inline-flex items-center gap-0.5 hover:underline">
                          Sign In
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}
