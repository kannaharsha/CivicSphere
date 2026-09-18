import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Clock, FileCheck } from 'lucide-react';
import type { NotificationStatsMetrics } from './notificationTypes';

interface NotificationStatsProps {
  stats: NotificationStatsMetrics;
  isDark?: boolean;
}

export const NotificationStats: React.FC<NotificationStatsProps> = ({
  stats,
  isDark = false
}) => {
  const accent = isDark ? '#00B87C' : '#C9890A';

  const items = [
    {
      label: 'Active Deadlines',
      val: stats.activeDeadlines,
      icon: Clock,
      color: '#EF4444',
      percent: Math.min(100, stats.activeDeadlines * 20),
    },
    {
      label: 'New Schemes',
      val: stats.newSchemes,
      icon: Award,
      color: '#00B87C',
      percent: Math.min(100, stats.newSchemes * 25),
    },
    {
      label: 'Status Reminders',
      val: stats.statusReminders,
      icon: TrendingUp,
      color: '#0284C7',
      percent: Math.min(100, stats.statusReminders * 33),
    },
    {
      label: 'Document Tasks',
      val: stats.documentReminders,
      icon: FileCheck,
      color: '#7C3AED',
      percent: Math.min(100, stats.documentReminders * 33),
    },
  ];

  return (
    <div
      className="p-4 rounded-2xl border space-y-3.5 backdrop-blur-md"
      style={{
        background: isDark ? 'rgba(12, 26, 43, 0.85)' : '#FFFFFF',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(212,160,23,0.25)',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 16px rgba(0,0,0,0.04)'
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          Alert Analytics Distribution
        </span>
        <span className="text-[10px] font-bold" style={{ color: accent }}>
          Live Metrics
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <motion.div
              key={it.label}
              whileHover={{ scale: 1.02 }}
              className="p-3 rounded-xl border flex items-center gap-3 relative overflow-hidden"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : '#FAF9F6',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
              }}
            >
              {/* Circular SVG progress */}
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    stroke={it.color}
                    strokeWidth="3.5"
                    strokeDasharray={`${it.percent}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-4 h-4" style={{ color: it.color }} />
                </div>
              </div>

              <div className="space-y-0.5 min-w-0">
                <div
                  className="text-lg font-black leading-none"
                  style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                >
                  {it.val}
                </div>
                <div className="text-[10px] font-bold text-slate-400 truncate">
                  {it.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
