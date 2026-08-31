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
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-slate-400 dark:text-slate-500 z-10 pointer-events-none">
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
          className={`w-full h-12 px-3 ${icon ? 'pl-9' : ''} ${rightIcon ? 'pr-9' : ''} pt-4 pb-1 rounded-xl border transition-all duration-200 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm font-medium outline-none peer
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
              : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
            }
          `}
        />
        <label
          htmlFor={id}
          className={`absolute left-3 ${icon ? 'left-9' : ''} transition-all duration-200 pointer-events-none font-medium
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 dark:peer-placeholder-shown:text-slate-500
            peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-emerald-600 dark:peer-focus:text-emerald-400 peer-focus:font-semibold
            ${hasValue
              ? 'top-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'top-3.5 text-sm text-slate-400 dark:text-slate-500'
            }
          `}
        >
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {rightIcon && (
          <span className="absolute right-3 text-slate-400 dark:text-slate-500 z-10">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-[11px] font-medium text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
