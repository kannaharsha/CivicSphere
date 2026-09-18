/**
 * CivicSphere — Document Categories
 * Animated category filter cards — each independently animated.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  IdCard, Tractor, Map, IndianRupee,
  Landmark, Wheat, Users, FileText
} from 'lucide-react';
import type { DocumentCategory } from './documentTypes';
import { DOCUMENT_CATEGORIES, GOVERNMENT_DOCUMENTS } from './documentData';

const ICON_MAP: Record<string, React.ElementType> = {
  IdCard, Tractor, Map, IndianRupee, Landmark, Wheat, Users, FileText,
};

interface DocumentCategoriesProps {
  activeCategory: DocumentCategory | 'all';
  onSelect: (cat: DocumentCategory | 'all') => void;
  isDark: boolean;
}

export const DocumentCategories: React.FC<DocumentCategoriesProps> = ({
  activeCategory, onSelect, isDark
}) => {
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#6B7280';
  const cardBg = isDark ? 'rgba(9,19,33,0.90)' : 'rgba(255,255,255,0.96)';
  const accent = isDark ? '#00B87C' : '#D4A537';

  const categoryCounts = DOCUMENT_CATEGORIES.map(cat => ({
    ...cat,
    count: GOVERNMENT_DOCUMENTS.filter(d => d.category === cat.id).length,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full" style={{ background: accent }} />
        <h2 className="text-sm font-black" style={{ color: textColor }}>
          Browse by Category
        </h2>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
      >
        {/* All category pill */}
        <motion.button
          type="button"
          onClick={() => onSelect('all')}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0, type: 'spring', stiffness: 260, damping: 24 }}
          whileHover={{ y: -3, scale: 1.05, transition: { type: 'spring', stiffness: 380, damping: 24 } }}
          whileTap={{ scale: 0.96 }}
          className="flex-shrink-0 rounded-2xl p-4 text-left min-w-[120px] relative overflow-hidden"
          style={{
            scrollSnapAlign: 'start',
            background: activeCategory === 'all'
              ? isDark ? 'linear-gradient(135deg,#00B87C,#059669)' : 'linear-gradient(135deg,#D4A537,#F59E0B)'
              : cardBg,
            border: `1.5px solid ${activeCategory === 'all' ? accent : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
            backdropFilter: 'blur(14px)',
            boxShadow: activeCategory === 'all' ? `0 8px 24px ${accent}30` : 'none',
          }}
        >
          {activeCategory === 'all' && (
            <div className="absolute inset-0 rounded-2xl"
              style={{ background: 'radial-gradient(ellipse at 30% 20%,rgba(255,255,255,0.18) 0%,transparent 65%)' }} />
          )}
          <div className="w-7 h-7 rounded-xl flex items-center justify-center mb-2 relative z-10"
            style={{ background: activeCategory === 'all' ? 'rgba(255,255,255,0.22)' : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}>
            <FileText className="w-3.5 h-3.5" style={{ color: activeCategory === 'all' ? '#FFFFFF' : mutedColor }} />
          </div>
          <div className="text-xs font-black relative z-10" style={{ color: activeCategory === 'all' ? '#FFFFFF' : textColor }}>All</div>
          <div className="text-[10px] font-bold mt-0.5 relative z-10" style={{ color: activeCategory === 'all' ? 'rgba(255,255,255,0.75)' : mutedColor }}>
            {GOVERNMENT_DOCUMENTS.length} docs
          </div>
        </motion.button>

        {/* Category cards */}
        {categoryCounts.map((cat, i) => {
          const Icon = ICON_MAP[cat.iconName] || FileText;
          const isActive = activeCategory === cat.id;
          const color = isDark ? cat.darkColor : cat.color;

          return (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (i + 1) * 0.05, type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ y: -3, scale: 1.05, transition: { type: 'spring', stiffness: 380, damping: 24 } }}
              whileTap={{ scale: 0.96 }}
              className="flex-shrink-0 rounded-2xl p-4 text-left min-w-[145px] relative overflow-hidden"
              style={{
                scrollSnapAlign: 'start',
                background: isActive
                  ? `linear-gradient(135deg,${color},${color}BB)`
                  : cardBg,
                border: `1.5px solid ${isActive ? color : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                backdropFilter: 'blur(14px)',
                boxShadow: isActive ? `0 8px 24px ${color}35` : 'none',
              }}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 30% 20%,rgba(255,255,255,0.20) 0%,transparent 65%)' }} />
              )}
              <div className="w-7 h-7 rounded-xl flex items-center justify-center mb-2 relative z-10"
                style={{ background: isActive ? 'rgba(255,255,255,0.22)' : `${color}18`, border: isActive ? 'none' : `1px solid ${color}25` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#FFFFFF' : color }} />
              </div>
              <div className="text-xs font-black leading-snug relative z-10" style={{ color: isActive ? '#FFFFFF' : textColor }}>
                {cat.label}
              </div>
              <div className="text-[10px] font-bold mt-0.5 relative z-10" style={{ color: isActive ? 'rgba(255,255,255,0.70)' : mutedColor }}>
                {cat.count} document{cat.count !== 1 ? 's' : ''}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
