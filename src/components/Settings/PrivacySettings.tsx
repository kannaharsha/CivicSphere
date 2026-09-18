import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, BarChart2, BookmarkCheck, Trash2, Lock } from 'lucide-react';
import { SettingToggle } from './SettingToggle';
import type { UserSettings } from './settingsTypes';

interface PrivacySettingsProps {
  isDark?: boolean;
  settings: UserSettings;
  onUpdate: (key: keyof UserSettings, value: boolean) => void;
  onRequestClearCache: () => void;
}

const PRIVACY_ITEMS = [
  {
    key: 'personalized_recommendations' as keyof UserSettings,
    icon: Sparkles,
    iconColor: 'text-amber-400',
    label: 'Allow Personalized Scheme Recommendations',
    desc: 'Uses land size, crops, and farmer category to surface high-relevance welfare programs',
  },
  {
    key: 'anonymous_analytics' as keyof UserSettings,
    icon: BarChart2,
    iconColor: 'text-sky-400',
    label: 'Share Anonymous Usage Analytics',
    desc: 'Helps state agricultural departments identify scheme awareness gaps (no PII shared)',
  },
  {
    key: 'remember_preferences' as keyof UserSettings,
    icon: BookmarkCheck,
    iconColor: 'text-emerald-400',
    label: 'Remember Eligibility Preferences',
    desc: 'Keeps your landholding and category pre-filled in the Eligibility Calculator',
  },
];

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  isDark = true,
  settings,
  onUpdate,
  onRequestClearCache,
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
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />

      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
          }`}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Privacy & Security
            </h2>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              CivicSphere never stores sensitive Aadhaar credentials
            </p>
          </div>
        </div>

        {/* Zero Aadhaar Policy Banner */}
        <div className={`flex items-start gap-3 p-3.5 rounded-2xl mb-5 border ${
          isDark
            ? 'bg-emerald-500/8 border-emerald-500/20'
            : 'bg-emerald-50 border-emerald-200'
        }`}>
          <Lock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <p className={`text-xs leading-relaxed ${isDark ? 'text-emerald-300/80' : 'text-emerald-800'}`}>
            <strong>Zero Aadhaar Storage Policy:</strong> Full Aadhaar numbers and biometric tokens are never retained. Only citizen attributes (state, district, occupation) are stored to match relevant benefits.
          </p>
        </div>

        {/* Toggle items */}
        <div className="space-y-1">
          {PRIVACY_ITEMS.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 px-2 py-1 rounded-2xl transition-colors ${
                isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${item.iconColor}`} />
              <div className="flex-1">
                <SettingToggle
                  id={`toggle-${item.key}`}
                  label={item.label}
                  description={item.desc}
                  checked={settings[item.key] as boolean}
                  onChange={(val) => onUpdate(item.key, val)}
                  isDark={isDark}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Clear Cache Action */}
        <div className={`mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border ${
          isDark ? 'bg-rose-500/5 border-rose-500/15' : 'bg-rose-50 border-rose-200'
        }`}>
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-rose-300' : 'text-rose-800'}`}>
              Clear Cached Recommendation History
            </p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-rose-600/70'}`}>
              Removes locally stored eligibility evaluations and scheme recommendation cache
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onRequestClearCache}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cache
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
