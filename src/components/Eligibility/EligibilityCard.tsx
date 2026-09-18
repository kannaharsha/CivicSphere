import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, MapPin, Award, Sparkles, ShieldAlert,
  ExternalLink
} from 'lucide-react';
import type { EvaluationResult } from './eligibilityTypes';
import { EligibilityProgress } from './EligibilityProgress';
import { EligibilityBreakdown } from './EligibilityBreakdown';

interface EligibilityCardProps {
  result: EvaluationResult;
  isDark?: boolean;
  index?: number;
}

export const EligibilityCard: React.FC<EligibilityCardProps> = ({ result, isDark = false, index = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    scheme, category, score,
    matchedConditions, failedConditions, missingConditions,
    totalConditions, benefitSummary, benefitAmount, officialUrl, documentsList
  } = result;

  const isEligible = category === 'eligible';
  const isPartial = category === 'partial';

  /* ── Design tokens per status ── */
  const statusConfig = {
    eligible: {
      label: 'Eligible',
      // Eligible: green status badge stays, card chrome is gold in light / green in dark
      gradBorder: isDark
        ? 'linear-gradient(135deg,rgba(0,184,124,0.50),rgba(16,185,129,0.30))'
        : 'linear-gradient(135deg,rgba(212,160,23,0.45),rgba(180,122,8,0.25))',
      cardBg: isDark ? 'rgba(5,26,20,0.92)' : 'rgba(255,253,247,0.97)',
      badge: { bg: isDark ? 'rgba(0,184,124,0.18)' : 'rgba(209,250,229,0.8)', border: isDark ? 'rgba(0,184,124,0.38)' : 'rgba(5,150,105,0.30)', text: isDark ? '#34D399' : '#065F46' },
      accentColor: isDark ? '#00B87C' : '#C9890A',
      glow: isDark ? 'rgba(0,184,124,0.06)' : 'rgba(212,160,23,0.05)',
      icon: Award,
    },
    partial: {
      label: 'Partially Eligible',
      gradBorder: isDark
        ? 'linear-gradient(135deg,rgba(245,158,11,0.45),rgba(251,191,36,0.25))'
        : 'linear-gradient(135deg,rgba(212,160,23,0.42),rgba(245,158,11,0.22))',
      cardBg: isDark ? 'rgba(26,18,4,0.92)' : 'rgba(255,253,247,0.97)',
      badge: { bg: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(254,243,199,0.85)', border: isDark ? 'rgba(245,158,11,0.35)' : 'rgba(217,119,6,0.28)', text: isDark ? '#FCD34D' : '#92400E' },
      accentColor: isDark ? '#FCD34D' : '#C9890A',
      glow: isDark ? 'rgba(245,158,11,0.05)' : 'rgba(212,160,23,0.04)',
      icon: Sparkles,
    },
    not_eligible: {
      label: 'Not Eligible',
      gradBorder: isDark
        ? 'linear-gradient(135deg,rgba(239,68,68,0.30),rgba(252,165,165,0.15))'
        : 'linear-gradient(135deg,rgba(212,160,23,0.20),rgba(180,122,8,0.10))',
      cardBg: isDark ? 'rgba(26,4,4,0.88)' : 'rgba(255,253,247,0.94)',
      badge: { bg: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(254,226,226,0.85)', border: isDark ? 'rgba(239,68,68,0.28)' : 'rgba(239,68,68,0.25)', text: isDark ? '#FCA5A5' : '#991B1B' },
      accentColor: isDark ? '#F87171' : '#9CA3AF',
      glow: 'transparent',
      icon: ShieldAlert,
    }
  };

  const cfg = statusConfig[category];
  const BadgeIcon = cfg.icon;

  // Individual card animation — each card animates fully independently.
  // Delay is driven only by this card's own index so cards cascade one-by-one.
  const individualDelay = Math.min(index * 0.055, 0.42);

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 32,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: individualDelay,
        type: 'spring' as const,
        stiffness: 200,
        damping: 26,
        mass: 0.9,
      }
    },
    exit: {
      opacity: 0,
      y: 16,
      scale: 0.96,
      transition: {
        duration: 0.28,
        ease: [0.4, 0, 1, 1] as [number, number, number, number],
      }
    }
  };

  const hoverShadow = isDark
    ? isEligible
      ? '0 18px 42px -8px rgba(0, 184, 124, 0.35)'
      : isPartial
      ? '0 18px 42px -8px rgba(245, 158, 11, 0.30)'
      : '0 18px 42px -8px rgba(239, 68, 68, 0.22)'
    : isEligible
    ? '0 16px 36px -8px rgba(201, 137, 10, 0.25)'
    : isPartial
    ? '0 16px 36px -8px rgba(217, 119, 6, 0.22)'
    : '0 16px 36px -8px rgba(239, 68, 68, 0.18)';

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{
        y: -4,
        scale: 1.01,
        boxShadow: hoverShadow,
        transition: { type: 'spring', stiffness: 360, damping: 24 }
      }}
      className="relative rounded-2xl overflow-hidden group cursor-default"
      style={{
        background: cfg.cardBg,
        backdropFilter: 'blur(16px)',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.30)' : '0 4px 16px rgba(5,150,105,0.07)',
      }}
    >
      {/* Gradient border via pseudo-box */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        padding: '1.5px',
        background: cfg.gradBorder,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }} />

      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        background: `radial-gradient(ellipse at 30% 30%, ${cfg.glow} 0%, transparent 70%)`
      }} />

      {/* Independent hover shimmer sweep per card */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={{ x: ['-100%', '200%'] }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: ((index % 4) * 0.7) + 2.0
        }}
        style={{
          background: `linear-gradient(90deg, transparent, ${
            isEligible ? 'rgba(0,184,124,0.08)' : isPartial ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.05)'
          }, transparent)`
        }}
      />

      <div className="relative z-10 p-5 space-y-4">
        {/* Top bar: jurisdiction, ministry, badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(5,150,105,0.08)', color: isDark ? '#94A3B8' : '#374151' }}
            >
              <MapPin className="w-3 h-3" style={{ color: cfg.accentColor }} />
              {scheme.state || 'All India'}
            </span>
            {scheme.ministry && (
              <span className="text-[11px] font-medium truncate max-w-[200px]" style={{ color: isDark ? '#64748B' : '#6B7280' }}>
                {scheme.ministry}
              </span>
            )}
          </div>

          {/* Individual status badge with pulse */}
          <motion.span
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: (index % 6) * 0.1 + 0.12, type: 'spring', stiffness: 260, damping: 20 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
            style={{ background: cfg.badge.bg, border: `1.5px solid ${cfg.badge.border}`, color: cfg.badge.text }}
          >
            <BadgeIcon className="w-3.5 h-3.5" />
            {cfg.label}
            {isEligible && (
              <motion.span animate={{ scale: [1, 1.45, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: cfg.accentColor, boxShadow: `0 0 6px ${cfg.accentColor}` }} />
              </motion.span>
            )}
          </motion.span>
        </div>

        {/* Scheme name, ID, benefit row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: cfg.accentColor }}>
                {scheme.scheme_id}
              </span>
              {scheme.sector && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(5,150,105,0.08)', color: isDark ? '#64748B' : '#6B7280' }}>
                  {scheme.sector}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-black leading-snug" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
              {scheme.scheme_name}
            </h3>
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
              {benefitSummary}
            </p>
          </div>

          {/* Progress gauge with individual delay */}
          <div className="flex-shrink-0 flex items-center sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            <EligibilityProgress
              score={score}
              category={category}
              matchedCount={matchedConditions.length}
              totalCount={totalConditions}
              isDark={isDark}
              delay={(index % 6) * 0.1 + 0.15}
            />
          </div>
        </div>

        {/* Benefit highlight pill */}
        {benefitAmount && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: (index % 6) * 0.1 + 0.18, type: 'spring', stiffness: 260, damping: 20 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black"
            style={{
              background: isDark ? 'rgba(0,184,124,0.12)' : 'rgba(209,250,229,0.75)',
              border: `1.5px solid ${isDark ? 'rgba(0,184,124,0.25)' : 'rgba(5,150,105,0.22)'}`,
              color: isDark ? '#34D399' : '#065F46'
            }}
          >
            <span style={{ color: isDark ? '#00B87C' : '#059669' }}>💰</span>
            <span>Direct Benefit:</span>
            <span className="font-extrabold">{benefitAmount}</span>
          </motion.div>
        )}

        {/* Accordion toggle bar */}
        <div className="pt-3 flex items-center justify-between border-t"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(5,150,105,0.10)' }}>
          <motion.button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.04, x: 2 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 text-xs font-black transition-colors"
            style={{ color: cfg.accentColor }}
          >
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25, type: 'spring' }}>
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
            <span>
              {isExpanded ? 'Hide Details' : isEligible ? 'View Details & Documents' : isPartial ? 'Improve Eligibility' : 'View Criteria Breakdown'}
            </span>
          </motion.button>

          {officialUrl && !isExpanded && (
            <motion.a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-colors shadow-sm"
              style={{
                background: isDark ? 'rgba(0,184,124,0.10)' : 'rgba(5,150,105,0.08)',
                color: cfg.accentColor,
                border: `1px solid ${isDark ? 'rgba(0,184,124,0.22)' : 'rgba(5,150,105,0.18)'}`
              }}
            >
              <ExternalLink className="w-3 h-3" />
              Official Portal
            </motion.a>
          )}
        </div>

        {/* Expandable breakdown */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <EligibilityBreakdown
                matchedConditions={matchedConditions}
                failedConditions={failedConditions}
                missingConditions={missingConditions}
                documentsList={documentsList}
                officialUrl={officialUrl}
                isDark={isDark}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
