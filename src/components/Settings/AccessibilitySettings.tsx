import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Type, Contrast, ZapOff, Volume2, MoveHorizontal } from 'lucide-react';
import { SettingToggle } from './SettingToggle';
import type { UserSettings } from './settingsTypes';

interface AccessibilitySettingsProps {
  isDark?: boolean;
  settings: UserSettings;
  onUpdate: (key: keyof UserSettings, value: boolean) => void;
}

const ITEMS = [
  {
    key: 'larger_text' as keyof UserSettings,
    icon: Type,
    iconColor: 'text-sky-400',
    label: 'Larger Text',
    desc: 'Increases body and heading font sizes for easier reading',
  },
  {
    key: 'high_contrast' as keyof UserSettings,
    icon: Contrast,
    iconColor: 'text-violet-400',
    label: 'High Contrast Mode',
    desc: 'Sharpens contrast between text and backgrounds to improve readability',
  },
  {
    key: 'reduce_motion' as keyof UserSettings,
    icon: ZapOff,
    iconColor: 'text-amber-400',
    label: 'Reduce Animations',
    desc: 'Disables floating banners, parallax elements, and dynamic transitions',
  },
  {
    key: 'screen_reader_mode' as keyof UserSettings,
    icon: Volume2,
    iconColor: 'text-teal-400',
    label: 'Screen Reader Friendly Mode',
    desc: 'Enhances ARIA labels, descriptive text, and simplifies complex table structures',
  },
  {
    key: 'larger_buttons' as keyof UserSettings,
    icon: MoveHorizontal,
    iconColor: 'text-emerald-400',
    label: 'Larger Touch & Click Targets',
    desc: 'Increases button padding and interactive click hitboxes for easy touch interaction',
  },
];

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  isDark = true,
  settings,
  onUpdate,
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
      <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-violet-500 to-purple-500" />

      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20' : 'bg-violet-500/10 text-violet-700 border border-violet-500/20'
          }`}>
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Accessibility Options
            </h2>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Inclusive controls designed for all citizens and abilities
            </p>
          </div>
        </div>

        <div className="space-y-1">
          {ITEMS.map((item, i) => (
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
      </div>
    </motion.div>
  );
};
