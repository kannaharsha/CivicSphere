import React from 'react';
import { motion } from 'framer-motion';

interface SettingToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  isDark?: boolean;
  label?: string;
  description?: string;
  badge?: string;
}

export const SettingToggle: React.FC<SettingToggleProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
  isDark = true,
  label,
  description,
  badge,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-b-0">
      <div className="flex-1 pr-2">
        <div className="flex items-center gap-2">
          {label && (
            <span
              className={`text-sm font-medium ${
                isDark ? 'text-white/90' : 'text-slate-900'
              }`}
            >
              {label}
            </span>
          )}
          {badge && (
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p
            className={`text-xs mt-0.5 ${
              isDark ? 'text-white/50' : 'text-slate-500'
            }`}
          >
            {description}
          </p>
        )}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 ${
          isDark ? 'focus:ring-emerald-500/50' : 'focus:ring-amber-500/50'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${
          checked
            ? isDark
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-amber-500 to-amber-600'
            : isDark
            ? 'bg-white/10'
            : 'bg-slate-200'
        }`}
      >
        <span className="sr-only">{label || 'Toggle setting'}</span>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
