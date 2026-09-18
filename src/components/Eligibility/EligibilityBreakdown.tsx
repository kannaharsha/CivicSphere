import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, FileText, ExternalLink, ShieldCheck } from 'lucide-react';

interface EligibilityBreakdownProps {
  matchedConditions: string[];
  failedConditions: string[];
  missingConditions: string[];
  documentsList: string[];
  officialUrl?: string;
  isDark?: boolean;
}

const ConditionItem = ({ text, type, isDark, delay = 0 }: {
  text: string; type: 'matched' | 'failed' | 'missing'; isDark: boolean; delay?: number;
}) => {
  const config = {
    matched: {
      icon: <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />,
      color: isDark ? '#34D399' : '#059669',
      bg: isDark ? 'rgba(0,184,124,0.07)' : 'rgba(209,250,229,0.50)',
      border: isDark ? 'rgba(0,184,124,0.18)' : 'rgba(5,150,105,0.18)',
    },
    failed: {
      icon: <XCircle className="w-3.5 h-3.5 flex-shrink-0" />,
      color: isDark ? '#FCA5A5' : '#EF4444',
      bg: isDark ? 'rgba(239,68,68,0.06)' : 'rgba(254,226,226,0.50)',
      border: isDark ? 'rgba(239,68,68,0.16)' : 'rgba(239,68,68,0.16)',
    },
    missing: {
      icon: <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />,
      color: isDark ? '#FCD34D' : '#D97706',
      bg: isDark ? 'rgba(245,158,11,0.07)' : 'rgba(254,243,199,0.55)',
      border: isDark ? 'rgba(245,158,11,0.16)' : 'rgba(217,119,6,0.16)',
    },
  };
  const cfg = config[type];
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-start gap-2 p-2 rounded-lg text-[11px] font-medium leading-relaxed"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: isDark ? '#CBD5E1' : '#374151' }}
    >
      <span style={{ color: cfg.color, marginTop: 1 }}>{cfg.icon}</span>
      <span>{text}</span>
    </motion.div>
  );
};

export const EligibilityBreakdown: React.FC<EligibilityBreakdownProps> = ({
  matchedConditions, failedConditions, missingConditions,
  documentsList, officialUrl, isDark = false
}) => {
  const accent = isDark ? '#00B87C' : '#C9890A';  // dark=emerald  light=gold
  const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(212,160,23,0.12)';
  const text = isDark ? '#FFFFFF' : '#0F172A';

  return (
    <div className="space-y-4 pt-4 border-t text-xs" style={{ borderColor: divider }}>

      {/* Matched conditions */}
      {matchedConditions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-black" style={{ color: isDark ? '#34D399' : '#059669' }}>
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Why You Qualify ({matchedConditions.length} Criteria Met)</span>
          </div>
          <div className="space-y-1.5">
            {matchedConditions.map((cond, i) => (
              <ConditionItem key={i} text={cond} type="matched" isDark={isDark} delay={i * 0.05} />
            ))}
          </div>
        </div>
      )}

      {/* Missing conditions */}
      {missingConditions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-black" style={{ color: isDark ? '#FCD34D' : '#D97706' }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Pending Requirements ({missingConditions.length} to Unlock)</span>
          </div>
          <div className="space-y-1.5">
            {missingConditions.map((cond, i) => (
              <ConditionItem key={i} text={cond} type="missing" isDark={isDark} delay={i * 0.05} />
            ))}
          </div>
        </div>
      )}

      {/* Failed conditions */}
      {failedConditions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-black" style={{ color: isDark ? '#FCA5A5' : '#EF4444' }}>
            <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Disqualifying Criteria ({failedConditions.length})</span>
          </div>
          <div className="space-y-1.5">
            {failedConditions.map((cond, i) => (
              <ConditionItem key={i} text={cond} type="failed" isDark={isDark} delay={i * 0.05} />
            ))}
          </div>
        </div>
      )}

      {/* Documents checklist */}
      {documentsList && documentsList.length > 0 && (
        <div className="pt-3 border-t space-y-2.5" style={{ borderColor: divider }}>
          <div className="flex items-center gap-1.5 font-black" style={{ color: text }}>
            <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
            <span>Required Documents Checklist</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {documentsList.slice(0, 8).map((doc: any, idx) => {
              const docName = typeof doc === 'string'
                ? doc
                : (doc?.name || doc?.document_name || doc?.title || doc?.type || 'Required Document');
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                  className="flex items-center gap-2 p-2 rounded-lg text-[11px] font-medium"
                  style={{
                    background: isDark ? 'rgba(0,184,124,0.06)' : 'rgba(209,250,229,0.40)',
                    border: isDark ? '1px solid rgba(0,184,124,0.15)' : '1px solid rgba(5,150,105,0.15)',
                    color: isDark ? '#CBD5E1' : '#374151'
                  }}
                >
                  <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 font-black text-[9px]"
                    style={{ background: isDark ? 'rgba(0,184,124,0.15)' : 'rgba(5,150,105,0.12)', color: accent }}>
                    ✓
                  </span>
                  <span className="truncate" title={docName}>{docName}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Official portal CTA */}
      {officialUrl && (
        <div className="pt-2 flex justify-end">
          <motion.a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white relative overflow-hidden"
            style={{
              background: isDark ? 'linear-gradient(135deg,#00B87C,#10B981)' : 'linear-gradient(135deg,#C9890A,#D4A017)',
              boxShadow: isDark ? '0 4px 16px rgba(0,184,124,0.35)' : '0 4px 16px rgba(212,160,23,0.30)'
            }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
              style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.20),transparent)' }}
            />
            <ShieldCheck className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Apply on Official Portal</span>
            <ExternalLink className="w-3 h-3 relative z-10" />
          </motion.a>
        </div>
      )}
    </div>
  );
};
