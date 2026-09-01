import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck,
  MapPin, Briefcase, Globe, CheckCircle2, Sparkles,
  ChevronLeft, Bell, Database, Cpu, ArrowRight, Calendar, Landmark
} from 'lucide-react'
import AuthNavbar from './AuthNavbar'
import FloatingInput from './FloatingInput'
import GradientButton from './GradientButton'
import AuthParticles from './AuthParticles'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../firebase/useAuth'

const STEPS = ['Basic Info', 'Citizen Profile', 'Preferences']

const states = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
const occupations = ['Farmer', 'Student', 'Women Welfare', 'Senior Citizen', 'Job Seeker', 'Disabled Citizen', 'Entrepreneur', 'Other']
const incomeRanges = ['Below ₹1 Lakh', '₹1–3 Lakh', '₹3–5 Lakh', '₹5–8 Lakh', '₹8–12 Lakh', 'Above ₹12 Lakh']
const languagesList = ['English', 'తెలుగు', 'हिन्दी', 'Tamil', 'Kannada', 'Bengali']
const familyCategories = ['General', 'OBC', 'SC', 'ST', 'EWS']
const genders = ['Male', 'Female', 'Prefer not to say']

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
    ai: "I found 3 matching medical coverage options.",
    schemes: ['Ayushman Bharat PM-JAY', 'Delhi CGHS Network Card', 'PM Suraksha Bima']
  },
  {
    citizen: "Welfare support for a 68-year-old grandfather in Uttar Pradesh.",
    ai: "I matched 3 senior pension and security schemes.",
    schemes: ['IGNOAPS National Pension', 'UP State Senior Pension', 'Atal Pension Yojana']
  }
]

function getStrength(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const strengthLabels = ['', 'Weak', 'Medium', 'Strong', 'Excellent']
const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500']

export default function SignupPage() {
  const { theme } = useTheme()
  const { signup, googleLogin } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [typedWelcome, setTypedWelcome] = useState('')
  const navigate = useNavigate()

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

  // District list / Form States
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    state: '', district: '', occupation: '', age: '', gender: '', language: '', income: '', family: '',
    dob: '', aadhaar: '', notifications: true, aiRec: true, terms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const welcomeFullText = "Let's build your Citizen Identity."
  const strength = getStrength(form.password)

  // Title Welcome Typing
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setTypedWelcome(welcomeFullText.slice(0, i + 1))
      i++
      if (i >= welcomeFullText.length) clearInterval(timer)
    }, 55)
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

  const set = (k: string) => (v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const validateStep = () => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (form.name.trim().length < 2) e.name = 'Enter your full name'
      if (!form.email.includes('@')) e.email = 'Enter a valid email'
      if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit number'
      if (form.password.length < 6) e.password = 'Password must be 6+ characters'
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    if (step === 1) {
      if (!form.state) e.state = 'Select your state'
      if (!form.occupation) e.occupation = 'Select occupation'
    }
    if (step === 2) {
      if (!form.terms) e.terms = 'Please accept the terms to continue'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = async () => {
    if (!validateStep()) return
    if (step < 2) setStep(s => s + 1)
    else {
      setLoading(true)
      try {
        await signup(form.email, form.password, {
          fullName: form.name,
          phone: form.phone,
          state: form.state,
          district: form.district,
          occupation: form.occupation,
          gender: form.gender,
          language: form.language,
          annualIncome: form.income ? parseInt(form.income.replace(/\D/g, '')) || 0 : 0,
          dob: form.dob || null,
        })
        setTimeout(() => navigate('/dashboard'), 1500)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
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
          
          {/* ==================== LEFT SIDE: HERO PREVIEW (45%) ==================== */}
          <div className="lg:w-[45%] w-full flex flex-col justify-between p-5 rounded-[32px] bg-white/20 dark:bg-[#091225]/20 backdrop-blur-[20px] border border-blue-500/10 dark:border-white/5 relative overflow-hidden select-none">
            
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

          {/* ==================== RIGHT SIDE: SIGNUP CARD FORM (55%) ==================== */}
          <div className="lg:w-[55%] w-full flex items-center justify-center z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="w-full max-w-[450px] bg-white/82 dark:bg-[#0a0f23]/75 backdrop-blur-[24px] rounded-[32px] border border-slate-200 dark:border-emerald-500/15 p-6 shadow-xl relative select-none max-h-[calc(100vh-140px)] overflow-y-auto"
            >
              {/* Custom step bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  {STEPS.map((label, i) => (
                    <div key={i} className="flex items-center gap-1.5 relative">
                      <motion.div
                        animate={{
                          backgroundColor: i <= step ? '#00A86B' : 'transparent',
                          borderColor: i <= step ? '#00A86B' : '#64748B',
                          scale: i === step ? 1.05 : 1,
                        }}
                        className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9.5px] font-bold border transition-colors text-slate-800 dark:text-white"
                      >
                        {i < step ? <CheckCircle2 className="w-3 h-3 text-white" /> : i + 1}
                      </motion.div>
                      <span className={`text-[9px] font-bold ${i === step ? 'text-[#00A86B] dark:text-[#00D084]' : 'text-slate-400'}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-[#00A86B] to-[#2563EB] bg-clip-text text-transparent leading-tight font-heading mt-1">
                  Create Your CivicSphere Account
                </h2>
                <p className="text-[#64748B] dark:text-[#CBD5E1] text-[10.5px] mt-1.5 leading-normal font-semibold">
                  Create one secure AI-powered citizen profile to discover government schemes across Central, State, and District services.
                </p>

                {/* Blinking welcome message cursor */}
                <div className="flex items-center gap-1 mt-2 min-h-[1.125rem]">
                  <span className="text-emerald-600 dark:text-[#00D084] text-[11px] font-bold font-mono">
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

              {/* Step Forms */}
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3.5">
                    <FloatingInput id="su-name" label="Full Name" value={form.name} onChange={set('name')} icon={<User className="w-4 h-4 text-slate-400" />} error={errors.name} required />
                    <FloatingInput id="su-email" label="Email Address" type="email" value={form.email} onChange={set('email')} icon={<Mail className="w-4 h-4 text-slate-400" />} error={errors.email} required autoComplete="email" />
                    <FloatingInput id="su-phone" label="Phone Number" type="tel" value={form.phone} onChange={set('phone')} icon={<Phone className="w-4 h-4 text-slate-400" />} error={errors.phone} required />
                    
                    <FloatingInput
                      id="su-password"
                      label="Password"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      icon={<Lock className="w-4 h-4 text-slate-400" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPass(s => !s)} className="cursor-pointer text-slate-400">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      error={errors.password}
                      required
                      autoComplete="new-password"
                    />

                    {form.password && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ opacity: i < strength ? 1 : 0.25 }}
                              className={`flex-1 h-1 rounded-full ${i < strength ? strengthColors[strength] : 'bg-slate-200 dark:bg-slate-700'}`}
                            />
                          ))}
                        </div>
                        <p className={`text-[10px] font-bold ${['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-emerald-500'][strength]}`}>
                          Strength: {strengthLabels[strength]}
                        </p>
                      </div>
                    )}

                    <FloatingInput
                      id="su-confirm"
                      label="Confirm Password"
                      type={showConfirmPass ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={set('confirmPassword')}
                      icon={<Lock className="w-4 h-4 text-slate-400" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowConfirmPass(s => !s)} className="cursor-pointer text-slate-400">
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      error={errors.confirmPassword}
                      required
                      autoComplete="new-password"
                    />
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <SelectField id="su-state" label="State of India" value={form.state} onChange={set('state')} options={states} icon={<MapPin className="w-4 h-4 text-slate-400" />} error={errors.state} />
                    <FloatingInput id="su-district" label="District" value={form.district} onChange={set('district')} icon={<MapPin className="w-4 h-4 text-slate-400" />} />
                    
                    <SelectField id="su-occ" label="Occupation" value={form.occupation} onChange={set('occupation')} options={occupations} icon={<Briefcase className="w-4 h-4 text-slate-400" />} error={errors.occupation} />
                    
                    {/* Citizen Profile chips selector */}
                    <div className="space-y-1">
                      <span className="block text-[10px] font-extrabold text-[#64748B] dark:text-[#CBD5E1] uppercase tracking-wider">Citizen Profile Type</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {occupations.slice(0, 6).map((occ) => {
                          const active = form.occupation === occ
                          return (
                            <button
                              key={occ}
                              type="button"
                              onClick={() => set('occupation')(occ)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 shadow-3xs cursor-pointer ${
                                active
                                  ? 'bg-[#00A86B] text-white border-[#00A86B] shadow-emerald-500/20'
                                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50'
                              }`}
                            >
                              {occ}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FloatingInput id="su-age" label="Age" type="number" value={form.age} onChange={set('age')} icon={<Calendar className="w-4 h-4 text-slate-400" />} />
                      <SelectField id="su-gender" label="Gender" value={form.gender} onChange={set('gender')} options={genders} />
                    </div>
                    
                    <SelectField id="su-lang" label="Preferred Language" value={form.language} onChange={set('language')} options={languagesList} icon={<Globe className="w-4 h-4 text-slate-400" />} />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField id="su-income" label="Annual Income Range" value={form.income} onChange={set('income')} options={incomeRanges} />
                      <SelectField id="su-family" label="Family Category" value={form.family} onChange={set('family')} options={familyCategories} />
                    </div>

                    <FloatingInput id="su-aadhaar" label="Aadhaar Number (Optional)" value={form.aadhaar} onChange={set('aadhaar')} icon={<Landmark className="w-4 h-4 text-slate-400" />} />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3.5">
                    <PreferenceToggle
                      id="pref-notif"
                      icon={<Bell className="w-4 h-4 text-blue-500" />}
                      label="Scheme Notifications"
                      desc="Get alerts when new matching schemes launch"
                      checked={form.notifications}
                      onChange={v => set('notifications')(v)}
                    />
                    <PreferenceToggle
                      id="pref-ai"
                      icon={<Sparkles className="w-4 h-4 text-violet-500" />}
                      label="AI Recommendations"
                      desc="Let our AI suggest personalized government schemes"
                      checked={form.aiRec}
                      onChange={v => set('aiRec')(v)}
                    />

                    <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                      errors.terms
                        ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}>
                      {/* Circular Custom Checkbox */}
                      <div className="relative flex items-center mt-0.5 shrink-0">
                        <input
                          id="pref-terms"
                          type="checkbox"
                          checked={form.terms}
                          onChange={e => set('terms')(e.target.checked)}
                          className="sr-only"
                        />
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            form.terms
                              ? 'bg-[#00A86B] border-[#00A86B]'
                              : 'border-slate-350 dark:border-slate-700 bg-transparent'
                          }`}
                        >
                          {form.terms && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </motion.div>
                      </div>
                      
                      <span className="text-[11px] text-[#64748B] dark:text-[#CBD5E1] font-bold leading-tight">
                        I agree to the Terms of Service & Privacy Policy. Data is processed per DPDP Act 2023 guidelines.
                      </span>
                    </label>
                    {errors.terms && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.terms}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Actions */}
              <div className={`flex gap-3 mt-5 ${step > 0 ? 'flex-row' : 'flex-col'}`}>
                {step > 0 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="flex items-center justify-center gap-1.5 px-4 h-12 rounded-xl border border-slate-200 dark:border-slate-800 text-[#64748B] dark:text-[#CBD5E1] text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <GradientButton onClick={nextStep} loading={loading}>
                  {step < 2 ? 'Continue' : 'Create My Account'}
                </GradientButton>
              </div>

              {step === 0 && (
                <>
                  <div className="my-4 flex items-center gap-2.5">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                    <span className="text-slate-400 dark:text-slate-550 text-[9px] font-bold uppercase tracking-widest shrink-0">OR</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  </div>

                  {/* Google SSO */}
                   <button 
                    type="button"
                    onClick={async () => {
                      try {
                        await googleLogin()
                        navigate('/dashboard')
                      } catch (e) {
                        console.error(e)
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden group/google"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/google:translate-x-[100%] transition-transform duration-1000" />
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Sign up with Google</span>
                  </button>
                </>
              )}

              {/* Trust Badges */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-3">
                <div className="flex justify-center gap-4">
                  <div className="relative group/badge cursor-help">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center border border-slate-200/60 dark:border-slate-700 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300">
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                    </span>
                    <span className="absolute bottom-10 left-1/2 -translate-x-1/2 scale-0 group-hover/badge:scale-100 bg-slate-900 text-white text-[9px] py-1.5 px-2.5 rounded shadow-lg transition-transform duration-200 whitespace-nowrap z-20">
                      Government Verified
                    </span>
                  </div>

                  <div className="relative group/badge cursor-help">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center border border-slate-200/60 dark:border-slate-700 hover:border-blue-500/40 hover:shadow-md transition-all duration-300">
                      <Database className="w-4.5 h-4.5 text-blue-500" />
                    </span>
                    <span className="absolute bottom-10 left-1/2 -translate-x-1/2 scale-0 group-hover/badge:scale-100 bg-slate-900 text-white text-[9px] py-1.5 px-2.5 rounded shadow-lg transition-transform duration-200 whitespace-nowrap z-20">
                      Firebase Ready
                    </span>
                  </div>

                  <div className="relative group/badge cursor-help">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center border border-slate-200/60 dark:border-slate-700 hover:border-purple-500/40 hover:shadow-md transition-all duration-300">
                      <Cpu className="w-4.5 h-4.5 text-purple-500" />
                    </span>
                    <span className="absolute bottom-10 left-1/2 -translate-x-1/2 scale-0 group-hover/badge:scale-100 bg-slate-900 text-white text-[9px] py-1.5 px-2.5 rounded shadow-lg transition-transform duration-200 whitespace-nowrap z-20">
                      DPDP Secure & Compliant
                    </span>
                  </div>
                </div>

                {/* Account switcher */}
                <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] font-bold flex items-center gap-1 mt-1">
                  Already have an account?{' '}
                  <Link to="/login" className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent font-black inline-flex items-center gap-0.5 hover:opacity-90 group/sw relative">
                    Sign In
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover/sw:translate-x-1 transition-transform shrink-0" />
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-emerald-600 to-blue-600 transition-all duration-300 group-hover/sw:w-full" />
                  </Link>
                </p>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}

function SelectField({ id, label, value, onChange, options, icon, error }: {
  id: string; label: string; value: string; onChange: (v: string) => void
  options: string[]; icon?: React.ReactNode; error?: string
}) {
  return (
    <div className="relative">
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 z-10 pointer-events-none">
            {icon}
          </span>
        )}
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full h-12 ${icon ? 'pl-10' : 'pl-3'} pr-3 rounded-xl border text-xs font-bold bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all appearance-none cursor-pointer
            ${error
              ? 'border-red-400 focus:border-red-500'
              : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500'
            }
            ${!value ? 'text-slate-400 dark:text-slate-500' : ''}
          `}
        >
          <option value="">{label}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="absolute right-3.5 text-slate-400 pointer-events-none text-[10px]">▼</span>
      </div>
      {error && <p className="mt-1 text-[10px] font-bold text-red-500">{error}</p>}
    </div>
  )
}

function PreferenceToggle({ id, icon, label, desc, checked, onChange }: {
  id: string; icon: React.ReactNode; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors select-none">
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-800">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold text-slate-900 dark:text-white">{label}</div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-medium">{desc}</div>
      </div>
      <div
        onClick={e => { e.preventDefault(); onChange(!checked) }}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0 ${checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm"
        />
      </div>
      <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  )
}
