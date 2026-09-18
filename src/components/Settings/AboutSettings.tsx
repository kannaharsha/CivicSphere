import React from 'react';
import { motion } from 'framer-motion';
import { Info, ShieldAlert, FileText, HelpCircle, MessageSquareText, Award, HeartHandshake, ExternalLink } from 'lucide-react';

interface AboutSettingsProps {
  isDark?: boolean;
}

const NAV_CARDS = [
  {
    icon: FileText,
    label: 'Terms & Conditions',
    desc: 'Official citizen rights, portal usage charter, and fair usage guidelines.',
  },
  {
    icon: ShieldAlert,
    label: 'Privacy Policy',
    desc: 'Sovereign data governance complying with Digital Personal Data Protection (DPDP) Act.',
  },
  {
    icon: HelpCircle,
    label: 'Help & Support',
    desc: 'Toll-free Kisan Call Center 1800-180-1551 & District Helpdesk integration.',
  },
  {
    icon: MessageSquareText,
    label: 'Submit Feedback',
    desc: 'Share suggestions to improve portal accessibility and scheme transparency.',
  },
];

export const AboutSettings: React.FC<AboutSettingsProps> = ({ isDark = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl overflow-hidden border backdrop-blur-sm transition-all ${
        isDark
          ? 'bg-slate-900/40 border-white/8 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-950/30'
          : 'bg-white/80 border-slate-100 hover:border-amber-300/50 hover:shadow-xl hover:shadow-amber-500/8'
      }`}
    >
      <div className={`h-1 w-full ${isDark ? 'bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600' : 'bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300'}`} />

      <div className="p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-white/8 text-white/60 border border-white/10' : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                About CivicSphere
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-white/8 text-white/50 border-white/10' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                v2.4.0 · Gov-L2 Release
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Next-Generation Sovereign Public Digital Infrastructure for Welfare Delivery
            </p>
          </div>
        </div>

        {/* Mission Banner */}
        <div className={`flex items-start gap-3 p-4 rounded-2xl mb-5 border ${
          isDark
            ? 'bg-gradient-to-r from-emerald-950/30 to-slate-900/50 border-emerald-500/15'
            : 'bg-gradient-to-r from-amber-50/60 to-orange-50/50 border-amber-200'
        }`}>
          <Award className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-amber-600'}`} />
          <p className={`text-xs leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
            CivicSphere bridges the accessibility gap between rural citizens and complex government schemes.
            Built on sovereign digital principles — rigorous privacy guardrails, multi-lingual support, and transparent eligibility matching.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {NAV_CARDS.map((card, i) => (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`text-left p-3.5 rounded-2xl border group cursor-pointer transition-all ${
                isDark
                  ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/12'
                  : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/80 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <card.icon className={`w-4 h-4 ${isDark ? 'text-emerald-400/70' : 'text-amber-600/70'}`} />
                <ExternalLink className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
              </div>
              <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-white/80' : 'text-slate-800'}`}>
                {card.label}
              </p>
              <p className={`text-[11px] leading-snug ${isDark ? 'text-white/35' : 'text-slate-500'}`}>
                {card.desc}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Footer attribution */}
        <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] ${
          isDark ? 'border-white/5 text-white/30' : 'border-slate-100 text-slate-400'
        }`}>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
            <span>Crafted for Indian Citizens · Department of Agriculture & Farmers Welfare</span>
          </div>
          <span className="font-mono">NIC / MeitY Guidelines Verified</span>
        </div>
      </div>
    </motion.div>
  );
};
