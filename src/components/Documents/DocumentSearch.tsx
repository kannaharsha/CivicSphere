/**
 * CivicSphere — Document Search Bar
 * Glassmorphism search — reads document info by name, scheme, or category.
 * No status filters — informational only.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface DocumentSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDark: boolean;
  accentColor: string;
  resultCount: number;
}

export const DocumentSearch: React.FC<DocumentSearchProps> = ({
  searchQuery, onSearchChange, isDark, accentColor, resultCount
}) => {
  const borderColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const mutedColor = isDark ? '#64748B' : '#9CA3AF';

  return (
    <div className="relative">
      {/* Search icon */}
      <motion.div
        animate={{ color: searchQuery ? accentColor : mutedColor }}
        transition={{ duration: 0.2 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
      >
        <Search className="w-4 h-4" />
      </motion.div>

      <input
        type="text"
        placeholder="Search by document name, scheme, or category..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full h-12 pl-11 pr-14 rounded-2xl text-sm font-medium outline-none transition-all"
        style={{
          background: isDark ? 'rgba(9,19,33,0.90)' : 'rgba(255,255,255,0.97)',
          border: `1.5px solid ${searchQuery ? accentColor + '55' : borderColor}`,
          backdropFilter: 'blur(16px)',
          color: isDark ? '#FFFFFF' : '#0F172A',
          boxShadow: searchQuery
            ? `0 0 0 3px ${accentColor}12, 0 4px 16px rgba(0,0,0,0.10)`
            : '0 2px 12px rgba(0,0,0,0.06)',
        }}
      />

      {/* Result count badge */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          className="absolute right-11 top-1/2 -translate-y-1/2 text-[10px] font-black px-2 py-0.5 rounded-full"
          style={{
            background: isDark ? `${accentColor}1C` : `${accentColor}14`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
          }}
        >
          {resultCount}
        </motion.div>
      )}

      {/* Clear button */}
      {searchQuery && (
        <motion.button
          type="button"
          onClick={() => onSearchChange('')}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)' }}
        >
          <X className="w-3.5 h-3.5" style={{ color: isDark ? '#94A3B8' : '#6B7280' }} />
        </motion.button>
      )}
    </div>
  );
};
