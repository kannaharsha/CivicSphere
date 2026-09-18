/**
 * CivicSphere — Government Guidance Section
 * Educational guidance cards for citizens about managing government documents.
 * Each card independently animated — no stagger parent.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw, Link2, UserCheck, FileWarning,
  Smartphone, Building2, BadgeCheck
} from 'lucide-react';

interface GovernmentGuidanceProps {
  isDark: boolean;
}

const GUIDANCE_ITEMS = [
  {
    icon: UserCheck,
    title: 'Keep Aadhaar Details Updated',
    description: 'Update your Aadhaar address when you relocate. Ensure your name spelling is consistent across all documents — Aadhaar is the master identity record for all schemes.',
    color: '#3B82F6',
    darkColor: '#60A5FA',
  },
  {
    icon: Building2,
    title: 'Ensure Land Records Match Your Name',
    description: 'Your name on Pattadar Passbook, ROR, and Adangal must match your Aadhaar exactly. Name mismatches are the most common cause of PM-Kisan and Rythu Bharosa rejection.',
    color: '#D97706',
    darkColor: '#FCD34D',
  },
  {
    icon: RefreshCw,
    title: 'Income Certificate Should Be Valid',
    description: 'Income certificates expire every year. Renew yours before each scheme application season. An expired income certificate will automatically disqualify your application.',
    color: '#EF4444',
    darkColor: '#FCA5A5',
  },
  {
    icon: Link2,
    title: 'Bank Account Should Be Active & Aadhaar-Linked',
    description: 'Your bank account must be active and Aadhaar-seeded through NPCI for Direct Benefit Transfer. Dormant or unlinked accounts prevent all scheme payments from reaching you.',
    color: '#0891B2',
    darkColor: '#22D3EE',
  },
  {
    icon: FileWarning,
    title: 'Soil Health Card Helps in Agriculture Schemes',
    description: 'A valid Soil Health Card (SHC) improves your eligibility for fertilizer subsidies and organic farming schemes. Get your soil tested at the free government Soil Testing Laboratory.',
    color: '#16A34A',
    darkColor: '#4ADE80',
  },
  {
    icon: Smartphone,
    title: 'Register Mobile Number with Aadhaar',
    description: 'Your Aadhaar-linked mobile is essential for OTP-based scheme enrollment, PM-Kisan e-KYC, and receiving payment alerts. Ensure the SIM is active and in your name.',
    color: '#7C3AED',
    darkColor: '#A78BFA',
  },
  {
    icon: BadgeCheck,
    title: 'Use MeeSeva Digital Certificates',
    description: 'MeeSeva digital certificates with QR codes are accepted on all government portals and are instantly verifiable. They reduce delays caused by physical document verification.',
    color: '#65A30D',
    darkColor: '#A3E635',
  },
];

export const GovernmentGuidance: React.FC<GovernmentGuidanceProps> = ({ isDark }) => {
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#6B7280';
  const cardBg = isDark ? 'rgba(9,19,33,0.90)' : 'rgba(255,255,255,0.97)';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const accent = isDark ? '#00B87C' : '#D4A537';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full" style={{ background: accent }} />
        <div>
          <h2 className="text-sm font-black" style={{ color: textColor }}>
            Government Document Guidance
          </h2>
          <p className="text-[11px] mt-0.5" style={{ color: mutedColor }}>
            Follow these guidelines to ensure your documents are always valid and scheme-ready
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {GUIDANCE_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const color = isDark ? item.darkColor : item.color;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: i * 0.065,
                type: 'spring',
                stiffness: 200,
                damping: 26,
                mass: 0.9,
              }}
              whileHover={{
                y: -5,
                scale: 1.02,
                boxShadow: isDark
                  ? `0 18px 44px -8px rgba(0,0,0,0.45), 0 2px 12px ${color}18`
                  : `0 16px 36px -8px rgba(0,0,0,0.10), 0 2px 10px ${color}12`,
                transition: { type: 'spring', stiffness: 380, damping: 24 },
              }}
              className="rounded-2xl p-4 space-y-3 cursor-default"
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                backdropFilter: 'blur(14px)',
              }}
            >
              <motion.div
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}28` }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </motion.div>

              <div>
                <div className="text-xs font-black leading-snug mb-1.5" style={{ color: textColor }}>
                  {item.title}
                </div>
                <div className="text-[11px] leading-relaxed" style={{ color: mutedColor }}>
                  {item.description}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
