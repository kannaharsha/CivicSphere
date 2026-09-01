import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'

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
        scale: loading || success ? 1 : 1.02,
        y: loading || success ? 0 : -2.5,
        boxShadow: loading || success ? 'none' : '0 14px 30px -6px rgba(16, 185, 129, 0.45)'
      }}
      whileTap={{ scale: loading || success ? 1 : 0.975 }}
      className={`relative overflow-hidden flex items-center justify-center gap-2 h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all duration-300 cursor-pointer group/btn ${
        fullWidth ? 'w-full' : 'px-6'
      } ${
        variant === 'primary'
          ? success
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:brightness-105 text-white shadow-md shadow-emerald-500/25 border border-white/20'
          : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
      } disabled:opacity-70 disabled:cursor-not-allowed`}
      disabled={loading || success}
    >
      {/* Light shimmer trail line moving across */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-150%] group-hover/btn:animate-[shimmer_1.2s_infinite]" />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Processing…</span>
          </motion.span>
        ) : success ? (
          <motion.span key="success" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Success!</span>
          </motion.span>
        ) : (
          <motion.span key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 justify-center">
            {children}
            {variant === 'primary' && (
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
