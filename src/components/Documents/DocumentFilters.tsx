/**
 * CivicSphere — Document Filters
 * Animated category filter chips below the search bar.
 * No status filters — category only.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import type { DocumentCategory } from './documentTypes';

export type FilterOption = DocumentCategory | 'all' | 'priority';

const FILTERS: { id: FilterOption; label: string; color: string; darkColor: string }[] = [
  { id: 'all',         label: 'All Documents',  color: '#6B7280', darkColor: '#9CA3AF' },
  { id: 'priority',   label: '⭐ Most Required', color: '#D97706', darkColor: '#FCD34D' },
  { id: 'identity',   label: 'Identity',        color: '#3B82F6', darkColor: '#60A5FA' },
  { id: 'land',       label: 'Land Records',    color: '#D97706', darkColor: '#FCD34D' },
  { id: 'income',     label: 'Income',          color: '#7C3AED', darkColor: '#A78BFA' },
  { id: 'agriculture',label: 'Agriculture',     color: '#65A30D', darkColor: '#A3E635' },
  { id: 'banking',    label: 'Banking',         color: '#0891B2', darkColor: '#22D3EE' },
  { id: 'farmer',     label: 'Farmer',          color: '#16A34A', darkColor: '#4ADE80' },
  { id: 'social',     label: 'Social Category', color: '#DC2626', darkColor: '#FCA5A5' },
  { id: 'other',      label: 'Other',           color: '#6B7280', darkColor: '#9CA3AF' },
];

interface DocumentFiltersProps {
  activeFilter: FilterOption;
  onFilterChange: (f: FilterOption) => void;
  isDark: boolean;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  activeFilter, onFilterChange, isDark
}) => {
  const mutedColor = isDark ? '#64748B' : '#9CA3AF';

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] font-black" style={{ color: mutedColor }}>
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filter:
      </div>
      {FILTERS.map((f, i) => {
        const isActive = activeFilter === f.id;
        const color = isDark ? f.darkColor : f.color;
        return (
          <motion.button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
            whileHover={{ scale: 1.07, y: -1.5, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            whileTap={{ scale: 0.94 }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-black transition-all"
            style={{
              background: isActive
                ? isDark ? `${color}22` : `${color}18`
                : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: `1.5px solid ${isActive ? color : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
              color: isActive ? color : isDark ? '#94A3B8' : '#6B7280',
              boxShadow: isActive ? `0 2px 8px ${color}22` : 'none',
            }}
          >
            {f.label}
          </motion.button>
        );
      })}
    </div>
  );
};
