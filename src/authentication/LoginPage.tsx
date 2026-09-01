import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, Database, Cpu, Sparkles, Volume2, ArrowRight
} from 'lucide-react'
import AuthNavbar from './AuthNavbar'
import FloatingInput from './FloatingInput'
import GradientButton from './GradientButton'
import AuthParticles from './AuthParticles'
import { useAuth } from '../firebase/useAuth'

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
      { name: 'PM-KISAN', desc: '₹6,000/yr Direct Support', source: 'Verified Central Ministry' },
      { name: 'YSR Rythu Bharosa', desc: 'State Farm Input Subsidy', source: 'AP Dept. of Agriculture' },
      { name: 'Soil Health Card', desc: 'Diagnostic & Advice', source: 'Ministry of Agriculture' },
      { name: 'PM Fasal Bima', desc: 'Crop Damage Insurance', source: 'Agri Insurance India' },
    ]
  },
  {
    citizen: 'Are there any higher education scholarships for students in Telangana?',
    thinking: 'Matching academic & community scholarships...',
    schemes: [
      { name: 'NSP Scholarships', desc: 'National Scholarship Portal', source: 'Min. of Electronics & IT' },
      { name: 'Telangana ePass', desc: 'Post-Matric Fee Reimbursement', source: 'TS Welfare Department' },
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
  {
    citizen: 'My grandfather is 68 in Uttar Pradesh. Any senior citizen support?',
    thinking: 'Searching retirement, pension & security rules...',
    schemes: [
      { name: 'IGNOAPS Pension', desc: 'National Pension Assistance', source: 'Min. of Rural Dev.' },
      { name: 'UP Old Age Pension', desc: 'State Senior Support', source: 'UP Social Welfare' },
      { name: 'Atal Pension Yojana', desc: 'Co-contributory Pension', source: 'PFRDA India' },
      { name: 'Vaya Vandana Yojana', desc: 'Senior Citizen Investment', source: 'LIC of India' },
    ]
  },
  {
    citizen: 'Welfare options for women entrepreneurs in Maharashtra.',
    thinking: 'Matching entrepreneurship & micro-loan schemes...',
    schemes: [
      { name: 'Lakhpati Didi', desc: 'Self Help Group Support', source: 'Min. of Rural Dev.' },
      { name: 'Mahila Udyam Nidhi', desc: 'SIDBI Entrepreneur Assistance', source: 'SIDBI Official' },
      { name: 'Stand-Up India', desc: 'SC/ST/Women Loan Support', source: 'SIDBI / NABARD' },
      { name: 'PMMVY Support', desc: 'Maternity Benefit Support', source: 'Ministry of WCD' },
    ]
  }
]

export default function LoginPage() {
  const theme = 'dark'
  const { login, googleLogin, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [typedText, setTypedText] = useState('')
  
  // Forgot Password modal state
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  
  // Parallax coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  // Scenarios state
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [chatStep, setChatStep] = useState(0)
  const [typedQuery, setTypedQuery] = useState('')
  const [activeSchemesCount, setActiveSchemesCount] = useState(0)

  // Animated counters on load
  const [accuracy, setAccuracy] = useState(0)
  const [rules, setRules] = useState(0)
  const [languages, setLanguages] = useState(0)

  const fullText = 'Welcome back, Citizen.'
  const navigate = useNavigate()

  useEffect(() => {
    // Force dark mode for login page
    document.documentElement.classList.add('dark')
  }, [])

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
    const { clientX, clientY } = e
    const x = (clientX - window.innerWidth / 2) / 50
    const y = (clientY - window.innerHeight / 2) / 50
    setMousePos({ x, y })
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    
    const runChatLoop = (index: number) => {
      setScenarioIdx(index)
      setChatStep(0)
      setTypedQuery('')
      setActiveSchemesCount(0)
      
      const currentScenario = conversationScenarios[index]
      const queryStr = currentScenario.citizen
      let charIdx = 0
      
      const typeQuery = () => {
        if (charIdx < queryStr.length) {
          setTypedQuery(queryStr.slice(0, charIdx + 1))
          charIdx++
          timer = setTimeout(typeQuery, 25)
        } else {
          timer = setTimeout(() => {
            setChatStep(1)
            timer = setTimeout(() => {
              setChatStep(2)
              let count = 0
              const revealSchemes = () => {
                if (count < 4) {
                  count++
                  setActiveSchemesCount(count)
                  timer = setTimeout(revealSchemes, 500)
                } else {
                  timer = setTimeout(() => {
                    const nextIdx = (index + 1) % conversationScenarios.length
                    runChatLoop(nextIdx)
                  }, 4500)
                }
              }
              revealSchemes()
            }, 1000)
          }, 800)
        }
      }
      
      timer = setTimeout(typeQuery, 300)
    }

    runChatLoop(0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let frame = 0
    const totalFrames = 60
    const updateCounters = () => {
      frame++
      const progress = frame / totalFrames
      setAccuracy(parseFloat((progress * 99.8).toFixed(1)))
      setRules(Math.min(500, Math.floor(progress * 500)))
      setLanguages(Math.min(3, Math.floor(progress * 3)))
      if (frame < totalFrames) {
        requestAnimationFrame(updateCounters)
      } else {
        setAccuracy(99.8)
        setRules(500)
        setLanguages(3)
      }
    }
    requestAnimationFrame(updateCounters)
  }, [])

  const validate = () => {
    const e: typeof errors = {}
    if (!email.includes('@')) e.email = 'Enter a valid email address'
    if (password.length < 6) e.password = 'Password must be 6+ characters'
    setErrors(e)
    return Object.keys(e).length === 0
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

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen flex flex-col justify-between overflow-hidden relative transition-colors duration-500 ${
        theme === 'dark' ? 'bg-[#050816]' : 'bg-[#F7FBFF]'
      }`}
    >
      <AuthNavbar />

      {/* Layered Government AI Environment */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Layer 1 — Mesh Gradient */}
        <div className="absolute inset-0 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,rgba(167,243,208,0.14)_35%,rgba(191,219,254,0.14)_75%,rgba(247,251,255,1)_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(9,18,37,0.35)_0%,rgba(5,8,22,1)_100%)]" />
        
        {/* Animated Blurred Glass Blobs */}
        <div
          style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
          className="absolute top-[10%] left-[15%] w-[450px] h-[450px] bg-[#E8FFF7]/60 dark:bg-[#00D084]/5 rounded-full blur-[110px] transition-transform duration-300"
        />
        <div
          style={{ transform: `translate(${-mousePos.x * 0.4}px, ${-mousePos.y * 0.4}px)` }}
          className="absolute bottom-[10%] right-[10%] w-[480px] h-[480px] bg-[#EAF3FF]/70 dark:bg-blue-600/5 rounded-full blur-[125px] transition-transform duration-300"
        />

        {/* Layer 2 — Thin Blueprint Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
        
        <motion.div
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2563EB]/10 to-transparent dark:via-[#00D084]/5"
        />

        {/* Layer 3 — Particles & Radar Circles */}
        <AuthParticles dark={theme === 'dark'} />
        
        {/* Layer 4 — SVG Neural connection network */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.03]" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            d="M -100 200 C 300 100, 400 500, 800 300 C 1200 100, 1300 600, 1600 400"
            stroke="url(#accent-gradient)"
            strokeWidth="1.8"
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
            d="M -50 600 C 400 400, 600 200, 1000 500 C 1200 600, 1500 300, 1600 200"
            stroke="url(#accent-gradient)"
            strokeWidth="1.2"
          />
          <defs>
            <linearGradient id="accent-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00A86B" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-16 pb-4">
        <div className="w-full h-full lg:max-h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 items-stretch justify-center">
          
          {/* ==================== LEFT SIDE: CIVICSPHERE AI EXPERIENCE (48%) ==================== */}
          <div className="lg:w-[48%] w-full flex flex-col justify-between p-5 rounded-[32px] bg-white/20 dark:bg-[#091225]/20 backdrop-blur-[20px] border border-blue-500/10 dark:border-white/5 relative overflow-hidden select-none">
            
            {/* Concentric Circle Waves & Rotating Radar */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
              <div className="w-[300px] h-[300px] border border-dashed border-blue-500/15 dark:border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="w-[200px] h-[200px] border border-dotted border-emerald-500/15 dark:border-white/5 rounded-full absolute animate-[spin_40s_linear_infinite]" />
            </div>

            {/* Platform Badge */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-emerald-400 uppercase tracking-widest leading-none">
                  CivicSphere AI Portal
                </span>
              </div>
              <span className="text-[8px] font-extrabold text-slate-500 bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded uppercase tracking-wider">
                Direct Govt Match
              </span>
            </div>

            {/* AI Assistant Chatbot Display Panel */}
            <div className="relative my-auto flex items-center justify-center min-h-[310px] w-full z-10">
              <motion.div
                style={{ x: mousePos.x * 0.35, y: mousePos.y * 0.35 }}
                className="w-full max-w-[370px] bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border border-[#2563EB]/15 dark:border-white/10 rounded-[28px] p-4.5 shadow-xl shadow-[#2563EB]/5 relative"
              >
                {/* Chatbot Header */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200/80 dark:border-slate-800/85">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-ping" />
                    <span className="text-[10.5px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      CivicSphere AI Assistant
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                    <span className="text-[8px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">
                      Govt Verified
                    </span>
                  </div>
                </div>

                {/* Animated Chat Log Viewport */}
                <div className="space-y-3.5 min-h-[180px] flex flex-col justify-end">
                  <AnimatePresence mode="wait">
                    {typedQuery && (
                      <motion.div
                        key={`query-${scenarioIdx}`}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="self-end max-w-[85%] bg-blue-600 dark:bg-[#2563EB] text-white text-[11px] font-bold px-3 py-2.5 rounded-2xl rounded-tr-none shadow-xs"
                      >
                        {typedQuery}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {chatStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="self-start flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 text-[11px] px-3 py-2 rounded-2xl rounded-tl-none border border-slate-200/60 dark:border-slate-850 text-slate-500 dark:text-emerald-400 font-bold"
                      >
                        <Cpu className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                        <span>{conversationScenarios[scenarioIdx].thinking}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {chatStep === 2 && (
                    <div className="self-start w-full space-y-1.5">
                      <span className="block text-[8.5px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Matched Welfare Schemes:</span>
                      {conversationScenarios[scenarioIdx].schemes?.slice(0, activeSchemesCount).map((scheme) => (
                        <motion.div
                          key={scheme.name}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/90 border border-[#2563EB]/10 dark:border-slate-800/80 shadow-2xs hover:border-emerald-500/20 transition-all duration-300"
                        >
                          <div className="min-w-0">
                            <span className="block text-[11px] font-extrabold text-slate-900 dark:text-white leading-none">{scheme.name}</span>
                            <span className="block text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{scheme.desc}</span>
                            <span className="block text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">Source: {scheme.source}</span>
                          </div>
                          <span className="text-[8px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                            ✔ Active Match
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Floating Schemes & Information Cards */}
              {floatingInfoCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  style={{
                    left: card.x,
                    top: card.y,
                    x: mousePos.x * (1.15 + idx * 0.1),
                    y: mousePos.y * (1.15 + idx * 0.1),
                  }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.8 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.2 }}
                  className="absolute z-0 hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800 shadow-md text-[9px] font-bold text-slate-800 dark:text-emerald-400"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  {card.text}
                </motion.div>
              ))}
            </div>

            {/* Bottom Real-time AI Trust Statistics */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-3 flex items-center justify-between text-center gap-2 z-10">
              <div className="flex-1">
                <span className="block text-sm font-black text-[#00A86B] dark:text-emerald-400">{accuracy}%</span>
                <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">Accuracy</span>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1">
                <span className="block text-sm font-black text-[#2563EB] dark:text-blue-400">{rules}+ Rules</span>
                <span className="block text-[8px] text-slate-550 dark:text-slate-400 font-extrabold uppercase tracking-wider">Indexed</span>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1">
                <span className="block text-sm font-black text-purple-600 dark:text-purple-400">{languages} Langs</span>
                <span className="block text-[8px] text-slate-550 dark:text-slate-400 font-extrabold uppercase tracking-wider">Loaded</span>
              </div>
            </div>

          </div>

          {/* ==================== RIGHT SIDE: REDESIGNED PREMIUM LOGIN FORM (52%) ==================== */}
          <div className="lg:w-[52%] w-full flex items-center justify-center z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="w-full max-w-[450px] bg-white/82 dark:bg-[#081224]/82 backdrop-blur-[24px] rounded-[28px] border border-blue-500/18 dark:border-white/10 p-7 pt-6 shadow-xl relative select-none hover:shadow-emerald-500/5 dark:hover:shadow-emerald-400/5 hover:shadow-xl transition-all duration-500"
            >
              {/* Top border animated gradient highlight beam */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-t-[28px] overflow-hidden">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="w-1/2 h-full bg-white/40 absolute top-0"
                />
              </div>

              {/* Form Header */}
              <div className="mb-5 pt-2">
                <h2 className="text-3xl sm:text-[36px] font-black bg-gradient-to-r from-[#00A86B] via-[#0EA5E9] to-[#2563EB] bg-clip-text text-transparent leading-none font-heading mt-1 relative drop-shadow-[0_0_12px_rgba(0,168,107,0.12)]">
                  Welcome Back to CivicSphere
                </h2>
                <p className="text-[#64748B] dark:text-[#CBD5E1] text-[11px] mt-2.5 leading-normal font-semibold">
                  Securely access your personalized Government welfare dashboard powered by AI.
                </p>

                {/* Welcoming typing script animation */}
                <div className="flex items-center gap-1 mt-2.5 min-h-[1.125rem]">
                  <span className="text-emerald-600 dark:text-[#00D084] text-xs font-bold font-mono">
                    {typedText}
                  </span>
                  {typedText.length < fullText.length && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-[2px] h-3.5 bg-emerald-500 dark:bg-[#00D084] inline-block"
                    />
                  )}
                </div>
              </div>

              {/* Login Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-[18px]">
                <FloatingInput
                  id="login-email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  icon={<Mail className="w-4 h-4 text-[#64748B] dark:text-[#CBD5E1]" />}
                  error={errors.email}
                  required
                  autoComplete="email"
                />
                
                <FloatingInput
                  id="login-password"
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  icon={<Lock className="w-4 h-4 text-[#64748B] dark:text-[#CBD5E1]" />}
                  rightIcon={
                    <motion.button 
                      type="button" 
                      animate={{ rotate: showPass ? 180 : 0 }}
                      onClick={() => setShowPass(s => !s)} 
                      className="cursor-pointer text-[#64748B] dark:text-[#CBD5E1] flex items-center justify-center"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                  }
                  error={errors.password}
                  required
                  autoComplete="current-password"
                />

                {/* Animated Circular checkbox and Forgot button */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#64748B] dark:text-[#CBD5E1] font-bold">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={e => setRemember(e.target.checked)}
                        className="sr-only"
                      />
                      <motion.div
                        whileHover={{ scale: 1.05, boxShadow: '0 0 8px rgba(0, 168, 107, 0.25)' }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          remember
                            ? 'bg-[#00A86B] dark:bg-[#00D084] border-[#00A86B] dark:border-[#00D084]'
                            : 'border-slate-350 dark:border-slate-700 bg-transparent'
                        }`}
                      >
                        {remember && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </motion.div>
                    </div>
                    Remember me
                  </label>
                  
                  <button 
                    type="button" 
                    onClick={() => setShowResetModal(true)}
                    className="text-[#00A86B] dark:text-[#00D084] font-black relative overflow-hidden group/link cursor-pointer"
                  >
                    Forgot password?
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#00A86B] dark:bg-[#00D084] transition-all duration-300 group-hover/link:w-full" />
                  </button>
                </div>

                {/* Primary CTA Login Button */}
                <div className="pt-1">
                  <GradientButton type="submit" loading={loading} success={success}>
                    Login to CivicSphere
                  </GradientButton>
                </div>
              </form>

              {/* separator OR */}
              <div className="my-4 flex items-center gap-2.5">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-slate-400 dark:text-slate-550 text-[9px] font-bold uppercase tracking-widest shrink-0">OR</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Google SSO button option */}
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
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Continue with Google</span>
              </button>

              {/* Tooltip & Trust Badges Section */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-3">
                <div className="flex justify-center gap-4">
                  {/* Government Verified */}
                  <div className="relative group/badge cursor-help">
                    <motion.span 
                      animate={{ boxShadow: ['0 0 0px rgba(0, 168, 107, 0)', '0 0 8px rgba(0, 168, 107, 0.2)', '0 0 0px rgba(0, 168, 107, 0)'] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center border border-slate-200/60 dark:border-slate-700 hover:border-emerald-500/40 dark:hover:border-emerald-400/40 hover:shadow-md transition-all duration-300"
                    >
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                    </motion.span>
                    <span className="absolute bottom-10 left-1/2 -translate-x-1/2 scale-0 group-hover/badge:scale-100 bg-slate-900 text-white text-[9px] py-1.5 px-2.5 rounded shadow-lg transition-transform duration-200 whitespace-nowrap z-20">
                      Government Verified
                    </span>
                  </div>

                  <div className="relative group/badge cursor-help">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200/60 dark:border-slate-700 hover:border-blue-500/40 dark:hover:border-blue-400/40 hover:shadow-md transition-all duration-300">
                      <Database className="w-4 h-4 text-blue-500" />
                    </span>
                    <span className="absolute bottom-8 left-1/2 -translate-x-1/2 scale-0 group-hover/badge:scale-100 bg-slate-900 text-white text-[9px] py-1 px-2.5 rounded shadow-lg transition-transform duration-200 whitespace-nowrap">
                      Firebase Authentication
                    </span>
                  </div>

                  <div className="relative group/badge cursor-help">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200/60 dark:border-slate-700 hover:border-purple-500/40 dark:hover:border-purple-400/40 hover:shadow-md transition-all duration-300">
                      <Cpu className="w-4 h-4 text-purple-500" />
                    </span>
                    <span className="absolute bottom-8 left-1/2 -translate-x-1/2 scale-0 group-hover/badge:scale-100 bg-slate-900 text-white text-[9px] py-1 px-2.5 rounded shadow-lg transition-transform duration-200 whitespace-nowrap">
                      DPDP Secure & Compliant
                    </span>
                  </div>
                </div>

                {/* Bottom Account switcher */}
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mt-1">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-emerald-600 dark:text-[#00D084] font-black inline-flex items-center gap-0.5 hover:underline group/sw">
                    Create Account
                    <ArrowRight className="w-3.5 h-3.5 group-hover/sw:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                </p>
              </div>

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
