import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Flame, AlertTriangle, CalendarDays, CheckCheck, RefreshCw } from 'lucide-react';
import type { NotificationSummaryMetrics } from './notificationTypes';

interface NotificationSummaryProps {
  metrics: NotificationSummaryMetrics;
  isDark?: boolean;
  onMarkAllRead?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const NotificationSummary: React.FC<NotificationSummaryProps> = ({
  metrics,
  isDark = false,
  onMarkAllRead,
  onRefresh,
  isLoading = false
}) => {
  const accent = isDark ? '#00B87C' : '#C9890A';

  const cards = [
    {
      id: 'total',
      label: 'Total Active Alerts',
      count: metrics.totalCount,
      desc: 'Active schemes, deadlines & announcements',
      icon: Bell,
      color: isDark ? '#34D399' : '#059669',
      bg: isDark ? 'rgba(0, 184, 124, 0.12)' : 'rgba(209, 250, 229, 0.55)',
      border: isDark ? 'rgba(0, 184, 124, 0.28)' : 'rgba(5, 150, 105, 0.25)',
      topGlow: isDark ? '#00B87C' : '#059669',
    },
    {
      id: 'today',
      label: 'Deadlines Today',
      count: metrics.deadlinesTodayCount,
      desc: 'Closes tonight before 11:59 PM',
      icon: Flame,
      color: isDark ? '#F87171' : '#DC2626',
      bg: isDark ? 'rgba(239, 68, 68, 0.14)' : '#FEF2F2',
      border: isDark ? 'rgba(239, 68, 68, 0.35)' : '#FCA5A5',
      topGlow: '#EF4444',
      isPulsing: metrics.deadlinesTodayCount > 0,
    },
    {
      id: 'tomorrow',
      label: 'Deadlines Tomorrow',
      count: metrics.deadlinesTomorrowCount,
      desc: 'Final submission cutoff (24h remaining)',
      icon: AlertTriangle,
      color: isDark ? '#FB923C' : '#EA580C',
      bg: isDark ? 'rgba(249, 115, 22, 0.14)' : '#FFF7ED',
      border: isDark ? 'rgba(249, 115, 22, 0.35)' : '#FDBA74',
      topGlow: '#F97316',
    },
    {
      id: 'week',
      label: 'Upcoming This Week',
      count: metrics.upcomingThisWeekCount,
      desc: 'Welfare windows closing in next 7 days',
      icon: CalendarDays,
      color: isDark ? '#FCD34D' : '#C9890A',
      bg: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FFFDF0',
      border: isDark ? 'rgba(245, 158, 11, 0.28)' : 'rgba(212, 160, 23, 0.35)',
      topGlow: isDark ? '#F59E0B' : '#C9890A',
    }
  ];

  return (
    <div className="space-y-3">
      {/* Quick Action Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-black uppercase tracking-wider"
            style={{ color: isDark ? '#34D399' : '#8A6210' }}
          >
            Real-Time Alert Summary
          </span>
          {metrics.unreadCount > 0 && (
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold"
              style={{
                background: isDark ? 'rgba(0,184,124,0.18)' : 'rgba(254,243,199,0.95)',
                color: isDark ? '#34D399' : '#8A6210',
                border: `1px solid ${isDark ? 'rgba(0,184,124,0.35)' : 'rgba(212,160,23,0.38)'}`
              }}
            >
              {metrics.unreadCount} Unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <motion.button
              type="button"
              onClick={onRefresh}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shadow-xs cursor-pointer"
              style={{
                background: isDark ? 'rgba(10,24,36,0.85)' : '#FFFDF7',
                borderColor: isDark ? 'rgba(0,184,124,0.25)' : 'rgba(212,160,23,0.28)',
                color: isDark ? '#CBD5E1' : '#7A5009'
              }}
              title="Refresh notifications"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} style={{ color: accent }} />
              <span>Sync Alerts</span>
            </motion.button>
          )}

          {onMarkAllRead && metrics.unreadCount > 0 && (
            <motion.button
              type="button"
              onClick={onMarkAllRead}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shadow-xs cursor-pointer"
              style={{
                background: isDark ? 'rgba(0,184,124,0.12)' : 'rgba(254,243,199,0.90)',
                borderColor: isDark ? 'rgba(0,184,124,0.30)' : 'rgba(212,160,23,0.40)',
                color: isDark ? '#34D399' : '#8A6210'
              }}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* 4 Independent Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: i * 0.06,
                type: 'spring',
                stiffness: 240,
                damping: 22
              }}
              whileHover={{
                y: -3,
                scale: 1.02,
                boxShadow: isDark
                  ? '0 10px 28px -4px rgba(0, 0, 0, 0.50), 0 0 20px rgba(0, 184, 124, 0.15)'
                  : '0 10px 24px -4px rgba(212, 160, 23, 0.18), 0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: { duration: 0.2, ease: 'easeOut' }
              }}
              className="p-4 rounded-2xl border relative overflow-hidden backdrop-blur-md cursor-default group"
              style={{
                background: isDark ? 'rgba(10, 24, 38, 0.92)' : '#FFFFFF',
                borderColor: isDark ? c.border : 'rgba(212, 160, 23, 0.24)',
                boxShadow: isDark
                  ? '0 4px 20px rgba(0,0,0,0.30)'
                  : '0 4px 16px rgba(212,160,23,0.06)'
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: c.topGlow }}
              />

              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-xs"
                  style={{
                    background: c.bg,
                    color: c.color,
                    border: `1px solid ${c.border}`
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {c.isPulsing && (
                  <motion.span
                    animate={{ scale: [1, 1.4, 1], opacity: [0.9, 0.4, 0.9] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full inline-block mt-1"
                    style={{ background: c.color }}
                  />
                )}
              </div>

              <div className="space-y-1">
                <div
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                >
                  {c.count}
                </div>
                <div
                  className="text-xs font-black tracking-tight"
                  style={{ color: isDark ? '#E2E8F0' : '#1E293B' }}
                >
                  {c.label}
                </div>
                <p
                  className="text-[11px] line-clamp-1 font-medium"
                  style={{ color: isDark ? '#94A3B8' : '#7A5009' }}
                >
                  {c.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
