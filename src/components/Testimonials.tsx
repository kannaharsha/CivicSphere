import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star, ShieldCheck, HeartHandshake, MapPin, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

const testimonials = [
  {
    id: 'farmer-raju',
    name: 'Raju Naidu',
    occupation: 'Farmer',
    location: 'Krishna District, Andhra Pradesh',
    avatar: '👨‍🌾',
    category: 'Agriculture',
    categoryBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderColor: 'hover:border-emerald-300',
    quote: 'CivicSphere లో నా వివరాలు నమోదు చేసిన తర్వాత, PM Kisan మరియు రైతు బీమా పథకానికి అర్హత ఉందని తెలిసింది. AI సహాయకుడు తెలుగులో అన్ని వివరాలు చెప్పాడు!',
    quoteEn: 'After entering my details, I found I am eligible for PM Kisan and Raitu Bima. The AI explained everything in Telugu — very helpful!',
    scheme: 'PM Kisan + Raitu Bima',
    accentColor: '#16A34A'
  },
  {
    id: 'student-priya',
    name: 'Priya Sharma',
    occupation: 'B.Tech Student',
    location: 'Hyderabad, Telangana',
    avatar: '👩‍🎓',
    category: 'Scholarship',
    categoryBg: 'bg-blue-50 text-blue-700 border-blue-200',
    borderColor: 'hover:border-blue-300',
    quote: 'I had no idea I was eligible for the National Scholarship worth ₹36,000 per year. CivicSphere found it in seconds and told me exactly which documents to submit!',
    quoteEn: null,
    scheme: 'National Scholarship Portal',
    accentColor: '#2563EB'
  },
  {
    id: 'senior-krishnamma',
    name: 'Krishnamma Devi',
    occupation: 'Retired Teacher, 67',
    location: 'Vizag, Andhra Pradesh',
    avatar: '👵',
    category: 'Senior Citizen',
    categoryBg: 'bg-amber-50 text-amber-700 border-amber-200',
    borderColor: 'hover:border-amber-300',
    quote: 'मुझे नहीं पता था कि बुजुर्गों के लिए कितनी सरकारी योजनाएं हैं। CivicSphere ने हिंदी में बताया और पेंशन मिलना शुरू हो गया। बहुत अच्छी सेवा है!',
    quoteEn: 'I didn\'t know how many schemes exist for senior citizens. CivicSphere explained in Hindi and my pension started. Wonderful service!',
    scheme: 'Senior Citizen Pension Scheme',
    accentColor: '#D97706'
  },
  {
    id: 'healthcare-ramesh',
    name: 'Ramesh Verma',
    occupation: 'Shop Owner',
    location: 'Bhopal, Madhya Pradesh',
    avatar: '👨‍💼',
    category: 'Healthcare',
    categoryBg: 'bg-rose-50 text-rose-700 border-rose-200',
    borderColor: 'hover:border-rose-300',
    quote: 'CivicSphere helped my family get covered under Ayushman Bharat for ₹5 Lakh health insurance. The AI eligibility checker verified our family status instantly.',
    quoteEn: null,
    scheme: 'Ayushman Bharat PM-JAY',
    accentColor: '#E11D48'
  },
  {
    id: 'women-anitha',
    name: 'Anitha Reddy',
    occupation: 'Self-Employed Entrepreneur',
    location: 'Warangal, Telangana',
    avatar: '👩‍💼',
    category: 'Women Welfare',
    categoryBg: 'bg-pink-50 text-pink-700 border-pink-200',
    borderColor: 'hover:border-pink-300',
    quote: 'CivicSphere ద్వారా నాకు PM Mudra మరియు Stree Nidhi పథకాల వివరాలు వచ్చాయి. నా చిన్న వ్యాపారానికి రుణం లభించింది.',
    quoteEn: 'Through CivicSphere I got PM Mudra loan guidance. It empowered my small handcraft enterprise.',
    scheme: 'PM Mudra & Stree Nidhi',
    accentColor: '#DB2777'
  },
  {
    id: 'disability-suresh',
    name: 'Suresh Kumar',
    occupation: 'Artisan',
    location: 'Mysore, Karnataka',
    avatar: '👨‍🎨',
    category: 'Special Welfare',
    categoryBg: 'bg-purple-50 text-purple-700 border-purple-200',
    borderColor: 'hover:border-purple-300',
    quote: 'CivicSphere guided me step by step in local language for disability welfare equipment support. The AI step guide saved months of hassle.',
    quoteEn: null,
    scheme: 'Divyangjan Support Scheme',
    accentColor: '#9333EA'
  },
  {
    id: 'trainee-vikram',
    name: 'Vikram Singh',
    occupation: 'Skill Trainee',
    location: 'Jaipur, Rajasthan',
    avatar: '👷‍♂️',
    category: 'Employment',
    categoryBg: 'bg-orange-50 text-orange-700 border-orange-200',
    borderColor: 'hover:border-orange-300',
    quote: 'I enrolled in PM Kaushal Vikas Yojana after CivicSphere identified my eligibility. Got free training and job placement assistance!',
    quoteEn: null,
    scheme: 'PM Kaushal Vikas Yojana',
    accentColor: '#EA580C'
  },
  {
    id: 'artisan-savitri',
    name: 'Savitri Bai',
    occupation: 'Handloom Weaver',
    location: 'Murshidabad, West Bengal',
    avatar: '🧶',
    category: 'Rural Support',
    categoryBg: 'bg-teal-50 text-teal-700 border-teal-200',
    borderColor: 'hover:border-teal-300',
    quote: 'CivicSphere helped our weaver cooperative discover government yarn subsidies and artisan assistance programs easily.',
    quoteEn: null,
    scheme: 'National Handloom Development',
    accentColor: '#0D9488'
  }
]

export default function Testimonials() {
  const [isPaused, setIsPaused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  // Duplicate testimonials array for continuous infinite scroll
  const marqueeItems = [...testimonials, ...testimonials]

  const scrollLeft = () => {
    if (marqueeRef.current) {
      marqueeRef.current.scrollBy({ left: -360, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (marqueeRef.current) {
      marqueeRef.current.scrollBy({ left: 360, behavior: 'smooth' })
    }
  }

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative pt-1 pb-8 md:pt-2 md:pb-10 bg-slate-50/80 overflow-hidden flex flex-col justify-center"
      aria-label="Citizen testimonials"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-emerald-200/15 rounded-full blur-[110px]"
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] bg-sky-200/15 rounded-full blur-[110px]"
          animate={{ x: [0, -20, 30, 0], y: [0, 20, -20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <div className="w-[500px] h-[500px] rounded-full border-[6px] border-slate-900 animate-spin-slow" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

        <motion.div
          className="text-center max-w-2xl mx-auto mb-4 md:mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-extrabold tracking-wider text-slate-800 uppercase">
              💚 REAL CITIZEN SUCCESS STORIES
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Real Citizens. <span className="gradient-text font-extrabold">Real Impact.</span>
          </h2>

          <p
            className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Thousands of citizens across India discovered Government welfare schemes through CivicSphere's AI eligibility engine and multilingual guidance.
          </p>

          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isPaused ? 'Resume Slow Flow' : 'Pause Flow (Read Mode)'}</span>
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={scrollLeft}
                className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      <div className="relative w-full overflow-hidden py-2 group">
        {/* Left & Right Gradient Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-20 pointer-events-none" />

        {/* Marquee Track */}
        <div
          ref={marqueeRef}
          className="flex gap-4 w-max animate-marquee overflow-x-auto scrollbar-none"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {marqueeItems.map((t, idx) => (
            <article
              key={`${t.id}-${idx}`}
              className={`w-[350px] h-[245px] rounded-[24px] bg-white border border-slate-200/80 p-4.5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between shrink-0 relative overflow-hidden ${t.borderColor}`}
            >
              {/* Top Accent Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: t.accentColor }}
              />

              {/* Card Top: Stars & Category Chip & AI Verified */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${t.categoryBg}`}
                  >
                    {t.category}
                  </span>
                  <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> AI Verified
                  </span>
                </div>
              </div>

              {/* Center: Quote */}
              <div className="space-y-1 my-1">
                <p className="text-xs text-slate-800 font-medium leading-relaxed line-clamp-3">
                  "{t.quote}"
                </p>
                {t.quoteEn && (
                  <p className="text-[10.5px] text-slate-500 italic line-clamp-2">
                    — "{t.quoteEn}"
                  </p>
                )}
              </div>

              {/* Bottom: Author Details & Scheme Received */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{t.name}</h4>
                    <p className="text-[10px] font-medium text-slate-500 truncate">{t.occupation}</p>
                    <p className="text-[9.5px] text-slate-400 truncate flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" /> {t.location}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-md border text-slate-800 bg-slate-50 border-slate-200"
                  >
                    ✓ {t.scheme}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

    </section>
  )
}
