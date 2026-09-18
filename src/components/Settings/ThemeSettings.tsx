import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, CheckCircle2 } from 'lucide-react';
import type { ThemePreference } from './settingsTypes';

interface ThemeSettingsProps {
  isDark?: boolean;
  selectedTheme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  isDark = true,
  selectedTheme,
  onThemeChange,
}) => {
  const THEME_OPTIONS: {
    id: ThemePreference;
    title: string;
    desc: string;
    icon: React.ReactNode;
    gradient: string;
    glow: string;
    miniDots: string[];
  }[] = [
    {
      id: 'light',
      title: 'Light Mode',
      desc: 'Warm Luxury Gold accents on crisp white',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      gradient: 'from-amber-50 via-white to-orange-50',
      glow: 'shadow-amber-400/20',
      miniDots: ['bg-amber-400', 'bg-orange-400', 'bg-yellow-300'],
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      desc: 'Deep emerald governance aesthetic',
      icon: <Moon className="w-5 h-5 text-emerald-400" />,
      gradient: 'from-slate-950 via-slate-900 to-emerald-950',
      glow: 'shadow-emerald-500/20',
      miniDots: ['bg-emerald-500', 'bg-teal-400', 'bg-cyan-400'],
    },
    {
      id: 'system',
      title: 'System Default',
      desc: 'Auto-syncs with OS theme preference',
      icon: <Monitor className="w-5 h-5 text-indigo-400" />,
      gradient: 'from-slate-200 via-slate-100 to-indigo-50',
      glow: 'shadow-indigo-400/20',
      miniDots: ['bg-indigo-400', 'bg-violet-400', 'bg-blue-400'],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl overflow-hidden border backdrop-blur-sm transition-all ${
        isDark
          ? 'bg-slate-900/40 border-white/8 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-950/30'
          : 'bg-white/80 border-slate-100 hover:border-amber-300/50 hover:shadow-xl hover:shadow-amber-500/8'
      }`}
    >
      <div className={`h-1 w-full ${isDark ? 'bg-gradient-to-r from-slate-500 via-emerald-500 to-amber-500' : 'bg-gradient-to-r from-slate-300 via-amber-400 to-orange-400'}`} />

      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
          }`}>
            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Theme & Appearance
            </h2>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Changes apply instantly across the entire portal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {THEME_OPTIONS.map((opt, i) => {
            const isSelected = selectedTheme === opt.id;
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onThemeChange(opt.id)}
                className={`relative text-left p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? isDark
                      ? `bg-emerald-500/10 border-emerald-400/60 shadow-xl ${opt.glow}`
                      : `bg-amber-500/8 border-amber-500 shadow-xl ${opt.glow}`
                    : isDark
                    ? 'bg-white/[0.03] border-white/5 hover:border-white/12 hover:bg-white/[0.06]'
                    : 'bg-slate-50/70 border-slate-100 hover:border-amber-200 hover:bg-slate-50'
                }`}
              >
                {isSelected && (
                  <div className={`absolute inset-0 rounded-2xl blur-md -z-10 opacity-20 bg-gradient-to-br ${opt.gradient}`} />
                )}

                {/* Miniature theme preview */}
                <div className={`h-24 w-full rounded-xl mb-4 p-2.5 border bg-gradient-to-br ${opt.gradient} border-black/5 overflow-hidden shadow-inner`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    {opt.miniDots.map((c, di) => (
                      <div key={di} className={`w-2 h-2 rounded-full ${c}`} />
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <div className={`h-2 rounded-full w-3/4 ${isDark && opt.id !== 'dark' ? 'bg-slate-300' : opt.id === 'dark' ? 'bg-emerald-500/30' : 'bg-amber-200'}`} />
                    <div className={`h-1.5 rounded-full w-1/2 ${opt.id === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    <div className={`h-5 rounded-lg w-24 flex items-center justify-center mt-2 ${opt.id === 'dark' ? 'bg-emerald-500/20' : 'bg-amber-400/25'}`}>
                      <div className={`h-1.5 w-8 rounded-full ${opt.id === 'dark' ? 'bg-emerald-400/50' : 'bg-amber-500/60'}`} />
                    </div>
                  </div>
                </div>

                {/* Label row */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {opt.icon}
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{opt.title}</span>
                  </div>
                  {isSelected
                    ? <CheckCircle2 className={`w-4.5 h-4.5 ${isDark ? 'text-emerald-400' : 'text-amber-600'}`} />
                    : <div className={`w-4 h-4 rounded-full border-2 ${isDark ? 'border-white/20' : 'border-slate-300'}`} />
                  }
                </div>
                <p className={`text-[11px] leading-snug ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{opt.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
