import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, AlertCircle, ArrowRight, RefreshCw, Edit3, ShieldCheck, MapPin, Calendar, IndianRupee, Sprout, Layers } from 'lucide-react';
import type { CitizenEligibilityProfile } from './eligibilityTypes';

interface MyEligibilityFormProps {
  profile: CitizenEligibilityProfile | null;
  isLoading: boolean;
  onRefresh: () => void;
  onNavigateProfile?: () => void;
  isDark?: boolean;
}

export const MyEligibilityForm: React.FC<MyEligibilityFormProps> = ({
  profile,
  isLoading,
  onRefresh,
  onNavigateProfile,
  isDark = false
}) => {
  const isProfileIncomplete = !profile || !profile.state || !profile.age || !profile.annualFamilyIncome;

  /* ── Design Tokens ── */
  const accent = isDark ? '#00B87C' : '#C9890A';
  const accentBg = isDark ? 'rgba(0,184,124,0.12)' : 'rgba(212,160,23,0.12)';
  const cardBg = isDark ? 'rgba(12,26,43,0.92)' : 'rgba(255,253,247,0.98)';
  const cardBorder = isDark ? '1px solid rgba(0,184,124,0.22)' : '1px solid rgba(212,160,23,0.25)';
  const cardShadow = isDark ? '0 8px 30px rgba(0,0,0,0.30)' : '0 6px 24px rgba(212,160,23,0.08)';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#7A5009';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(212,160,23,0.14)';

  const metricBg = isDark ? 'rgba(0,184,124,0.06)' : 'rgba(254,243,199,0.38)';
  const metricBorder = isDark ? '1px solid rgba(0,184,124,0.18)' : '1px solid rgba(212,160,23,0.24)';
  const metricHoverShadow = isDark ? '0 10px 24px -4px rgba(0,184,124,0.25)' : '0 10px 24px -4px rgba(212,160,23,0.20)';

  const overviewItems = profile ? [
    { label: 'State', value: profile.state || 'Not specified', icon: MapPin },
    { label: 'Age', value: profile.age ? `${profile.age} Years` : 'Not specified', icon: Calendar },
    {
      label: 'Annual Income',
      value: profile.annualFamilyIncome ? `₹${profile.annualFamilyIncome.toLocaleString('en-IN')}` : 'Not specified',
      icon: IndianRupee
    },
    { label: 'Farmer Category', value: profile.farmerCategory || 'Small Farmer', icon: Sprout },
    { label: 'Land Holding', value: profile.landOwnershipAcres ? `${profile.landOwnershipAcres} Acres` : '2.0 Acres', icon: Layers },
    { label: 'Aadhaar & DBT', value: 'Verified', isVerified: true, icon: ShieldCheck },
  ] : [];

  return (
    <div
      className="rounded-2xl p-5 space-y-4 relative overflow-hidden backdrop-blur-md"
      style={{
        background: cardBg,
        border: cardBorder,
        boxShadow: cardShadow,
      }}
    >
      {/* Subtle decorative gold/emerald ambient glow */}
      <div
        className="absolute top-0 right-0 w-64 h-32 rounded-full pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle at top right, ${isDark ? 'rgba(0,184,124,0.15)' : 'rgba(212,160,23,0.12)'}, transparent 70%)`
        }}
      />

      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b relative z-10"
        style={{ borderColor: divider }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black flex-shrink-0"
            style={{ background: accentBg, color: accent, border: `1.5px solid ${isDark ? 'rgba(0,184,124,0.30)' : 'rgba(212,160,23,0.30)'}` }}
          >
            <UserCheck className="w-4 h-4" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight" style={{ color: textColor }}>
                Authenticated Citizen Profile
              </h3>
              <span
                className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: isDark ? 'rgba(0,184,124,0.18)' : 'rgba(254,243,199,0.90)',
                  color: accent,
                  border: `1px solid ${isDark ? 'rgba(0,184,124,0.32)' : 'rgba(212,160,23,0.32)'}`
                }}
              >
                Verified
              </span>
            </div>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: textMuted }}>
              Synchronized securely from Supabase database{' '}
              <code
                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(212,160,23,0.10)',
                  color: accent
                }}
              >
                citizen_profiles
              </code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.90)',
              color: isDark ? '#CBD5E1' : '#4B5563',
              border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(212,160,23,0.25)'
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} style={{ color: accent }} />
            <span>Sync Profile</span>
          </motion.button>

          {onNavigateProfile && (
            <motion.button
              type="button"
              onClick={onNavigateProfile}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg,rgba(0,184,124,0.20),rgba(16,185,129,0.10))'
                  : 'linear-gradient(135deg,rgba(212,160,23,0.20),rgba(201,137,10,0.10))',
                color: accent,
                border: `1.5px solid ${isDark ? 'rgba(0,184,124,0.35)' : 'rgba(212,160,23,0.35)'}`
              }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Warning if Incomplete */}
      {isProfileIncomplete && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl flex items-start gap-3 relative z-10"
          style={{
            background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(254,243,199,0.75)',
            border: `1.5px solid ${isDark ? 'rgba(245,158,11,0.25)' : 'rgba(217,119,6,0.30)'}`
          }}
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1 flex-1">
            <div className="text-xs font-black" style={{ color: isDark ? '#FCD34D' : '#92400E' }}>
              Complete your Citizen Profile to check all schemes
            </div>
            <p className="text-[11px] font-medium" style={{ color: isDark ? '#FDE68A' : '#78350F' }}>
              Some key criteria (State, Age, or Annual Income) are unrecorded. Completing your profile ensures 100% precision.
            </p>
            {onNavigateProfile && (
              <button
                type="button"
                onClick={onNavigateProfile}
                className="mt-1 inline-flex items-center gap-1 text-xs font-black underline underline-offset-2"
                style={{ color: isDark ? '#FCD34D' : '#92400E' }}
              >
                <span>Complete Profile Now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Profile Overview: Individual Animated Metric Cards */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1 relative z-10">
          {overviewItems.map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 14, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.06 * idx,
                  duration: 0.45,
                  type: 'spring',
                  stiffness: 220,
                  damping: 20
                }}
                whileHover={{
                  y: -3,
                  scale: 1.03,
                  boxShadow: metricHoverShadow,
                  transition: { type: 'spring', stiffness: 400, damping: 22 }
                }}
                className="p-3 rounded-xl flex flex-col justify-between cursor-default group relative overflow-hidden"
                style={{
                  background: metricBg,
                  border: metricBorder,
                  boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.20)' : '0 2px 8px rgba(212,160,23,0.06)'
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider"
                    style={{ color: textMuted }}
                  >
                    {item.label}
                  </span>
                  <ItemIcon
                    className="w-3 h-3 transition-transform duration-200 group-hover:scale-110"
                    style={{ color: accent }}
                  />
                </div>

                {item.isVerified ? (
                  <div
                    className="text-xs font-black flex items-center gap-1.5 mt-0.5"
                    style={{ color: isDark ? '#34D399' : '#059669' }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: isDark ? '#34D399' : '#059669', boxShadow: `0 0 5px ${isDark ? '#34D399' : '#059669'}` }}
                    />
                    <span>{item.value}</span>
                  </div>
                ) : (
                  <div
                    className="text-xs font-black truncate mt-0.5 tracking-tight"
                    style={{ color: textColor }}
                  >
                    {item.value}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
