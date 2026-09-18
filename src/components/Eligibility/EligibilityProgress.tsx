import React from 'react';
import { motion } from 'framer-motion';

interface EligibilityProgressProps {
  score: number;
  category: 'eligible' | 'partial' | 'not_eligible';
  matchedCount: number;
  totalCount: number;
  size?: number;
  isDark?: boolean;
  delay?: number;
}

export const EligibilityProgress: React.FC<EligibilityProgressProps> = ({
  score,
  category,
  matchedCount,
  totalCount,
  size = 68,
  isDark = false,
  delay = 0.15
}) => {
  const strokeWidth = 5.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorMap = {
    eligible: { track: isDark ? '#00B87C' : '#059669', glow: isDark ? 'rgba(0,184,124,0.45)' : 'rgba(5,150,105,0.35)', label: '✅ Qualified', trackBg: isDark ? 'rgba(0,184,124,0.10)' : 'rgba(5,150,105,0.08)' },
    partial: { track: '#F59E0B', glow: 'rgba(245,158,11,0.40)', label: '⚡ Partial', trackBg: isDark ? 'rgba(245,158,11,0.10)' : 'rgba(245,158,11,0.07)' },
    not_eligible: { track: isDark ? '#F87171' : '#EF4444', glow: 'rgba(239,68,68,0.35)', label: '✖ Ineligible', trackBg: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)' },
  };

  const c = colorMap[category];
  const mutedColor = isDark ? '#64748B' : '#9CA3AF';

  return (
    <div className="flex items-center gap-3">
      {/* Circular gauge */}
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 18px ${c.glow}`,
            opacity: category === 'eligible' ? 0.8 : 0.5,
          }}
        />

        <svg width={size} height={size} className="transform -rotate-90" style={{ filter: `drop-shadow(0 0 6px ${c.glow})` }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={c.track}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            fill="transparent"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: delay }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            className="font-black text-sm leading-none"
            style={{ color: c.track }}
          >
            {score}%
          </motion.span>
        </div>
      </div>

      {/* Label */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-black uppercase tracking-wide" style={{ color: c.track }}>
          {category === 'eligible' ? '100% Qualified' : category === 'partial' ? 'Partially Meets' : 'Does Not Qualify'}
        </span>
        <span className="text-[11px] font-medium" style={{ color: mutedColor }}>
          {matchedCount} of {totalCount || matchedCount} criteria met
        </span>
        {/* Progress bar mini */}
        <div className="w-20 h-1 rounded-full mt-1" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: delay + 0.1 }}
            style={{ background: `linear-gradient(90deg,${c.track},${c.track}bb)` }}
          />
        </div>
      </div>
    </div>
  );
};
