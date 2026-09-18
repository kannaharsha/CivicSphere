import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import type { SchemeNotification } from './notificationTypes';

interface NotificationCalendarProps {
  notifications: SchemeNotification[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
  isDark?: boolean;
}

export const NotificationCalendar: React.FC<NotificationCalendarProps> = ({
  notifications,
  selectedDate,
  onSelectDate,
  isDark = false
}) => {
  const accent = isDark ? '#00B87C' : '#C9890A';

  // Build 7 days of the current week starting from today
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-IN', { month: 'short' });

    // Find notifications having deadlines on this day
    const matchingNotifs = notifications.filter(n => {
      if (!n.deadline_date) return false;
      return n.deadline_date.startsWith(dateKey);
    });

    return {
      dateKey,
      dayName,
      dayNum,
      monthName,
      isToday: i === 0,
      count: matchingNotifs.length,
      hasUrgent: matchingNotifs.some(n => n.priority === 'urgent' || n.notification_type === 'deadline_today'),
    };
  });

  return (
    <div
      className="p-4 rounded-2xl border space-y-3 relative overflow-hidden backdrop-blur-md"
      style={{
        background: isDark ? 'rgba(12, 26, 43, 0.85)' : '#FFFFFF',
        borderColor: isDark ? 'rgba(0, 184, 124, 0.20)' : 'rgba(212, 160, 23, 0.25)',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 16px rgba(0,0,0,0.04)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: accent }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
            This Week Deadline Calendar
          </span>
        </div>

        {selectedDate && (
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="text-[11px] font-black underline cursor-pointer"
            style={{ color: accent }}
          >
            Clear Date Filter
          </button>
        )}
      </div>

      {/* 7 Days Strip */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysOfWeek.map((day) => {
          const isSelected = selectedDate === day.dateKey;
          const hasDeadlines = day.count > 0;

          return (
            <motion.button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : day.dateKey)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer relative"
              style={{
                background: isSelected
                  ? isDark ? '#00B87C' : '#C9890A'
                  : day.isToday
                  ? isDark ? 'rgba(0,184,124,0.12)' : 'rgba(254,243,199,0.85)'
                  : isDark ? 'rgba(255,255,255,0.03)' : '#FAF9F6',
                borderColor: isSelected
                  ? isDark ? '#00B87C' : '#C9890A'
                  : day.isToday
                  ? isDark ? 'rgba(0,184,124,0.30)' : 'rgba(212,160,23,0.40)'
                  : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                color: isSelected ? '#FFFFFF' : isDark ? '#E2E8F0' : '#1E293B',
              }}
            >
              <span className="text-[10px] font-bold text-slate-400">
                {day.dayName}
              </span>

              <span className="text-sm font-black my-0.5">
                {day.dayNum}
              </span>

              {/* Deadline Dot or Count */}
              {hasDeadlines ? (
                <span
                  className="text-[9px] font-black px-1.5 py-0.2 rounded-full mt-0.5"
                  style={{
                    background: isSelected
                      ? 'rgba(0,0,0,0.30)'
                      : day.hasUrgent ? '#EF4444' : isDark ? '#00B87C' : '#C9890A',
                    color: '#FFFFFF'
                  }}
                >
                  {day.count} {day.count === 1 ? 'due' : 'dues'}
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 mt-0.5">•</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
