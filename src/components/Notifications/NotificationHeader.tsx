import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, X } from 'lucide-react';

interface NotificationHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadCount: number;
  totalCount: number;
  isDark?: boolean;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  searchQuery,
  onSearchChange,
  unreadCount,
  totalCount,
  isDark = false
}) => {
  const accent = isDark ? '#00B87C' : '#C9890A';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="text-center space-y-4 pt-1"
    >
      {/* Centered Uppercase Pill Badge with animated bell */}
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase backdrop-blur-md shadow-xs"
        style={{
          borderColor: isDark ? 'rgba(0, 184, 124, 0.35)' : 'rgba(212, 160, 23, 0.40)',
          background: isDark ? 'rgba(0, 184, 124, 0.10)' : 'rgba(254, 243, 199, 0.90)',
          color: isDark ? '#34D399' : '#8A6210'
        }}
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Bell className="w-3.5 h-3.5" />
        </motion.div>
        <span>Government Scheme Alert Center • {unreadCount} Active Notices</span>
      </div>

      {/* Heading & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-heading leading-tight">
          <span style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
            Government Scheme{' '}
          </span>
          <span
            className={
              isDark
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00B87C] via-[#10B981] to-[#34D399]'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-[#B48418] via-[#D4A017] to-[#F59E0B]'
            }
          >
            Alert Center
          </span>
        </h1>

        <div className="flex justify-center pt-1">
          <div
            className="h-1 w-28 sm:w-36 rounded-full"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent, #00B87C, transparent)'
                : 'linear-gradient(90deg, transparent, #D4A017, transparent)'
            }}
          />
        </div>

        <p
          className="text-xs sm:text-sm max-w-xl mx-auto font-medium pt-1 leading-relaxed"
          style={{ color: isDark ? '#94A3B8' : '#7A5009' }}
        >
          Stay updated with important deadlines, scheme announcements, document reminders, and application cutoff dates directly from verified government departments.
        </p>
      </div>

      {/* Search Bar matching Explore Schemes */}
      <div className="max-w-2xl mx-auto pt-2 px-2">
        <motion.div
          whileHover={{ y: -1 }}
          className="relative rounded-full border px-3 py-1.5 flex items-center transition-all duration-200 group shadow-xs"
          style={{
            background: isDark ? 'rgba(10, 24, 38, 0.95)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(0, 184, 124, 0.28)' : 'rgba(212, 160, 23, 0.38)',
            boxShadow: isDark
              ? '0 4px 20px rgba(0,0,0,0.35)'
              : '0 4px 16px rgba(212,160,23,0.10)'
          }}
        >
          <div
            className="pl-1 pr-2.5 shrink-0"
            style={{ color: accent }}
          >
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search scheme alerts by title, keyword, ministry, or state (e.g., PM Kisan, Insurance, Andhra Pradesh)..."
            className="w-full bg-transparent text-xs sm:text-sm font-medium outline-none py-1.5 placeholder:text-slate-400 text-slate-900 dark:text-white"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mr-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div
            className="hidden sm:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0"
            style={{
              background: isDark ? 'rgba(0,184,124,0.15)' : 'rgba(254,243,199,0.95)',
              color: accent,
              border: `1px solid ${isDark ? 'rgba(0,184,124,0.30)' : 'rgba(212,160,23,0.30)'}`
            }}
          >
            {totalCount} Total
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
