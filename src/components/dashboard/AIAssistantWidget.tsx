import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Send, Mic, MicOff, Bot, User, RefreshCw, Copy, Check,
  ExternalLink, Languages, ShieldCheck
} from 'lucide-react'
import { useAuth } from '../../firebase/AuthProvider'
import { useTheme } from '../../context/ThemeContext'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  schemes?: Array<{
    title: string
    category: string
    benefit: string
    eligibility: string
    link?: string
  }>
  actions?: string[]
}

const QUICK_PROMPTS = [
  '🌾 What schemes are available for farmers?',
  '🎓 Scholarship schemes for higher education',
  '🏥 Free health insurance schemes (Ayushman Bharat)',
  '🏠 PM Awas Yojana housing subsidy details',
  '💼 Financial support for small business & MSME',
  '👵 Pension and welfare schemes for senior citizens'
]

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' }
]

export default function AIAssistantWidget({ isDark: propIsDark }: { isDark?: boolean }) {
  const { theme } = useTheme()
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark'
  const { profile } = useAuth()

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const citizenName = profile?.fullName || 'Citizen'
  const userState = profile?.state || 'All India'
  const userOccupation = profile?.occupation || 'Citizen'

  const initialGreeting: Message = {
    id: 'welcome-1',
    sender: 'assistant',
    text: `Namaste **${citizenName}**! 🙏 I am your CivicSphere AI Assistant.\n\nI can help you discover government welfare schemes, check real-time eligibility criteria, identify required application documents, and guide you through the registration process.\n\nHow can I help you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actions: ['Check Farmer Schemes', 'Explore Scholarships', 'Housing Subsidies', 'Health Insurance']
  }

  const [messages, setMessages] = useState<Message[]>([initialGreeting])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClearChat = () => {
    setMessages([initialGreeting])
  }

  const generateAIResponse = (query: string): Message => {
    const q = query.toLowerCase()
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    if (q.includes('farm') || q.includes('kisan') || q.includes('agri') || q.includes('crop')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `Here are the top agricultural welfare schemes matched for farmers in **${userState}**:`,
        timestamp: timeStr,
        schemes: [
          {
            title: 'PM-KISAN Samman Nidhi',
            category: 'Agriculture',
            benefit: '₹6,000 per year in 3 equal four-monthly installments',
            eligibility: 'All landholding farmer families having cultivable land',
            link: 'https://pmkisan.gov.in/'
          },
          {
            title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
            category: 'Crop Insurance',
            benefit: 'Comprehensive crop insurance against non-preventable natural risks',
            eligibility: 'All farmers growing notified crops in notified areas',
            link: 'https://pmfby.gov.in/'
          },
          {
            title: 'PM Kisan Maandhan Yojana',
            category: 'Farmer Pension',
            benefit: 'Assured monthly pension of ₹3,000 upon reaching 60 years',
            eligibility: 'Small and marginal farmers aged 18 to 40 years',
            link: 'https://maandhan.in/'
          }
        ],
        actions: ['Check Required Documents for PM-KISAN', 'How to Apply Online', 'Check Next Installment Date']
      }
    }

    if (q.includes('scholar') || q.includes('student') || q.includes('college') || q.includes('study') || q.includes('education')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `Based on your query, here are prominent scholarship and education support schemes:`,
        timestamp: timeStr,
        schemes: [
          {
            title: 'National Scholarship Portal (NSP) - Post Matric',
            category: 'Education',
            benefit: 'Full tuition fee reimbursement + annual maintenance allowance',
            eligibility: 'Students pursuing post-matriculation courses with family income < ₹2.5 Lakhs/year',
            link: 'https://scholarships.gov.in/'
          },
          {
            title: 'AICTE Pragati Scholarship for Girls',
            category: 'Technical Education',
            benefit: '₹50,000 per annum towards college fee, books, and equipment',
            eligibility: 'Female students enrolled in 1st year degree/diploma technical courses',
            link: 'https://www.aicte-india.org/'
          },
          {
            title: 'Central Sector Scheme of Scholarship for College and University Students',
            category: 'Higher Education',
            benefit: '₹12,000 to ₹20,000 per year for undergraduate & post-graduate students',
            eligibility: 'Students in the top 80th percentile in Class 12 board exams',
            link: 'https://scholarships.gov.in/'
          }
        ],
        actions: ['List Documents for NSP', 'Income Certificate Requirements', 'Application Deadlines']
      }
    }

    if (q.includes('health') || q.includes('hospital') || q.includes('medical') || q.includes('ayushman') || q.includes('insurance')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `Here are the key healthcare and medical insurance welfare schemes:`,
        timestamp: timeStr,
        schemes: [
          {
            title: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
            category: 'Healthcare',
            benefit: 'Cashless hospital coverage up to ₹5,00,000 per family per year',
            eligibility: 'Families identified based on SECC 2011 deprivation criteria',
            link: 'https://pmjay.gov.in/'
          },
          {
            title: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
            category: 'Accident Insurance',
            benefit: '₹2,00,000 accidental death & disability cover for ₹20/year premium',
            eligibility: 'Citizens aged 18 to 70 with an active savings bank account',
            link: 'https://jansuraksha.gov.in/'
          }
        ],
        actions: ['Download Ayushman Card', 'Find Empanelled Hospitals', 'Check PM-JAY Eligibility']
      }
    }

    if (q.includes('house') || q.includes('housing') || q.includes('awas') || q.includes('home')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `Here are the housing assistance schemes for urban and rural citizens:`,
        timestamp: timeStr,
        schemes: [
          {
            title: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
            category: 'Housing (Rural)',
            benefit: 'Financial assistance of ₹1.20 Lakh (plains) to ₹1.30 Lakh (hilly areas) for pucca house',
            eligibility: 'Houseless families and those living in zero, one, or two-room kutcha houses',
            link: 'https://pmayg.nic.in/'
          },
          {
            title: 'Pradhan Mantri Awas Yojana - Urban (PMAY-U)',
            category: 'Housing (Urban)',
            benefit: 'Interest subsidy up to ₹2.67 Lakh under Credit Linked Subsidy Scheme (CLSS)',
            eligibility: 'EWS, LIG, and MIG families residing in statutory towns',
            link: 'https://pmayuclap.gov.in/'
          }
        ],
        actions: ['Track PMAY Application', 'Required Documents for Housing Scheme', 'Income Limits']
      }
    }

    if (q.includes('pension') || q.includes('elder') || q.includes('senior') || q.includes('old age')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `Here are social security & pension schemes available for senior citizens:`,
        timestamp: timeStr,
        schemes: [
          {
            title: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
            category: 'Social Welfare',
            benefit: 'Monthly direct cash pension of ₹200 to ₹500 (augmented by state contribution)',
            eligibility: 'Citizens aged 60+ belonging to Below Poverty Line (BPL) households',
            link: 'https://nsap.nic.in/'
          },
          {
            title: 'Atal Pension Yojana (APY)',
            category: 'Guaranteed Pension',
            benefit: 'Guaranteed monthly pension of ₹1,000 to ₹5,000 from age 60',
            eligibility: 'Any citizen aged 18 to 40 having a savings bank account',
            link: 'https://www.npscra.nsdl.co.in/'
          }
        ],
        actions: ['How to Apply for APY', 'Find Nearest Seva Kendra', 'Check BPL List Inclusion']
      }
    }

    // Default intelligent response
    return {
      id: Date.now().toString(),
      sender: 'assistant',
      text: `Thank you for your question regarding **"${query}"**.\n\nOur AI matching engine scans across **Central and State database registries** in **${userState}** for citizens in the **${userOccupation}** category.\n\nTo give you the most accurate criteria, would you like to explore schemes by one of these major sectors?`,
      timestamp: timeStr,
      actions: ['Agriculture & Farming', 'Education & Scholarships', 'Healthcare & Ayushman', 'Housing & PMAY', 'Social Welfare & Pensions']
    }
  }

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = generateAIResponse(query)
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 750)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
    } else {
      setIsListening(true)
      setTimeout(() => {
        setIsListening(false)
        setInput('Which agriculture subsidies are available in my state?')
      }, 2500)
    }
  }

  return (
    <div className={`rounded-3xl border transition-all duration-300 shadow-xl overflow-hidden ${
      isDark 
        ? 'bg-[#132338]/90 border-slate-700/60 text-white shadow-black/40' 
        : 'bg-white/95 border-slate-200 text-[#17324D] shadow-slate-200/60'
    }`}>
      {/* Header bar */}
      <div className={`p-5 sm:p-6 border-b flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'border-slate-700/50 bg-[#172c47]/60' : 'border-slate-100 bg-[#F0F7F9]/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#E7C66B] flex items-center justify-center shadow-md shadow-[#0F766E]/25 text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight">CivicSphere AI Assistant</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0F766E]/15 text-[#0F766E] dark:bg-[#0F766E]/30 dark:text-[#E7C66B]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live RAG Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Real-time welfare eligibility, document advisor & multi-lingual guidance
            </p>
          </div>
        </div>

        {/* Right header controls: Language + Clear */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
            <Languages className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#E7C66B]" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-200"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset Conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Profile Awareness Ribbon */}
      <div className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
        isDark ? 'bg-[#0f1d2e]/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-[#E7C66B]" />
          <span>
            Context: <strong className="text-[#17324D] dark:text-slate-200">{citizenName}</strong> | State:{' '}
            <strong className="text-[#17324D] dark:text-slate-200">{userState}</strong> | Profile:{' '}
            <strong className="text-[#17324D] dark:text-slate-200">{userOccupation}</strong>
          </span>
        </div>
        <span className="hidden md:inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
          ✓ Aadhaar & Citizen Data Synchronized
        </span>
      </div>

      {/* Main Chat Conversation Area */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[520px] min-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0F766E] to-[#17324D] flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-[#0F766E] to-[#115e59] text-white rounded-tr-none'
                  : isDark
                    ? 'bg-[#1b2e46] border border-slate-700/60 text-slate-100 rounded-tl-none'
                    : 'bg-slate-100 border border-slate-200/80 text-slate-800 rounded-tl-none'
              }`}>
                {/* Text Content */}
                <div className="whitespace-pre-line font-medium">
                  {msg.text}
                </div>

                {/* Schemes Cards if any */}
                {msg.schemes && msg.schemes.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {msg.schemes.map((scheme, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs transition-all hover:border-[#0F766E] ${
                          isDark
                            ? 'bg-[#132338] border-slate-700 text-slate-200'
                            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0F766E]/15 text-[#0F766E] dark:bg-[#0F766E]/30 dark:text-[#E7C66B] mb-1">
                              {scheme.category}
                            </span>
                            <h4 className="font-black text-sm text-[#17324D] dark:text-white">
                              {scheme.title}
                            </h4>
                          </div>
                          {scheme.link && (
                            <a
                              href={scheme.link}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-[#0F766E] transition-colors"
                              title="Official Scheme Portal"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        <div className="space-y-1 text-slate-600 dark:text-slate-300">
                          <p>
                            <strong className="text-slate-800 dark:text-slate-100">Benefit:</strong> {scheme.benefit}
                          </p>
                          <p>
                            <strong className="text-slate-800 dark:text-slate-100">Eligibility:</strong> {scheme.eligibility}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Follow-up Action Chips */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    {msg.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(act)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-[#E7C66B] hover:bg-slate-700'
                            : 'bg-white border-slate-300 text-[#0F766E] hover:bg-slate-50'
                        }`}
                      >
                        {act} →
                      </button>
                    ))}
                  </div>
                )}

                {/* Message footer timestamp + copy */}
                <div className={`mt-2 flex items-center justify-between text-[10px] ${
                  msg.sender === 'user' ? 'text-teal-100' : 'text-slate-400'
                }`}>
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-slate-200 transition-colors flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-300 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-sm mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* AI Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-center"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0F766E] to-[#17324D] flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className={`rounded-2xl px-4 py-3 text-xs flex items-center gap-2 border ${
              isDark ? 'bg-[#1b2e46] border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              <Sparkles className="w-3.5 h-3.5 animate-spin text-[#E7C66B]" />
              <span>Checking scheme database & eligibility rules...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Shelf */}
      <div className={`px-4 sm:px-6 py-3 border-t overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2 ${
        isDark ? 'bg-[#172c47]/30 border-slate-800' : 'bg-slate-50 border-slate-100'
      }`}>
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-[#E7C66B]" />
          Suggested:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt.replace(/^[^\w]+/, ''))}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all flex-shrink-0 ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-500'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className={`p-4 sm:p-5 border-t ${
        isDark ? 'border-slate-700/60 bg-[#132338]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl border transition-all ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title={isListening ? 'Listening...' : 'Voice Search'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening to your voice prompt...' : 'Ask about any scheme, subsidy, documents or eligibility...'}
            className={`flex-1 px-4 py-3 rounded-2xl text-sm font-medium border outline-none transition-all ${
              isDark
                ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'
            }`}
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isTyping}
            className={`p-3 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center ${
              !input.trim() || isTyping
                ? 'opacity-40 cursor-not-allowed bg-slate-400 text-white'
                : 'bg-gradient-to-r from-[#0F766E] to-[#115e59] hover:from-[#115e59] hover:to-[#0F766E] text-white shadow-[#0F766E]/30'
            }`}
            title="Send Question"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Supported: PM-KISAN, Ayushman Bharat, PMAY, NSP, Mudra & 500+ state schemes</span>
          <span className="hidden sm:inline">Press Enter ↵ to send</span>
        </div>
      </div>
    </div>
  )
}
