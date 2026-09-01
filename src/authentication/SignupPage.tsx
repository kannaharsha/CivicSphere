import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Lock, Eye, EyeOff, Sparkles,
  Cpu, ArrowRight, AlertCircle, MailCheck
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

  // Title Welcome Typing
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setTypedWelcome(welcomeFullText.slice(0, i + 1))
      i++
      if (i >= welcomeFullText.length) clearInterval(timer)
    }, 50)
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

      // 1. Citizen Types Query
      const typeCitizen = () => {
        if (charIdx < sc.citizen.length) {
          setTypedCitizenText(sc.citizen.slice(0, charIdx + 1))
          charIdx++
          timer = setTimeout(typeCitizen, 25)
        } else {
          // 2. AI starts thinking
          timer = setTimeout(() => {
            setAiTyping(true)
            // 3. AI types response
            timer = setTimeout(() => {
              setAiTyping(false)
              let aiCharIdx = 0
              const typeAi = () => {
                if (aiCharIdx < sc.ai.length) {
                  setTypedAiResponse(sc.ai.slice(0, aiCharIdx + 1))
                  aiCharIdx++
                  timer = setTimeout(typeAi, 20)
                } else {
                  // 4. Reveal schemes sequentially
                  let sIdx = 0
                  const revealSchemes = () => {
                    if (sIdx < sc.schemes.length) {
                      sIdx++
                      setRevealedSchemesCount(sIdx)
                      timer = setTimeout(revealSchemes, 500)
                    } else {
                      // 5. Wait and go to next scenario
                      timer = setTimeout(() => {
                        playScenario((index + 1) % onboardingScenarios.length)
                      }, 5000)
                    }
                  }
                  timer = setTimeout(revealSchemes, 500)
                }
              }
              typeAi()
            }, 1200)
          }, 600)
        }
      }

      timer = setTimeout(typeCitizen, 300)
    }

    playScenario(0)
    return () => clearTimeout(timer)
  }, [])

  // Parallax coordinates
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const x = (clientX - window.innerWidth / 2) / 50
    const y = (clientY - window.innerHeight / 2) / 50
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
    // Clear error for that field as user types
    if (errors[k]) {
      setErrors(e => ({ ...e, [k]: '' }))
    }
    if (formError) setFormError('')
  }

  // Strict Client-Side Validation
  const validateForm = () => {
    const e: Record<string, string> = {}

    // Full Name Validation
    const trimmedName = form.name.trim()
    if (!trimmedName) {
      e.name = 'Full Name is required.'
    } else if (trimmedName.length < 3) {
      e.name = 'Full Name must be at least 3 characters.'
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      e.name = 'Full Name can only contain alphabets and spaces.'
    }

    // Email Validation
    const trimmedEmail = form.email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmedEmail) {
      e.email = 'Email Address is required.'
    } else if (!emailRegex.test(trimmedEmail)) {
      e.email = 'Please enter a valid email address.'
    }

    // Password Validation
    const pw = form.password
    if (!pw) {
      e.password = 'Password is required.'
    } else if (pw.length < 8) {
      e.password = 'Password must be at least 8 characters long.'
    } else if (!/[A-Z]/.test(pw)) {
      e.password = 'Password must contain at least one uppercase letter (A-Z).'
    } else if (!/[a-z]/.test(pw)) {
      e.password = 'Password must contain at least one lowercase letter (a-z).'
    } else if (!/[0-9]/.test(pw)) {
      e.password = 'Password must contain at least one number (0-9).'
    } else if (!/[^A-Za-z0-9]/.test(pw)) {
      e.password = 'Password must contain at least one special character (!@#$%^&*).'
    }

    // Confirm Password Validation
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

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen flex flex-col justify-between overflow-hidden relative transition-colors duration-500 ${
        theme === 'dark' ? 'bg-[#050816]' : 'bg-[#F8FAFC]'
      }`}
    >
      <AuthNavbar />

      {/* Layered Global Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,rgba(167,243,208,0.12)_35%,rgba(191,219,254,0.12)_75%,rgba(248,252,255,1)_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(10,15,35,0.3)_0%,rgba(5,8,22,1)_100%)]" />
        
        {/* Parallax Blobs */}
        <div
          style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
          className="absolute top-[8%] left-[10%] w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] transition-transform duration-300"
        />
        <div
          style={{ transform: `translate(${-mousePos.x * 0.4}px, ${-mousePos.y * 0.4}px)` }}
          className="absolute bottom-[8%] right-[10%] w-[480px] h-[480px] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[120px] transition-transform duration-300"
        />

        {/* Blueprint line grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
        
        <motion.div
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2563EB]/10 to-transparent"
        />

        <AuthParticles dark={theme === 'dark'} />
      </div>

      {/* Main Grid Layout Container */}
      <div className="flex-1 flex items-center justify-center relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-16 pb-4">
        <div className="w-full h-full lg:max-h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 items-stretch justify-center">
          
          {/* ==================== LEFT SIDE: HERO PREVIEW (42%) ==================== */}
          <div className="lg:w-[42%] w-full flex flex-col justify-between p-5 rounded-[32px] bg-white/20 dark:bg-[#091225]/20 backdrop-blur-[20px] border border-blue-500/10 dark:border-white/5 relative overflow-hidden select-none">

            
            {/* Concentric rotating wave lines in background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
              <div className="w-[320px] h-[320px] border border-dashed border-[#2563EB]/15 dark:border-white/5 rounded-full animate-[spin_55s_linear_infinite]" />
              <div className="w-[220px] h-[220px] border border-dotted border-emerald-500/15 dark:border-white/5 rounded-full absolute animate-[spin_35s_linear_infinite]" />
            </div>

            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-emerald-400 uppercase tracking-widest leading-none">
                  CivicSphere AI Onboarding
                </span>
              </div>
              <span className="text-[8px] font-extrabold text-slate-500 bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded uppercase tracking-wider">
                Digital Welfare Preview
              </span>
            </div>

            {/* AI Assistant Chatbot Display Panel */}
            <div className="relative my-auto flex items-center justify-center min-h-[310px] w-full z-10">
              <motion.div
                style={{ x: mousePos.x * 0.3, y: mousePos.y * 0.3 }}
                className="w-full max-w-[370px] bg-white/80 dark:bg-slate-950/90 backdrop-blur-2xl border border-[#2563EB]/15 dark:border-white/10 rounded-[28px] p-4 shadow-xl shadow-[#2563EB]/5 relative"
              >
                {/* Chatbot Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/80 dark:border-slate-800/85">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      CivicSphere AI Engine
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="text-[8px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">
                      Govt Verified
                    </span>
                  </div>
                </div>

                {/* Animated Chat Viewport */}
                <div className="space-y-3 min-h-[190px] flex flex-col justify-end">
                  {typedCitizenText && (
                    <div className="self-end max-w-[85%] bg-blue-600 dark:bg-[#2563EB] text-white text-[11px] font-bold px-3 py-2.5 rounded-2xl rounded-tr-none shadow-sm">
                      {typedCitizenText}
                    </div>
                  )}

                  {aiTyping && (
                    <div className="self-start flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 text-[10px] px-3 py-2 rounded-2xl rounded-tl-none border border-slate-200/60 dark:border-slate-800 text-slate-500 font-bold">
                      <Cpu className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                      <span>AI is searching...</span>
                    </div>
                  )}

                  {typedAiResponse && (
                    <div className="self-start max-w-[85%] bg-emerald-550/10 dark:bg-emerald-500/10 border border-emerald-500/20 text-[#00A86B] dark:text-emerald-400 text-[11px] font-bold px-3 py-2.5 rounded-2xl rounded-tl-none">
                      {typedAiResponse}
                    </div>
                  )}

                  {revealedSchemesCount > 0 && (
                    <div className="self-start w-full space-y-1.5 mt-2">
                      {onboardingScenarios[scenarioIdx].schemes.slice(0, revealedSchemesCount).map((sc) => (
                        <motion.div
                          key={sc}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50/90 dark:bg-slate-900/90 border border-emerald-500/10 shadow-sm"
                        >
                          <span className="text-[10.5px] font-extrabold text-slate-900 dark:text-white leading-none">{sc}</span>
                          <span className="text-[8px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                            ✔ Matched
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
                    left: chip.x,
                    top: chip.y,
                    x: mousePos.x * (1.1 + idx * 0.08),
                    y: mousePos.y * (1.1 + idx * 0.08),
                  }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4 + idx * 0.3, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.15 }}
                  className="absolute z-0 hidden lg:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-800 shadow-md text-[9px] font-bold text-slate-850 dark:text-emerald-400"
                >
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  {chip.text}
                </motion.div>
              ))}
            </div>

            {/* Bottom Real-time AI Trust Statistics */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-3 flex items-center justify-between text-center gap-2 z-10">
              <div className="flex-1">
                <span className="block text-sm font-black text-[#00A86B] dark:text-emerald-400">{accuracy}%</span>
                <span className="block text-[8px] text-slate-550 dark:text-slate-400 font-extrabold uppercase tracking-wider">Match Accuracy</span>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1">
                <span className="block text-sm font-black text-[#2563EB] dark:text-blue-400">{schemesCount}+</span>
                <span className="block text-[8px] text-slate-550 dark:text-slate-400 font-extrabold uppercase tracking-wider">Welfare Schemes</span>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1">
                <span className="block text-sm font-black text-purple-600 dark:text-purple-400">{languagesCount} Langs</span>
                <span className="block text-[8px] text-slate-550 dark:text-slate-400 font-extrabold uppercase tracking-wider">Indexed</span>
              </div>
            </div>

          </div>

          {/* ==================== RIGHT SIDE: AUTHENTICATION-FIRST SIGNUP CARD (58%) ==================== */}
          <div className="lg:w-[58%] w-full flex items-center justify-center z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="w-full max-w-[520px] bg-white/82 dark:bg-[#0a0f23]/75 backdrop-blur-[24px] rounded-[32px] border border-slate-200 dark:border-emerald-500/15 p-8 shadow-xl relative select-none max-h-[calc(100vh-120px)] overflow-y-auto"
            >
              {/* Top gradient accent beam */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-t-[32px]" />

              <AnimatePresence mode="wait">
                {signupSuccess ? (
                  /* ================= EMAIL VERIFICATION SUCCESS VIEW ================= */
                  <motion.div
                    key="verification-success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-4 text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                      <MailCheck className="w-8 h-8" />
                    </div>

                    <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                      Verify Your Email
                    </h2>

                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold leading-relaxed">
                      Account created successfully. Please verify your email before logging in.
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-normal font-medium px-2">
                      We have sent a verification link to <strong className="text-slate-900 dark:text-white">{successEmail}</strong>. 
                      Click the link in the email to activate your CivicSphere account.
                    </p>

                    <div className="pt-2 space-y-3">
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00A86B] to-[#2563EB] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer"
                      >
                        Proceed to Login Page
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <p className="text-[11px] text-slate-400 font-semibold">
                        Didn't receive the email? Check your spam folder or sign in to resend verification link.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* ================= MINIMAL AUTHENTICATION SIGNUP FORM ================= */
                  <motion.div key="signup-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Title & Subtitle */}
                    <div className="mb-5">
                      <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#00A86B] to-[#2563EB] bg-clip-text text-transparent leading-tight font-heading mt-1">
                        Create Your CivicSphere Account
                      </h2>
                      <p className="text-[#64748B] dark:text-[#CBD5E1] text-xs mt-1.5 leading-normal font-semibold">
                        Simple authentication-first signup. Access official government schemes and services securely.
                      </p>

                      {/* Blinking welcome typing cursor */}
                      <div className="flex items-center gap-1 mt-2 min-h-[1.25rem]">
                        <span className="text-emerald-600 dark:text-[#00D084] text-xs font-bold font-mono">
                          {typedWelcome}
                        </span>
                        {typedWelcome.length < welcomeFullText.length && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="w-[2px] h-3.5 bg-emerald-500 dark:bg-[#00D084] inline-block"
                          />
                        )}
                      </div>
                    </div>

                    {/* Server Error Alert Banner */}
                    {formError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{formError}</span>
                      </motion.div>
                    )}

                    {/* Authentication Fields ONLY */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* 1. Full Name */}
                      <FloatingInput
                        id="su-name"
                        label="Full Name"
                        value={form.name}
                        onChange={set('name')}
                        icon={<User className="w-4 h-4 text-slate-400" />}
                        error={errors.name}
                        required
                        autoComplete="name"
                      />

                      {/* 2. Email Address */}
                      <FloatingInput
                        id="su-email"
                        label="Email Address"
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        icon={<Mail className="w-4 h-4 text-slate-400" />}
                        error={errors.email}
                        required
                        autoComplete="email"
                      />

                      {/* 3. Password */}
                      <div className="space-y-1.5">
                        <FloatingInput
                          id="su-password"
                          label="Password"
                          type={showPass ? 'text' : 'password'}
                          value={form.password}
                          onChange={set('password')}
                          icon={<Lock className="w-4 h-4 text-slate-400" />}
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

                        {/* Real-time Password Strength Meter */}
                        {form.password && (
                          <div className="space-y-1 pt-1">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={{ opacity: i < pwdScore ? 1 : 0.2 }}
                                  className={`flex-1 h-1 rounded-full ${i < pwdScore ? strengthColors[pwdScore] : 'bg-slate-200 dark:bg-slate-700'}`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className={['', 'text-red-500', 'text-orange-500', 'text-amber-500', 'text-blue-500', 'text-emerald-500'][pwdScore]}>
                                Password Strength: {strengthLabels[pwdScore]}
                              </span>
                              <span className="text-slate-400 text-[9px]">Min 8 chars (A-Z, a-z, 0-9, special)</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4. Confirm Password */}
                      <FloatingInput
                        id="su-confirm"
                        label="Confirm Password"
                        type={showConfirmPass ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={set('confirmPassword')}
                        icon={<Lock className="w-4 h-4 text-slate-400" />}
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

                      {/* Submit Action */}
                      <div className="pt-2">
                        <GradientButton type="submit" loading={loading}>
                          Create Account
                        </GradientButton>
                      </div>
                    </form>

                    {/* Footer Link to Login Page */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
                      <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] font-bold flex items-center justify-center gap-1">
                        Already have an account?{' '}
                        <Link to="/login" className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent font-black inline-flex items-center gap-0.5 hover:opacity-90 group/sw relative">
                          Sign In
                          <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover/sw:translate-x-1 transition-transform shrink-0" />
                          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-emerald-600 to-blue-600 transition-all duration-300 group-hover/sw:w-full" />
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
    </div>
  )
}
