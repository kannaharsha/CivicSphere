import { motion } from 'framer-motion'

interface FloatingInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
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
  required,
  autoComplete
}: FloatingInputProps) {
  const hasValue = value.length > 0

  return (
    <div className="relative">
      <div className="relative flex items-center group">
        {icon && (
          <span className="absolute left-3.5 z-10 pointer-events-none text-slate-500 dark:text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors duration-200">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          placeholder=" "
          className={`w-full h-11 px-3.5 ${icon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} pt-4 pb-1 rounded-xl border-2 transition-all duration-200 text-xs sm:text-sm font-extrabold outline-none peer
            bg-white dark:bg-[#060D1E]/90
            text-slate-950 dark:text-white
            placeholder:text-transparent
            ${error
              ? 'border-red-400 dark:border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 dark:focus:ring-emerald-400/15 shadow-2xs'
            }
          `}
        />
        <label
          htmlFor={id}
          className={`absolute left-3.5 ${icon ? 'left-10' : ''} transition-all duration-200 pointer-events-none font-bold
            peer-placeholder-shown:top-3 peer-placeholder-shown:text-xs peer-placeholder-shown:text-slate-500 dark:peer-placeholder-shown:text-slate-400
            peer-focus:top-1 peer-focus:text-[9.5px] peer-focus:text-emerald-700 dark:peer-focus:text-emerald-400 peer-focus:font-black
            ${hasValue
              ? 'top-1 text-[9.5px] text-emerald-700 dark:text-emerald-400 font-black'
              : 'top-3 text-xs text-slate-500 dark:text-slate-400'
            }
          `}
        >
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {rightIcon && (
          <span className="absolute right-3.5 z-10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-[10.5px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
