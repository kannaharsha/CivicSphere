import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, SlidersHorizontal, X, RotateCcw } from 'lucide-react';

export type FilterCategory = 'eligible' | 'all' | 'partial' | 'not_eligible' | 'central' | 'state' | 'women' | 'small';
export type SortOption = 'match' | 'name' | 'benefit';

interface EligibilityFiltersProps {
  activeCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  eligibleCount: number;
  partialCount: number;
  totalCount: number;
  isDark?: boolean;
}

const CHIPS: { id: FilterCategory; label: string; emoji: string; getCount?: (e: number, p: number, t: number) => number }[] = [
  { id: 'eligible', label: 'Eligible', emoji: '✅', getCount: (e) => e },
  { id: 'all', label: 'All Schemes', emoji: '📋', getCount: (_, __, t) => t },
  { id: 'partial', label: 'Partial', emoji: '⚡', getCount: (_, p) => p },
  { id: 'central', label: 'Central Schemes', emoji: '🏛️' },
  { id: 'state', label: 'State Schemes', emoji: '🗺️' },
  { id: 'women', label: 'Women Farmers', emoji: '👩‍🌾' },
  { id: 'small', label: 'Small & Marginal', emoji: '🌱' },
];

export const EligibilityFilters: React.FC<EligibilityFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  eligibleCount,
  partialCount,
  totalCount,
  isDark = false
}) => {
  const [inputFocused, setInputFocused] = useState(false);

  /* ── Design Tokens ── */
  const accent = isDark ? '#00B87C' : '#C9890A'; // Dark = Emerald, Light = Luxury Gold
  const cardBg = isDark ? 'rgba(12,26,43,0.92)' : 'rgba(255,253,247,0.98)';
  const cardBorder = isDark ? '1px solid rgba(0,184,124,0.20)' : '1px solid rgba(212,160,23,0.25)';
  const cardShadow = isDark ? '0 6px 24px rgba(0,0,0,0.30)' : '0 6px 20px rgba(212,160,23,0.08)';

  const searchBg = isDark ? 'rgba(7,18,30,0.85)' : 'rgba(255,255,255,0.98)';
  const searchBorder = isDark ? 'rgba(0,184,124,0.25)' : 'rgba(212,160,23,0.28)';
  const borderFocus = isDark ? 'rgba(0,184,124,0.60)' : 'rgba(212,160,23,0.60)';
  const focusRing = isDark ? '0 0 0 3px rgba(0,184,124,0.25)' : '0 0 0 3px rgba(212,160,23,0.22)';

  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#7A5009';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(212,160,23,0.14)';

  const chipInactiveBg = isDark ? 'rgba(12,26,43,0.88)' : 'rgba(255,255,255,0.95)';
  const chipInactiveBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(212,160,23,0.22)';

  const activeChipGradient = isDark
    ? 'linear-gradient(135deg,#00B87C,#10B981)'
    : 'linear-gradient(135deg,#C9890A,#D4A017)';
  const activeChipShadow = isDark
    ? '0 4px 14px rgba(0,184,124,0.35)'
    : '0 4px 14px rgba(201,137,10,0.30)';

  const isFilteringActive = activeCategory !== 'eligible' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    onSelectCategory('eligible');
    onSearchChange('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-4 space-y-3.5 backdrop-blur-md relative overflow-hidden"
      style={{
        background: cardBg,
        border: cardBorder,
        boxShadow: cardShadow,
      }}
    >
      {/* Header row with reset filter action */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b" style={{ borderColor: divider }}>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(0,184,124,0.14)' : 'rgba(212,160,23,0.14)',
              color: accent,
              border: `1px solid ${isDark ? 'rgba(0,184,124,0.25)' : 'rgba(212,160,23,0.25)'}`
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </motion.div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider block" style={{ color: textColor }}>
              Filter & Search Schemes
            </span>
            <span className="text-[10px] font-bold" style={{ color: textMuted }}>
              {totalCount} Total Database Schemes Evaluated
            </span>
          </div>
        </div>

        {/* Clear filter indicator button */}
        <AnimatePresence>
          {isFilteringActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              type="button"
              onClick={handleResetFilters}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-xs"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(254,243,199,0.75)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(212,160,23,0.30)'}`,
                color: accent
              }}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Search Bar + Sort Dropdown */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search input */}
        <motion.div
          className="relative flex-1"
          animate={{ boxShadow: inputFocused ? focusRing : '0 0 0 0px transparent' }}
          transition={{ duration: 0.2 }}
          style={{ borderRadius: 14 }}
        >
          <Search
            className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
            style={{ color: inputFocused ? accent : (isDark ? '#64748B' : '#9CA3AF') }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Search by scheme name, keyword, subsidy amount, ministry..."
            className="w-full pl-9 pr-8 py-2.5 rounded-[14px] text-xs font-semibold outline-none transition-all duration-200"
            style={{
              background: searchBg,
              border: `1.5px solid ${inputFocused ? borderFocus : searchBorder}`,
              color: textColor,
            }}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                type="button"
                onClick={() => onSearchChange('')}
                whileHover={{ scale: 1.15 }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-xs font-black transition-colors"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(212,160,23,0.20)',
                  color: accent
                }}
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-[14px] transition-all shadow-xs"
            style={{
              background: searchBg,
              border: `1.5px solid ${searchBorder}`,
            }}
          >
            <ArrowUpDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="text-xs font-black outline-none cursor-pointer bg-transparent"
              style={{ color: textColor }}
            >
              <option value="match" style={{ background: isDark ? '#0C1A2B' : '#FFFDF7', color: textColor }}>Highest Match</option>
              <option value="name" style={{ background: isDark ? '#0C1A2B' : '#FFFDF7', color: textColor }}>A – Z Name</option>
              <option value="benefit" style={{ background: isDark ? '#0C1A2B' : '#FFFDF7', color: textColor }}>Benefit Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Responsive Flex-Wrap Filter Chips (Zero Horizontal Scrollbar) ── */}
      <div
        className="flex flex-wrap items-center gap-2 pt-1 no-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {CHIPS.map((chip, idx) => {
          const isActive = activeCategory === chip.id;
          const count = chip.getCount ? chip.getCount(eligibleCount, partialCount, totalCount) : undefined;
          return (
            <motion.button
              key={chip.id}
              type="button"
              onClick={() => onSelectCategory(chip.id)}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03, duration: 0.3, type: 'spring', stiffness: 260, damping: 22 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-xs"
              style={{
                background: isActive ? activeChipGradient : chipInactiveBg,
                border: `1.5px solid ${isActive ? 'transparent' : chipInactiveBorder}`,
                color: isActive ? '#FFFFFF' : textColor,
                boxShadow: isActive ? activeChipShadow : 'none',
              }}
            >
              {/* Shimmer sweep on active chip */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1.8 }}
                  style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)' }}
                />
              )}

              <span className="relative z-10 leading-none">{chip.emoji}</span>
              <span className="relative z-10 leading-none">{chip.label}</span>

              {count !== undefined && (
                <span
                  className="relative z-10 text-[10px] px-1.5 py-0.5 rounded-full font-black leading-none ml-0.5"
                  style={{
                    background: isActive
                      ? 'rgba(255,255,255,0.28)'
                      : isDark
                      ? 'rgba(0,184,124,0.15)'
                      : 'rgba(254,243,199,0.95)',
                    color: isActive ? '#FFFFFF' : accent,
                    border: `1px solid ${isActive ? 'rgba(255,255,255,0.35)' : (isDark ? 'rgba(0,184,124,0.30)' : 'rgba(212,160,23,0.30)')}`
                  }}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

