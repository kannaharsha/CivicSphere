import React from 'react';
import { motion } from 'framer-motion';
import { BellOff, CheckCircle2, RotateCcw } from 'lucide-react';

interface EmptyNotificationStateProps {
  isDark?: boolean;
  onResetFilters?: () => void;
  hasFiltersActive?: boolean;
}

export const EmptyNotificationState: React.FC<EmptyNotificationStateProps> = ({
  isDark = false,
  onResetFilters,
  hasFiltersActive = false
}) => {
  const accent = isDark ? '#00B87C' : '#C9890A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="p-8 sm:p-12 rounded-3xl border text-center space-y-4 max-w-lg mx-auto backdrop-blur-md"
      style={{
        background: isDark ? 'rgba(12, 26, 43, 0.75)' : '#FFFFFF',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(212, 160, 23, 0.25)',
        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 10px 30px rgba(212,160,23,0.08)'
      }}
    >
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-inner"
        style={{
          background: isDark ? 'rgba(0,184,124,0.12)' : 'rgba(254,243,199,0.85)',
          color: accent,
          border: `1.5px solid ${isDark ? 'rgba(0,184,124,0.30)' : 'rgba(212,160,23,0.35)'}`
        }}
      >
        <BellOff className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3
          className="text-lg font-black tracking-tight"
          style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
        >
          {hasFiltersActive ? 'No Matching Notifications Found' : "You're All Caught Up!"}
        </h3>
        <p className="text-xs sm:text-[13px] leading-relaxed text-slate-400 max-w-sm mx-auto font-medium">
          {hasFiltersActive
            ? 'No alerts match your current search, priority, or region filters. Try clearing or expanding your criteria.'
            : 'There are no active scheme deadline alerts, status updates, or document reminders requiring your attention today.'}
        </p>
      </div>

      {hasFiltersActive && onResetFilters && (
        <div className="pt-2">
          <motion.button
            type="button"
            onClick={onResetFilters}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white transition-all shadow-md"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #00B87C 0%, #10B981 100%)'
                : 'linear-gradient(135deg, #C9890A 0%, #D4A017 100%)',
              boxShadow: isDark
                ? '0 4px 14px rgba(0,184,124,0.35)'
                : '0 4px 14px rgba(201,137,10,0.30)'
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Active Filters</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};
