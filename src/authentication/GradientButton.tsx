import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, ArrowRight, CheckCircle2 } from 'lucide-react'

interface GradientButtonProps {
  type?: 'button' | 'submit'
  onClick?: () => void
  loading?: boolean
  success?: boolean
  children: React.ReactNode
  fullWidth?: boolean
  variant?: 'primary' | 'secondary'
}

export default function GradientButton({
  type = 'button',
  onClick,
  loading,
  success,
  children,
  fullWidth = true,
  variant = 'primary'
}: GradientButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ 
        scale: loading || success ? 1 : 1.015,
        y: loading || success ? 0 : -3,
        boxShadow: loading || success 
          ? 'none' 
          : '0 18px 36px -8px rgba(16, 185, 129, 0.45), 0 0 25px rgba(6, 182, 212, 0.35)'
      }}
      whileTap={{ scale: loading || success ? 1 : 0.975 }}
      className={`relative overflow-hidden flex items-center justify-center gap-2.5 h-12 rounded-2xl text-xs sm:text-sm font-black tracking-wide transition-all duration-300 cursor-pointer group/btn ${
        fullWidth ? 'w-full' : 'px-6'
      } ${
        variant === 'primary'
          ? success
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 border border-emerald-400/40'
            : 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:brightness-110 text-white shadow-lg shadow-emerald-500/25 border border-white/30 animate-gradient-shift'
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
      } disabled:opacity-75 disabled:cursor-not-allowed`}
      disabled={loading || success}
    >
      {/* Continuous Shine Animation Sweeping Across */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent translate-x-[-150%] animate-light-beam pointer-events-none" />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span key="loading" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5 font-black text-white">
            <Cpu className="w-4.5 h-4.5 animate-spin text-cyan-300" />
            <span className="tracking-wider">AI Verifying Credentials…</span>
          </motion.span>
        ) : success ? (
          <motion.span key="success" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 font-black text-white">
            <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
            <span>Access Granted!</span>
          </motion.span>
        ) : (
          <motion.span key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 justify-center font-black">
            {children}
            {variant === 'primary' && (
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-2" />
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

