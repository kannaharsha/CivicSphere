import React from 'react';
import { motion } from 'framer-motion';
import { Settings, ShieldCheck, RefreshCw, LogOut, CheckCircle, Sparkles } from 'lucide-react';

interface SettingsHeaderProps {
  isDark?: boolean;
  isSaving?: boolean;
  lastSavedText?: string;
  onRequestReset: () => void;
  onRequestSignOut: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  isDark = true,
  isSaving = false,
  lastSavedText,
  onRequestReset,
  onRequestSignOut,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-3xl p-7 sm:p-10 border mb-8 ${
        isDark
          ? 'bg-gradient-to-br from-[#0a1f14] via-[#0d1f14] to-[#07191a] border-emerald-700/30 shadow-2xl shadow-emerald-950/50'
          : 'bg-gradient-to-br from-[#fdf7e8] via-[#fef9ec] to-[#fff8e1] border-amber-300/40 shadow-xl shadow-amber-400/15'
      }`}
    >
      {/* Ambient glow blobs */}
      <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
        isDark ? 'bg-emerald-500/12 animate-pulse' : 'bg-amber-400/20'
      }`} />
      <div className={`absolute -left-16 -bottom-16 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        isDark ? 'bg-teal-500/8' : 'bg-orange-300/12'
      }`} />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${isDark ? '#10B981' : '#D4A017'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#10B981' : '#D4A017'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Title block */}
        <div className="flex items-center gap-5">
          {/* Icon with glow */}
          <div className="relative flex-shrink-0">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
              isDark
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-700/50'
                : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-400/40'
            }`}>
              <Settings className="w-8 h-8 text-white animate-[spin_15s_linear_infinite]" />
            </div>
            <div className={`absolute inset-0 rounded-2xl blur-lg -z-10 ${
              isDark ? 'bg-emerald-500/40' : 'bg-amber-400/40'
            }`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isDark ? 'text-white' : 'text-amber-900'
              }`}>
                Settings Center
              </h1>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isDark
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-600/30'
                    : 'bg-amber-500/15 text-amber-900 border-amber-400/40'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                Citizen Preferences
              </motion.span>
            </div>
            <p className={`text-sm max-w-2xl leading-relaxed ${
              isDark ? 'text-emerald-200/50' : 'text-amber-800/60'
            }`}>
              Manage your account, language, notifications, accessibility, and privacy — all auto-saved.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Autosave Pill */}
          <motion.div
            animate={{ scale: isSaving ? [1, 1.04, 1] : 1 }}
            transition={{ repeat: isSaving ? Infinity : 0, duration: 0.8 }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
              isDark
                ? 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300/80'
                : 'bg-amber-100/80 border-amber-300/60 text-amber-800'
            }`}
          >
            {isSaving ? (
              <>
                <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isDark ? 'text-emerald-400' : 'text-amber-600'}`} />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <CheckCircle className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-amber-600'}`} />
                <span>{lastSavedText || 'All changes saved'}</span>
              </>
            )}
          </motion.div>

          {/* Reset */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onRequestReset}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isDark
                ? 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300/80 border-emerald-800/50 hover:border-emerald-700/60'
                : 'bg-amber-100 hover:bg-amber-200/70 text-amber-900 border-amber-300 shadow-sm hover:shadow'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </motion.button>

          {/* Sign Out */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onRequestSignOut}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
