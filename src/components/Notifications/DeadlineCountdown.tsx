import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Flame } from 'lucide-react';
import type { SchemeNotification } from './notificationTypes';

interface DeadlineCountdownProps {
  notification: SchemeNotification;
  isDark?: boolean;
}

export const DeadlineCountdown: React.FC<DeadlineCountdownProps> = ({
  notification,
  isDark = false
}) => {
  const { daysRemaining, hoursRemaining, notification_type } = notification;

  if (daysRemaining === undefined) return null;

  // 1. Deadline Today
  if (notification_type === 'deadline_today' || daysRemaining <= 0) {
    const displayHours = hoursRemaining ?? 6;
    return (
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border"
          style={{
            background: isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEF2F2',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.40)' : '#FCA5A5',
            color: isDark ? '#FCA5A5' : '#DC2626',
            boxShadow: isDark ? '0 0 14px rgba(239,68,68,0.30)' : '0 1px 4px rgba(220,38,38,0.15)'
          }}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>Ends Today ({displayHours}h Left)</span>
        </motion.div>

        {/* Urgent Progress indicator */}
        <div
          className="hidden sm:block w-20 h-1.5 rounded-full overflow-hidden"
          style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
        >
          <motion.div
            initial={{ width: '10%' }}
            animate={{ width: '92%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-rose-500"
          />
        </div>
      </div>
    );
  }

  // 2. Deadline Tomorrow
  if (notification_type === 'deadline_tomorrow' || daysRemaining === 1) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border"
          style={{
            background: isDark ? 'rgba(249, 115, 22, 0.16)' : '#FFF7ED',
            borderColor: isDark ? 'rgba(249, 115, 22, 0.40)' : '#FDBA74',
            color: isDark ? '#FDBA74' : '#EA580C',
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
          <span>Ends Tomorrow</span>
        </div>

        <div
          className="hidden sm:block w-20 h-1.5 rounded-full overflow-hidden"
          style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
        >
          <div className="h-full rounded-full bg-orange-500 w-3/4" />
        </div>
      </div>
    );
  }

  // 3. Upcoming Deadline (N days remaining)
  const isUrgentWindow = daysRemaining <= 3;
  const badgeColor = isUrgentWindow
    ? isDark ? '#FCD34D' : '#D97706'
    : isDark ? '#34D399' : '#059669';

  const badgeBg = isUrgentWindow
    ? isDark ? 'rgba(245, 158, 11, 0.14)' : '#FFFBEB'
    : isDark ? 'rgba(0, 184, 124, 0.12)' : '#ECFDF5';

  const badgeBorder = isUrgentWindow
    ? isDark ? 'rgba(245, 158, 11, 0.35)' : '#FDE68A'
    : isDark ? 'rgba(0, 184, 124, 0.30)' : '#A7F3D0';

  const progressPercent = Math.max(15, Math.min(100, Math.round((1 - daysRemaining / 15) * 100)));

  return (
    <div className="flex items-center gap-2">
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border"
        style={{
          background: badgeBg,
          borderColor: badgeBorder,
          color: badgeColor,
        }}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>{daysRemaining} Days Left</span>
      </div>

      <div
        className="hidden sm:block w-20 h-1.5 rounded-full overflow-hidden"
        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            background: badgeColor,
          }}
        />
      </div>
    </div>
  );
};
