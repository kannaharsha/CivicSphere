import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="cta"
      ref={ref}
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #14532D 0%, #15803D 50%, #166534 100%)' }}
      aria-label="Get started with CivicSphere"
    >
      {/* Dotted overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      {/* Soft glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] rounded-full" style={{ background: 'rgba(255,255,255,0.05)', filter: 'blur(60px)' }} />
      </div>

      <div className="section-wrap relative z-10 py-24 text-center">
        {/* Saffron accent bar */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="h-1 w-16 rounded-full" style={{ background: '#F59E0B' }} />
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="heading-xl text-white mb-5"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Ready to Discover the Government
          <br />
          <span style={{ color: '#FCD34D' }}>Benefits You Deserve?</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-lg text-green-100/80 mb-10 max-w-xl mx-auto leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join citizens across India using CivicSphere to discover, check eligibility for, and access government schemes — completely free, in your language.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.28 }}
        >
          <button
            id="cta-signup-btn"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-green-800 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 text-base"
            style={{ fontFamily: 'var(--font-body)' }}
            aria-label="Sign up for CivicSphere for free"
          >
            Sign Up for Free
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="cta-login-btn"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-200 text-base hover:-translate-y-0.5"
            style={{ fontFamily: 'var(--font-body)' }}
            aria-label="Login to CivicSphere"
          >
            Login to Dashboard
          </button>
        </motion.div>

        {/* Trust note */}
        <motion.p
          className="text-sm text-green-200/60 mt-8"
          style={{ fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          🔒 Free forever &nbsp;·&nbsp; No credit card required &nbsp;·&nbsp; Government-grade security
        </motion.p>
      </div>
    </section>
  )
}
