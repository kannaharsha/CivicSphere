/**
 * CivicSphere — Document Information Hero
 * Read-only hero with animated counters:
 * Total Documents / Agriculture / Identity / Land
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Wheat, IdCard, Map, Database, Sparkles } from 'lucide-react';
import type { DocumentInfoStats } from './documentTypes';

interface DocumentHeroProps {
  stats: DocumentInfoStats;
  isDark: boolean;
}

const AnimatedCounter = ({ target, delay = 0 }: { target: number; delay?: number }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      if (target === 0) { setVal(0); return; }
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 28));
      const iv = setInterval(() => {
        cur = Math.min(cur + step, target);
        setVal(cur);
        if (cur >= target) clearInterval(iv);
      }, 40);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return <>{val}</>;
};

export const DocumentHero: React.FC<DocumentHeroProps> = ({ stats, isDark }) => {
  const accent = isDark ? '#00B87C' : '#C9890A';
  const heroBg = isDark
    ? 'linear-gradient(135deg,#060F1A 0%,#081726 45%,#07121E 100%)'
    : 'linear-gradient(135deg,#FFFDF5 0%,#FDFBEC 45%,#FAF6E4 100%)';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#6B7280';
  const cardBg = isDark ? 'rgba(10,21,38,0.78)' : 'rgba(255,255,255,0.82)';
  const borderColor = isDark ? 'rgba(0,184,124,0.16)' : 'rgba(212,160,23,0.20)';

  const statCards = [
    { label: 'Total Documents',      value: stats.total,       icon: BookOpen, color: accent,             delay: 180 },
    { label: 'Agriculture Docs',     value: stats.agriculture, icon: Wheat,    color: isDark ? '#A3E635' : '#65A30D', delay: 280 },
    { label: 'Identity Documents',   value: stats.identity,    icon: IdCard,   color: isDark ? '#60A5FA' : '#2563EB', delay: 380 },
    { label: 'Land Records',         value: stats.land,        icon: Map,      color: isDark ? '#FCD34D' : '#D97706', delay: 480 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="text-center space-y-6 pt-1"
    >
      {/* 1. BADGE */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase backdrop-blur-md shadow-sm ${
          isDark
            ? 'border-[#00B87C]/30 bg-[#00B87C]/8 text-[#34D399]'
            : 'border-[#D4A017]/35 bg-[#FFF5D6] text-[#8A6210]'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: accent }} />
        Digital Public Infrastructure • Government Document Center
      </div>

      {/* 2. HEADING & ACCENT LINE */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-heading leading-tight">
          <span style={{ color: textColor }}>Required </span>
          <span
            className={
              isDark
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00B87C] via-[#10B981] to-[#34D399]'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-[#B48418] via-[#D4A017] to-[#F59E0B]'
            }
          >
            Government Documents
          </span>
        </h1>
        <div className="flex justify-center pt-1">
          <div
            className="h-1 w-28 sm:w-36 rounded-full"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, #00B87C, transparent)'
                : 'linear-gradient(90deg, #D4A017, transparent)',
            }}
          />
        </div>
        <p className="text-xs sm:text-sm max-w-lg mx-auto font-medium pt-1" style={{ color: mutedColor }}>
          Official citizen guidance on required records, issuing authorities, and validity across agriculture welfare schemes.
        </p>
      </div>

      {/* 3. THREE STATS CARDS (Matching Explore Schemes 3-card stats format) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left">
        {[
          {
            label: 'Total Documents',
            value: stats.total,
            sub: '● Comprehensive Catalog',
            icon: <BookOpen className="w-5 h-5" />,
            colored: true,
          },
          {
            label: 'Agriculture & Land',
            value: stats.agriculture + stats.land,
            sub: 'Crop, Soil & Revenue Records',
            icon: <Wheat className="w-5 h-5" />,
            colored: true,
          },
          {
            label: 'Identity & Financial',
            value: stats.identity,
            sub: 'Direct Benefit Transfer Ready',
            icon: <IdCard className="w-5 h-5" />,
            colored: false,
          },
        ].map((stat, si) => (
          <motion.div
            key={si}
            whileHover={{ y: -7, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className={`relative p-5 rounded-3xl border flex items-center justify-between backdrop-blur-xl transition-all shadow-sm overflow-hidden group ${
              isDark
                ? 'bg-gradient-to-br from-[#0C1A2B]/95 to-[#0F1C2E]/95 border-[#00B87C]/25 hover:border-[#00B87C]/55 hover:shadow-xl hover:shadow-[#00B87C]/10'
                : 'bg-gradient-to-br from-white/95 to-[#FFFDF7]/95 border-[#D4A017]/35 hover:border-[#D4A017]/60 hover:shadow-xl hover:shadow-amber-900/8'
            }`}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px] group-hover:h-[3px] transition-all duration-300"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, #00B87C, transparent)'
                  : 'linear-gradient(90deg, #D4A017, transparent)',
              }}
            />
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: mutedColor }}>
                {stat.label}
              </span>
              <h4 className="text-2xl sm:text-3xl font-black font-heading" style={{ color: textColor }}>
                <AnimatedCounter target={stat.value} delay={si * 150} />
              </h4>
              <span
                className="text-[10px] font-semibold block"
                style={{ color: stat.colored ? accent : mutedColor }}
              >
                {stat.sub}
              </span>
            </div>
            <div
              className={`p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                stat.colored
                  ? isDark
                    ? 'bg-[#00B87C]/10 text-[#34D399] border-[#00B87C]/30'
                    : 'bg-[#FFF5D6] text-[#8A6210] border-[#D4A017]/35'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
