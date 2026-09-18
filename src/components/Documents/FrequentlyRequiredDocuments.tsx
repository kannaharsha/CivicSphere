/**
 * CivicSphere — Frequently Required Documents
 * Horizontal scroll section highlighting the most commonly needed documents.
 * High-end digital ID card aesthetic with rich graphics, glowing accents, and smooth individual animations.
 */

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  IdCard, Tractor, BookMarked, Leaf, Landmark,
  IndianRupee, FileCheck, Map, FileText, Clock,
  Building2, Sparkles, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import type { GovernmentDocument } from './documentTypes';

const ICON_MAP: Record<string, React.ElementType> = {
  IdCard, Tractor, BookMarked, Leaf, Landmark, IndianRupee, FileCheck, Map, FileText,
};

interface FrequentlyRequiredDocumentsProps {
  docs: GovernmentDocument[];
  isDark: boolean;
  accentColor: string;
  onViewDoc?: (docId: string) => void;
}

export const FrequentlyRequiredDocuments: React.FC<FrequentlyRequiredDocumentsProps> = ({
  docs, isDark, accentColor, onViewDoc
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const priorityDocs = docs.filter(d => d.isMostRequired);
  if (priorityDocs.length === 0) return null;

  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const headingColor = isDark ? '#F1F5F9' : '#1E293B';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const subtleColor = isDark ? '#64748B' : '#94A3B8';
  const cardBg = isDark 
    ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 17, 30, 0.95) 100%)' 
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const badgeBg = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';
  const badgeBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 py-2">
      {/* Header section with badge & scroll navigation */}
      <div className="flex items-end justify-between px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span 
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
              style={{
                background: `${accentColor}15`,
                color: accentColor,
                border: `1px solid ${accentColor}30`,
              }}
            >
              <Sparkles className="w-3 h-3" />
              Essential Checklist
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2" style={{ color: headingColor }}>
            Frequently Required Documents
          </h2>
          <p className="text-xs max-w-xl" style={{ color: mutedColor }}>
            Core official records requested across most state and central agriculture welfare schemes.
          </p>
        </div>

        {/* Scroll action buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
              border: `1px solid ${cardBorder}`,
              color: textColor,
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
              border: `1px solid ${cardBorder}`,
              color: textColor,
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
      >
        {priorityDocs.map((doc, i) => {
          const DocIcon = ICON_MAP[doc.iconName] || FileText;
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{
                y: -6,
                scale: 1.015,
                boxShadow: isDark
                  ? `0 20px 35px -8px rgba(0,0,0,0.65), 0 0 20px -3px ${accentColor}25`
                  : `0 20px 35px -8px rgba(15,23,42,0.12), 0 0 15px -2px ${accentColor}20`,
                transition: { type: 'spring', stiffness: 400, damping: 25 },
              }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onViewDoc?.(doc.id)}
              className="flex-shrink-0 rounded-2xl p-5 w-[265px] flex flex-col justify-between cursor-pointer relative overflow-hidden group select-none transition-colors"
              style={{
                background: cardBg,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
                backdropFilter: 'blur(16px)',
                scrollSnapAlign: 'start',
              }}
            >
              {/* Top Accent Gradient Bar with micro-glow on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-[3.5px] transition-all duration-300 group-hover:h-[4.5px]"
                style={{
                  background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80, transparent)`,
                }}
              />

              {/* Subtle background decorative watermarked badge & pattern */}
              <div
                className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none flex items-center justify-center"
                style={{ background: accentColor }}
              >
                <DocIcon className="w-16 h-16" style={{ color: accentColor }} />
              </div>

              {/* Shimmer sweep effect on card hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{ x: ['-120%', '220%'] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatDelay: 2 + i * 0.3,
                }}
                style={{
                  background: `linear-gradient(105deg, transparent 20%, ${accentColor}12 45%, ${accentColor}20 50%, ${accentColor}12 55%, transparent 80%)`,
                }}
              />

              {/* Card Content Top */}
              <div className="relative z-10 space-y-3.5">
                {/* Header Row: Icon + Priority Pill */}
                <div className="flex items-center justify-between">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm relative group-hover:shadow-md transition-shadow"
                    style={{
                      background: isDark
                        ? `linear-gradient(135deg, ${accentColor}25, ${accentColor}10)`
                        : `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`,
                      border: `1px solid ${accentColor}35`,
                    }}
                  >
                    <DocIcon className="w-5 h-5" style={{ color: accentColor }} />
                  </motion.div>

                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase flex items-center gap-1"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                      color: subtleColor,
                      border: `1px solid ${badgeBorder}`,
                    }}
                  >
                    Required
                  </span>
                </div>

                {/* Title & Authority */}
                <div>
                  <h3
                    className="text-sm font-black leading-snug line-clamp-1 group-hover:translate-x-0.5 transition-transform duration-200"
                    style={{ color: textColor }}
                    title={doc.name}
                  >
                    {doc.name}
                  </h3>
                  
                  <div className="flex items-start gap-1.5 mt-1.5">
                    <Building2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: mutedColor }} />
                    <p
                      className="text-[11px] font-medium leading-tight line-clamp-2"
                      style={{ color: mutedColor }}
                    >
                      {doc.issuingAuthority.replace(/—.*/, '').trim() || doc.issuingAuthority}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer: Clean Validity Badge & Action Link */}
              <div className="relative z-10 pt-3 mt-3 border-t space-y-2" style={{ borderColor: badgeBorder }}>
                {/* Clean validity info line */}
                <div
                  className="flex items-start gap-1.5 p-2 rounded-lg"
                  style={{
                    background: badgeBg,
                    border: `1px solid ${badgeBorder}`,
                  }}
                >
                  <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                  <span
                    className="text-[10px] font-semibold leading-relaxed line-clamp-2"
                    style={{ color: isDark ? '#E2E8F0' : '#334155' }}
                  >
                    {doc.validity}
                  </span>
                </div>

                {/* Click action indicator */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] font-semibold" style={{ color: subtleColor }}>
                    View details
                  </span>
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200"
                    style={{ color: accentColor }}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
