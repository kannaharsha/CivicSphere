import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, CheckCircle, TrendingUp } from 'lucide-react';
import type { CitizenEligibilityProfile, EvaluationResult } from './eligibilityTypes';

interface CitizenSummaryCardProps {
  citizen: CitizenEligibilityProfile;
  results: EvaluationResult[];
  isDark?: boolean;
}

const MetricBox = ({
  value, label, color, bg, border, delay = 0
}: { value: number; label: string; color: string; bg: string; border: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 260, damping: 22 }}
    whileHover={{ scale: 1.05, y: -2 }}
    className="flex flex-col items-center justify-center p-3 rounded-xl relative overflow-hidden cursor-default"
    style={{ background: bg, border: `1.5px solid ${border}` }}
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.2 }}
      className="text-xl font-black leading-none"
      style={{ color }}
    >
      {value}
    </motion.div>
    <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color }}>{label}</div>
  </motion.div>
);

export const CitizenSummaryCard: React.FC<CitizenSummaryCardProps> = ({
  citizen,
  results,
  isDark = false
}) => {
  const eligibleCount = results.filter(r => r.category === 'eligible').length;
  const partialCount = results.filter(r => r.category === 'partial').length;
  const notEligibleCount = results.filter(r => r.category === 'not_eligible').length;
  const totalCount = results.length;

  const accent = isDark ? '#00B87C' : '#C9890A';  // dark=emerald  light=gold
  const bg = isDark ? 'rgba(12,26,43,0.92)' : 'rgba(255,253,247,0.96)';
  const border = isDark ? 'rgba(0,184,124,0.20)' : 'rgba(212,160,23,0.22)';
  const text = isDark ? '#FFFFFF' : '#0F172A';
  const muted = isDark ? '#64748B' : '#9CA3AF';
  const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(212,160,23,0.12)';

  const profileItems = [
    { label: 'State', value: citizen.state || 'Not specified' },
    { label: 'Age', value: citizen.age ? `${citizen.age} yrs` : 'Not specified' },
    { label: 'Annual Income', value: citizen.annualFamilyIncome ? `₹${citizen.annualFamilyIncome.toLocaleString('en-IN')}` : 'Not specified' },
    { label: 'Farmer Category', value: citizen.farmerCategory || 'Small Farmer' },
    { label: 'Land Holding', value: citizen.landOwnershipAcres ? `${citizen.landOwnershipAcres} Acres` : 'Nil / Landless' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ background: bg, border: `1px solid ${border}`, backdropFilter: 'blur(16px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.30)' : '0 8px 24px rgba(212,160,23,0.10)' }}
    >
      {/* Header strip */}
      <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ borderColor: divider }}>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: isDark ? 'rgba(0,184,124,0.15)' : 'rgba(212,160,23,0.12)' }}
        >
          <UserCheck className="w-5 h-5" style={{ color: accent }} />
        </motion.div>
        <div>
          <h3 className="text-sm font-black" style={{ color: text }}>Eligibility Insights</h3>
          <p className="text-[11px] font-medium" style={{ color: muted }}>Real-time profile evaluation</p>
        </div>
        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <motion.span className="w-2 h-2 rounded-full" style={{ background: accent }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: accent }}>Live</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Recommendation banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="p-3 rounded-xl relative overflow-hidden"
          style={{ background: isDark ? 'rgba(0,184,124,0.08)' : 'rgba(254,243,199,0.70)', border: `1.5px solid ${isDark ? 'rgba(0,184,124,0.22)' : 'rgba(212,160,23,0.25)'}` }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            style={{ background: `linear-gradient(90deg,transparent,${isDark ? 'rgba(0,184,124,0.08)' : 'rgba(5,150,105,0.06)'},transparent)` }}
          />
          <div className="relative flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: accent }} />
            <p className="text-xs font-bold leading-relaxed" style={{ color: isDark ? '#34D399' : '#7A5009' }}>
              {eligibleCount > 0 ? (
                <>You qualify for <strong className="font-black underline">{eligibleCount} agriculture schemes</strong>{citizen.state ? ` in ${citizen.state}.` : ' nationwide.'}</>
              ) : (
                'Complete pending criteria to unlock scheme eligibility.'
              )}
            </p>
          </div>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          <MetricBox
            value={eligibleCount} label="Eligible"
            color={isDark ? '#34D399' : '#065F46'}
            bg={isDark ? 'rgba(0,184,124,0.10)' : 'rgba(209,250,229,0.65)'}
            border={isDark ? 'rgba(0,184,124,0.25)' : 'rgba(5,150,105,0.22)'}
            delay={0.2}
          />
          <MetricBox
            value={partialCount} label="Partial"
            color={isDark ? '#FCD34D' : '#92400E'}
            bg={isDark ? 'rgba(245,158,11,0.10)' : 'rgba(254,243,199,0.70)'}
            border={isDark ? 'rgba(245,158,11,0.25)' : 'rgba(217,119,6,0.22)'}
            delay={0.27}
          />
          <MetricBox
            value={notEligibleCount} label="Ineligible"
            color={isDark ? '#FCA5A5' : '#991B1B'}
            bg={isDark ? 'rgba(239,68,68,0.08)' : 'rgba(254,226,226,0.65)'}
            border={isDark ? 'rgba(239,68,68,0.20)' : 'rgba(239,68,68,0.20)'}
            delay={0.34}
          />
          <MetricBox
            value={totalCount} label="Evaluated"
            color={isDark ? '#94A3B8' : '#374151'}
            bg={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.85)'}
            border={isDark ? 'rgba(255,255,255,0.09)' : 'rgba(203,213,225,0.70)'}
            delay={0.41}
          />
        </div>

        {/* Citizen snapshot */}
        <div className="space-y-3 pt-1 border-t" style={{ borderColor: divider }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: accent }} />
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>Citizen Profile Snapshot</span>
          </div>
          <div className="space-y-1.5">
            {profileItems.map(({ label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.06 }}
                className="flex items-center justify-between py-1 px-2.5 rounded-lg text-xs"
                style={{ background: i % 2 === 0 ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(5,150,105,0.03)') : 'transparent' }}
              >
                <span className="font-medium" style={{ color: muted }}>{label}</span>
                <span className="font-black" style={{ color: text }}>{value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
