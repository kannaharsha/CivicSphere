import React from 'react';
import { motion } from 'framer-motion';
import { Languages, CheckCircle2 } from 'lucide-react';
import type { LanguageCode } from './settingsTypes';

interface LanguageSettingsProps {
  isDark?: boolean;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

const LANGUAGES: { code: LanguageCode; label: string; nativeLabel: string; script: string; sample: string; flag: string }[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    script: 'Latin',
    sample: 'Welcome to CivicSphere Government Services',
    flag: '🇮🇳',
  },
  {
    code: 'te',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    script: 'Telugu Script',
    sample: 'సివిక్స్ఫియర్ ప్రభుత్వ సేవల వేదికకు స్వాగతం',
    flag: '🏛️',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    script: 'Devanagari',
    sample: 'सिविकस्फीयर सरकारी नागरिक सेवा केंद्र में आपका स्वागत है',
    flag: '🌏',
  },
];

export const LanguageSettings: React.FC<LanguageSettingsProps> = ({
  isDark = true,
  selectedLanguage,
  onLanguageChange,
}) => {
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
      <div className={`h-1 w-full ${isDark ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500' : 'bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400'}`} />

      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-500/10 text-indigo-700 border border-indigo-500/20'
          }`}>
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Language Preferences
            </h2>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Interface language for all forms, guides, and notifications
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LANGUAGES.map((lang, i) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onLanguageChange(lang.code)}
                className={`text-left p-4 rounded-2xl border transition-all relative group cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-500/12 border-emerald-400/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                    : isDark
                    ? 'bg-white/[0.03] border-white/5 hover:border-white/12 hover:bg-white/[0.06]'
                    : 'bg-slate-50/70 border-slate-100 hover:border-amber-200 hover:bg-slate-50'
                }`}
              >
                {/* Selected ring glow */}
                {isSelected && (
                  <div className={`absolute inset-0 rounded-2xl blur-sm -z-10 opacity-30 ${isDark ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                )}

                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-2xl mb-1 block">{lang.flag}</span>
                    <span className={`text-lg font-black block leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lang.nativeLabel}
                    </span>
                    <span className={`text-[11px] font-semibold ${
                      isSelected
                        ? isDark ? 'text-emerald-400' : 'text-amber-700'
                        : isDark ? 'text-white/45' : 'text-slate-500'
                    }`}>
                      {lang.label} · {lang.script}
                    </span>
                  </div>
                  {isSelected
                    ? <CheckCircle2 className={`w-5 h-5 mt-1 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-amber-600'}`} />
                    : <div className={`w-5 h-5 mt-1 rounded-full border-2 flex-shrink-0 ${isDark ? 'border-white/20' : 'border-slate-300'}`} />
                  }
                </div>

                <div className={`mt-2 p-2.5 rounded-xl text-[11px] leading-relaxed italic border ${
                  isDark
                    ? 'bg-black/15 border-white/5 text-white/55'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}>
                  "{lang.sample}"
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
