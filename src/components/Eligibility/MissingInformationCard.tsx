import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus } from 'lucide-react';
import type { CitizenEligibilityProfile } from './eligibilityTypes';

interface MissingInformationCardProps {
  citizen: CitizenEligibilityProfile;
  onUpdateProfile: (updates: Partial<CitizenEligibilityProfile>) => void;
  isDark?: boolean;
}

export const MissingInformationCard: React.FC<MissingInformationCardProps> = ({
  citizen,
  onUpdateProfile,
  isDark = false
}) => {
  const missingItems: { label: string; desc: string; emoji: string; key: keyof CitizenEligibilityProfile; value: any }[] = [];

  if (!citizen.hasSoilHealthCard) {
    missingItems.push({ label: 'Soil Health Card', desc: 'Unlock soil nutrient & fertilizer subsidy schemes', emoji: '🌱', key: 'hasSoilHealthCard', value: true });
  }
  if (!citizen.isOrganicFarmer) {
    missingItems.push({ label: 'Organic Farming', desc: 'Qualify for Paramparagat Krishi Vikas Yojana & bio-fertilizer aid', emoji: '🌿', key: 'isOrganicFarmer', value: true });
  }
  if (!citizen.isPmKisanBeneficiary) {
    missingItems.push({ label: 'PM-Kisan Beneficiary', desc: 'Enables Kisan Credit Card (KCC) accelerated eligibility', emoji: '💳', key: 'isPmKisanBeneficiary', value: true });
  }

  if (missingItems.length === 0) return null;

  const accentColor = isDark ? '#FCD34D' : '#C9890A';  // dark=amber  light=gold
  const bg = isDark ? 'rgba(26,18,4,0.90)' : 'rgba(255,253,247,0.96)';
  const border = isDark ? 'rgba(245,158,11,0.22)' : 'rgba(212,160,23,0.22)';
  const itemBg = isDark ? 'rgba(12,26,43,0.88)' : 'rgba(255,255,255,0.96)';
  const itemBorder = isDark ? 'rgba(245,158,11,0.18)' : 'rgba(212,160,23,0.20)';
  const text = isDark ? '#FFFFFF' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#78716C';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ background: bg, border: `1px solid ${border}`, backdropFilter: 'blur(14px)', boxShadow: isDark ? '0 6px 28px rgba(0,0,0,0.25)' : '0 6px 20px rgba(217,119,6,0.08)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-2.5 border-b" style={{ borderColor: border }}>
        <motion.div
          animate={{ rotate: [0, 15, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.12)' }}
        >
          <Zap className="w-4.5 h-4.5" style={{ color: accentColor }} />
        </motion.div>
        <div>
          <h3 className="text-sm font-black" style={{ color: accentColor }}>Boost Your Matches</h3>
          <p className="text-[11px] font-medium" style={{ color: muted }}>Add credentials to unlock more schemes</p>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: muted }}>
          Enabling these optional credentials can unlock additional high-subsidy government schemes:
        </p>

        <div className="space-y-2">
          {missingItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + idx * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
              className="flex items-center justify-between gap-3 p-3 rounded-xl"
              style={{ background: itemBg, border: `1.5px solid ${itemBorder}` }}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="text-base flex-shrink-0">{item.emoji}</span>
                <div className="min-w-0">
                  <div className="text-xs font-black leading-snug" style={{ color: text }}>{item.label}</div>
                  <div className="text-[10px] font-medium leading-snug mt-0.5" style={{ color: muted }}>{item.desc}</div>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={() => onUpdateProfile({ [item.key]: item.value })}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-[11px] flex-shrink-0 transition-colors"
                style={{
                  background: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.12)',
                  color: accentColor,
                  border: `1.5px solid ${isDark ? 'rgba(245,158,11,0.30)' : 'rgba(217,119,6,0.25)'}`,
                }}
              >
                <Plus className="w-3 h-3" />
                Enable
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
