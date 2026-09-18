import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import type { NotificationCategory, PriorityLevel } from './notificationTypes';

interface NotificationFiltersProps {
  activeCategory: NotificationCategory;
  onSelectCategory: (cat: NotificationCategory) => void;
  selectedPriority: PriorityLevel | 'all';
  onSelectPriority: (p: PriorityLevel | 'all') => void;
  selectedState: string;
  onSelectState: (s: string) => void;
  onResetFilters: () => void;
  isDark?: boolean;
  categoryCounts: Record<NotificationCategory, number>;
}

const CATEGORY_CHIPS: Array<{ id: NotificationCategory; label: string; icon: string }> = [
  { id: 'all', label: 'All Alerts', icon: '📋' },
  { id: 'deadlines', label: 'Deadlines', icon: '🚨' },
  { id: 'upcoming_deadlines', label: 'Upcoming', icon: '⏳' },
  { id: 'new_schemes', label: 'New Schemes', icon: '✨' },
  { id: 'status_updates', label: 'Status Updates', icon: '💳' },
  { id: 'document_reminders', label: 'Documents', icon: '📑' },
  { id: 'announcements', label: 'Announcements', icon: '📢' },
  { id: 'completed', label: 'Read / Past', icon: '✅' },
];

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  selectedPriority,
  onSelectPriority,
  selectedState,
  onSelectState,
  onResetFilters,
  isDark = false,
  categoryCounts
}) => {
  const accent = isDark ? '#00B87C' : '#C9890A';

  const isFilteringActive = activeCategory !== 'all' || selectedPriority !== 'all' || selectedState !== 'all';

  return (
    <div className="space-y-3.5">
      {/* ── Category Chips Row ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none select-none">
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = activeCategory === chip.id;
          const count = categoryCounts[chip.id] || 0;

          return (
            <motion.button
              key={chip.id}
              type="button"
              onClick={() => onSelectCategory(chip.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border transition-all whitespace-nowrap cursor-pointer shrink-0"
              style={{
                background: isActive
                  ? isDark
                    ? 'linear-gradient(135deg, #00B87C 0%, #10B981 100%)'
                    : 'linear-gradient(135deg, #C9890A 0%, #D4A017 100%)'
                  : isDark
                    ? 'rgba(10, 24, 38, 0.85)'
                    : '#FFFFFF',
                borderColor: isActive
                  ? isDark ? '#00B87C' : '#C9890A'
                  : isDark ? 'rgba(0, 184, 124, 0.20)' : 'rgba(212, 160, 23, 0.30)',
                color: isActive
                  ? '#FFFFFF'
                  : isDark ? '#E2E8F0' : '#475569',
                boxShadow: isActive
                  ? isDark
                    ? '0 4px 14px rgba(0, 184, 124, 0.35)'
                    : '0 4px 14px rgba(201, 137, 10, 0.30)'
                  : 'none'
              }}
            >
              <span>{chip.icon}</span>
              <span>{chip.label}</span>
              <span
                className="px-1.5 py-0.2 text-[10px] rounded-full font-bold ml-0.5"
                style={{
                  background: isActive
                    ? 'rgba(0,0,0,0.25)'
                    : isDark ? 'rgba(0,184,124,0.18)' : 'rgba(212,160,23,0.14)',
                  color: isActive
                    ? '#FFFFFF'
                    : isDark ? '#34D399' : '#8A6210'
                }}
              >
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Secondary Filter Dropdowns & Reset ── */}
      <div
        className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border flex-wrap backdrop-blur-md"
        style={{
          background: isDark ? 'rgba(10, 24, 38, 0.85)' : '#FFFDF7',
          borderColor: isDark ? 'rgba(0, 184, 124, 0.20)' : 'rgba(212, 160, 23, 0.28)',
          boxShadow: isDark
            ? '0 4px 16px rgba(0,0,0,0.25)'
            : '0 4px 16px rgba(212,160,23,0.06)'
        }}
      >
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-black">
            <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: accent }} />
            <span style={{ color: isDark ? '#E2E8F0' : '#1E293B' }}>Refine Feed:</span>
          </div>

          {/* Priority Select */}
          <div className="flex items-center gap-1.5">
            <span
              className="text-[11px] font-bold"
              style={{ color: isDark ? '#94A3B8' : '#7A5009' }}
            >
              Priority:
            </span>
            <select
              value={selectedPriority}
              onChange={(e) => onSelectPriority(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold border outline-none cursor-pointer"
              style={{
                background: isDark ? '#071822' : '#FFFFFF',
                borderColor: isDark ? 'rgba(0,184,124,0.30)' : 'rgba(212,160,23,0.35)',
                color: isDark ? '#FFFFFF' : '#0F172A'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Alerts (Red)</option>
              <option value="high">High Priority (Orange)</option>
              <option value="medium">Standard (Green)</option>
              <option value="low">Notice (Gold / Neutral)</option>
            </select>
          </div>

          {/* State Select */}
          <div className="flex items-center gap-1.5">
            <span
              className="text-[11px] font-bold"
              style={{ color: isDark ? '#94A3B8' : '#7A5009' }}
            >
              Region:
            </span>
            <select
              value={selectedState}
              onChange={(e) => onSelectState(e.target.value)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold border outline-none cursor-pointer"
              style={{
                background: isDark ? '#071822' : '#FFFFFF',
                borderColor: isDark ? 'rgba(0,184,124,0.30)' : 'rgba(212,160,23,0.35)',
                color: isDark ? '#FFFFFF' : '#0F172A'
              }}
            >
              <option value="all">All Regions</option>
              <option value="All India">Central (Pan-India)</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>
        </div>

        {/* Reset Filter action */}
        {isFilteringActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            type="button"
            onClick={onResetFilters}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black transition-colors cursor-pointer"
            style={{
              background: isDark ? 'rgba(0,184,124,0.14)' : 'rgba(254,243,199,0.95)',
              color: accent,
              border: `1px solid ${isDark ? 'rgba(0,184,124,0.35)' : 'rgba(212,160,23,0.40)'}`
            }}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};
