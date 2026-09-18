import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Users } from 'lucide-react';

export type EligibilityMode = 'my_eligibility' | 'another_person';

interface EligibilityTabsProps {
  activeMode: EligibilityMode;
  onSelectMode: (mode: EligibilityMode) => void;
  isDark?: boolean;
}

const TABS = [
  { id: 'my_eligibility' as EligibilityMode, label: 'My Eligibility', icon: UserCheck },
  { id: 'another_person' as EligibilityMode, label: 'Check Another', icon: Users },
];

export const EligibilityTabs: React.FC<EligibilityTabsProps> = ({
  activeMode,
  onSelectMode,
  isDark = false
}) => {
  // Light = warm luxury gold   Dark = CivicSphere emerald
  const accent = isDark ? '#00B87C' : '#C9890A';
  const bg = isDark ? 'rgba(11,23,38,0.92)' : 'rgba(255,251,235,0.90)';
  const border = isDark ? 'rgba(0,184,124,0.18)' : 'rgba(212,160,23,0.22)';
  const activeBg = isDark ? 'rgba(15,31,51,0.96)' : 'rgba(255,255,255,0.98)';
  const inactiveText = isDark ? '#94A3B8' : '#78716C';

  return (
    <div
      className="inline-flex p-1.5 rounded-2xl gap-1 relative"
      style={{ background: bg, border: `1px solid ${border}`, backdropFilter: 'blur(12px)' }}
    >
      {TABS.map((tab) => {
        const isActive = activeMode === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectMode(tab.id)}
            className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black transition-colors duration-200 z-10"
            style={{ color: isActive ? accent : inactiveText }}
          >
            {/* Sliding active pill */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="eligibility-tab-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: activeBg,
                    boxShadow: isDark
                      ? '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,184,124,0.25)'
                      : '0 4px 12px rgba(212,160,23,0.14), 0 0 0 1px rgba(212,160,23,0.20)',
                  }}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={{ scale: isActive ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <Icon className="w-3 h-3 relative z-10" />
            </motion.div>
            <span className="relative z-10 whitespace-nowrap">{tab.label}</span>

            {/* Active glow dot */}
            {isActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="relative z-10 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: accent, boxShadow: `0 0 5px ${accent}` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
