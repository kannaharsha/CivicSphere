import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface FloatingInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  isValid?: boolean
  required?: boolean
  autoComplete?: string
}

export default function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  icon,
  rightIcon,
  error,
  isValid,
  required,
  autoComplete
}: FloatingInputProps) {
  const hasValue = value.length > 0

  return (
    <div className={`relative ${error ? 'animate-shake' : ''}`}>
      <div className="relative flex items-center group">
        {/* Animated Icon on Focus */}
        {icon && (
          <span className="absolute left-3.5 z-10 pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-cyan-400 group-focus-within:translate-x-0.5 group-focus-within:scale-110 transition-all duration-300">
            {icon}
          </span>
        )}

        {/* Input Element with Glassmorphism and Animated Focus Glow */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          placeholder=" "
          className={`w-full h-11 sm:h-12 px-3.5 ${icon ? 'pl-10 sm:pl-11' : ''} ${
            rightIcon || (isValid && hasValue) ? 'pr-10 sm:pr-11' : ''
          } pt-4 pb-1 rounded-2xl border-2 transition-all duration-300 text-xs sm:text-sm font-extrabold outline-none peer
            bg-white/70 dark:bg-slate-900/70 backdrop-blur-md
            text-slate-900 dark:text-white
            placeholder:text-transparent
            ${
              error
                ? 'border-red-500/80 dark:border-red-500/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-cyan-500/40 focus:border-emerald-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-cyan-400/20 focus:shadow-[0_0_20px_rgba(16,185,129,0.25)]'
            }
          `}
        />

        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`absolute left-3.5 ${icon ? 'left-10 sm:left-11' : ''} transition-all duration-300 pointer-events-none font-bold
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-slate-400 dark:peer-placeholder-shown:text-slate-500
            peer-focus:top-1.5 peer-focus:text-[9.5px] peer-focus:text-emerald-600 dark:peer-focus:text-cyan-400 peer-focus:font-black
            ${
              hasValue
                ? 'top-1.5 text-[9.5px] text-emerald-600 dark:text-cyan-400 font-black'
                : 'top-3.5 text-xs text-slate-400 dark:text-slate-500'
            }
          `}
        >
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>

        {/* Right Icon / Valid Success Checkmark */}
        <div className="absolute right-3.5 z-10 flex items-center gap-1.5">
          {isValid && hasValue && !error && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </motion.div>
          )}
          {rightIcon && (
            <span className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer">
              {rightIcon}
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 ml-1 text-[10.5px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

