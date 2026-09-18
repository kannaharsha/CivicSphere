import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldAlert, SearchX, Trophy, TrendingUp } from 'lucide-react';
import type { EvaluationResult } from './eligibilityTypes';
import { EligibilityCard } from './EligibilityCard';
import type { FilterCategory } from './EligibilityFilters';

interface EligibilityResultsProps {
  results: EvaluationResult[];
  activeCategory: FilterCategory;
  isDark?: boolean;
}

const SectionHeader = ({
  icon, label, count, accentColor, badge, isDark
}: {
  icon: React.ReactNode; label: string; count: number;
  accentColor: string; badge: string; isDark: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      {/* Animated pulse dot */}
      <div className="relative">
        <motion.span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ background: accentColor }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.4, 0.8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="absolute inset-0 rounded-full" style={{ background: accentColor, opacity: 0.2, filter: 'blur(4px)' }} />
      </div>
      <div className="flex items-center gap-2.5">
        <span style={{ color: accentColor }}>{icon}</span>
        <span className="text-sm font-black uppercase tracking-wide" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
          {label}
        </span>
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 22 }}
          className="text-xs font-black px-2.5 py-0.5 rounded-full"
          style={{ background: `${accentColor}1A`, color: accentColor, border: `1px solid ${accentColor}33` }}
        >
          {count} {badge}
        </motion.span>
      </div>
    </div>
  </motion.div>
);

export const EligibilityResults: React.FC<EligibilityResultsProps> = ({
  results,
  activeCategory,
  isDark = false
}) => {
  const eligibleSchemes = results.filter(r => r.category === 'eligible');
  const partialSchemes = results.filter(r => r.category === 'partial');
  const notEligibleSchemes = results.filter(r => r.category === 'not_eligible');

  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-12 text-center space-y-4"
        style={{
          background: isDark ? 'rgba(12,26,43,0.88)' : 'rgba(255,255,255,0.95)',
          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(5,150,105,0.15)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: isDark ? 'rgba(0,184,124,0.10)' : 'rgba(5,150,105,0.08)', color: isDark ? '#00B87C' : '#059669' }}
        >
          <SearchX className="w-8 h-8" />
        </motion.div>
        <div>
          <h3 className="text-base font-black" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
            No Schemes Matched
          </h3>
          <p className="text-xs mt-1.5 max-w-sm mx-auto" style={{ color: isDark ? '#64748B' : '#6B7280' }}>
            No government schemes found for the selected filter. Try adjusting your filter or clearing the search.
          </p>
        </div>
      </motion.div>
    );
  }

  const showEligible = ['eligible', 'all', 'central', 'state', 'women', 'small'].includes(activeCategory);
  const showPartial = ['partial', 'all'].includes(activeCategory);
  const showIneligible = activeCategory === 'not_eligible';

  // No combined group variant — each EligibilityCard animates individually
  // via its own index-based delay inside the card component itself.

  return (
    <div className="space-y-8">
      {/* ── 1. ELIGIBLE SCHEMES ── */}
      <AnimatePresence mode="popLayout">
        {showEligible && eligibleSchemes.length > 0 && (
          <motion.section
            key="eligible-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <SectionHeader
              icon={<Trophy className="w-4 h-4" />}
              label="Eligible Government Schemes"
              count={eligibleSchemes.length}
              accentColor={isDark ? '#00B87C' : '#C9890A'}
              badge="Available"
              isDark={isDark}
            />

            {/* Eligible count summary banner */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
              style={{
                background: isDark ? 'rgba(0,184,124,0.08)' : 'rgba(254,243,199,0.65)',
                border: isDark ? '1px solid rgba(0,184,124,0.18)' : '1px solid rgba(212,160,23,0.22)'
              }}
            >
              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isDark ? '#00B87C' : '#C9890A' }} />
              <span className="text-xs font-bold" style={{ color: isDark ? '#34D399' : '#7A5009' }}>
                100% Database-Verified Eligibility — All results checked against real Supabase records
              </span>
            </motion.div>

            {/* Cards animate individually — no combined stagger wrapper */}
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {eligibleSchemes.map((res, i) => (
                  <EligibilityCard key={res.scheme.scheme_id} result={res} isDark={isDark} index={i} />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── 2. PARTIAL SCHEMES ── */}
      <AnimatePresence mode="popLayout">
        {showPartial && partialSchemes.length > 0 && (
          <motion.section
            key="partial-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 pt-4 border-t"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(5,150,105,0.10)' }}
          >
            <SectionHeader
              icon={<Sparkles className="w-4 h-4" />}
              label="Partially Eligible Schemes"
              count={partialSchemes.length}
              accentColor="#F59E0B"
              badge="Schemes"
              isDark={isDark}
            />
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.10, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{
                background: isDark ? 'rgba(245,158,11,0.07)' : 'rgba(254,243,199,0.7)',
                border: isDark ? '1px solid rgba(245,158,11,0.18)' : '1px solid rgba(217,119,6,0.18)'
              }}
            >
              <span className="text-xs font-bold" style={{ color: isDark ? '#FCD34D' : '#92400E' }}>
                ⚡ Complete the highlighted criteria below to unlock full eligibility for these schemes
              </span>
            </motion.div>
            {/* Cards animate individually */}
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {partialSchemes.map((res, i) => (
                  <EligibilityCard key={res.scheme.scheme_id} result={res} isDark={isDark} index={i} />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── 3. NOT ELIGIBLE SCHEMES ── */}
      <AnimatePresence mode="popLayout">
        {showIneligible && notEligibleSchemes.length > 0 && (
          <motion.section
            key="ineligible-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 pt-4 border-t"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(5,150,105,0.10)' }}
          >
            <SectionHeader
              icon={<ShieldAlert className="w-4 h-4" />}
              label="Ineligible Schemes"
              count={notEligibleSchemes.length}
              accentColor={isDark ? '#F87171' : '#EF4444'}
              badge="Schemes"
              isDark={isDark}
            />
            {/* Cards animate individually */}
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {notEligibleSchemes.map((res, i) => (
                  <EligibilityCard key={res.scheme.scheme_id} result={res} isDark={isDark} index={i} />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};
