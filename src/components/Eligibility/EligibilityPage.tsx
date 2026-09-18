import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  RefreshCw, AlertCircle, Sparkles, ShieldCheck, Award
} from 'lucide-react';
import { useAuth } from '../../firebase/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import type {
  CitizenEligibilityProfile,
  SchemeRecord,
  EvaluationResult
} from './eligibilityTypes';
import {
  fetchAgricultureSchemes,
  fetchCitizenProfileFromSupabase
} from './supabaseEligibilityService';
import { evaluateAllSchemes } from './eligibilityEngine';
import { EligibilityTabs, type EligibilityMode } from './EligibilityTabs';
import { MyEligibilityForm } from './MyEligibilityForm';
import { AnotherPersonForm } from './AnotherPersonForm';
import { EligibilityFilters, type FilterCategory, type SortOption } from './EligibilityFilters';
import { EligibilityResults } from './EligibilityResults';
import { CitizenSummaryCard } from './CitizenSummaryCard';
import { MissingInformationCard } from './MissingInformationCard';

/* ─── Design Tokens ─────────────────────────────────────── */
// Light = warm luxury gold   |   Dark = CivicSphere emerald
const T = {
  light: {
    accent: '#C9890A',
    accentAlt: '#B47A08',
    accentGlow: 'rgba(212,160,23,0.14)',
    heroBg: 'linear-gradient(135deg,#FFFDF7 0%,#FDFBF0 45%,#FAF6E8 100%)',
    surface: 'rgba(255,255,255,0.96)',
    cardBg: 'rgba(255,255,255,0.92)',
    border: 'rgba(212,160,23,0.22)',
    borderHover: 'rgba(212,160,23,0.55)',
    text: '#0F172A',
    textMuted: '#6B7280',
    shadow: '0 8px 32px -4px rgba(212,160,23,0.10), 0 2px 8px rgba(0,0,0,0.04)',
    shadowHover: '0 20px 48px -8px rgba(212,160,23,0.20), 0 4px 16px rgba(0,0,0,0.06)',
    chipBg: 'rgba(254,243,199,0.70)',
    chipBorder: 'rgba(212,160,23,0.30)',
    chipText: '#7A5009',
    scrollThumb: 'rgba(212,160,23,0.28)',
  },
  dark: {
    accent: '#00B87C',
    accentAlt: '#10B981',
    accentGlow: 'rgba(0,184,124,0.18)',
    heroBg: 'linear-gradient(145deg,#07121E 0%,#0B1D2F 55%,#091726 100%)',
    surface: 'rgba(11,23,38,0.92)',
    cardBg: 'rgba(12,26,43,0.88)',
    border: 'rgba(0,184,124,0.20)',
    borderHover: 'rgba(0,184,124,0.50)',
    text: '#FFFFFF',
    textMuted: '#94A3B8',
    shadow: '0 8px 32px rgba(0,0,0,0.35),0 2px 8px rgba(0,184,124,0.08)',
    shadowHover: '0 16px 48px rgba(0,0,0,0.45),0 4px 16px rgba(0,184,124,0.18)',
    chipBg: 'rgba(0,184,124,0.10)',
    chipBorder: 'rgba(0,184,124,0.25)',
    chipText: '#34D399',
    scrollThumb: 'rgba(0,184,124,0.25)',
  }
};

/* ─── Animated Particle Background ─────────────────────── */
const ParticleBackground = React.memo(({ isDark }: { isDark: boolean }) => {
  const c = isDark ? '#00B87C' : '#D4A017';  // dark=emerald  light=gold
  const c2 = isDark ? '#10B981' : '#F59E0B';
  const nodes = [
    { x: 60, y: 80 }, { x: 200, y: 40 }, { x: 380, y: 90 }, { x: 560, y: 50 }, { x: 740, y: 100 },
    { x: 120, y: 200 }, { x: 310, y: 170 }, { x: 490, y: 210 }, { x: 660, y: 180 },
    { x: 40, y: 320 }, { x: 240, y: 280 }, { x: 430, y: 330 }, { x: 610, y: 295 }, { x: 790, y: 340 },
  ];
  const links = [
    [0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],
    [0,5],[1,6],[2,7],[3,8],[5,9],[6,10],[7,11],[8,12],[9,10],[10,11],[11,12],[12,13]
  ];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none select-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      {links.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={i % 2 === 0 ? c : c2} strokeWidth="0.8" strokeOpacity={isDark ? '0.20' : '0.16'} />
      ))}
      {nodes.map((n, i) => (
        <circle key={`h${i}`} cx={n.x} cy={n.y} r="8" fill={i % 2 === 0 ? c : c2} fillOpacity={isDark ? '0.06' : '0.08'} />
      ))}
      {nodes.map((n, i) => (
        <circle key={`n${i}`} cx={n.x} cy={n.y} r="2.4" fill={i % 2 === 0 ? c : c2} fillOpacity={isDark ? '0.65' : '0.50'}>
          <animate attributeName="r" values="1.8;3;1.8" dur={`${2.8 + (i % 4) * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values={isDark ? '0.45;0.9;0.45' : '0.35;0.75;0.35'} dur={`${2.8 + (i % 4) * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Floating symbols */}
      <text x="820" y="80" fontSize="18" fill={c} fillOpacity={isDark ? '0.08' : '0.12'} fontFamily="system-ui">✅</text>
      <text x="20" y="370" fontSize="14" fill={c2} fillOpacity={isDark ? '0.08' : '0.12'} fontFamily="system-ui">📋</text>
      <text x="790" y="300" fontSize="16" fill={c} fillOpacity={isDark ? '0.08' : '0.12'} fontFamily="system-ui">🏛️</text>
    </svg>
  );
});

/* ─── Animated Counter ─────────────────────────────────── */
const AnimatedCounter = ({ target, suffix = '', delay = 0 }: { target: number; suffix?: string; delay?: number }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = Math.ceil(target / 30);
      const interval = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(start);
        if (start >= target) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay]);
  return <span>{val}{suffix}</span>;
};

/* ─── Stat Card ─────────────────────────────────────────── */
const StatCard = ({
  value, label, icon, color, isDark, delay = 0, suffix = '', cardIndex = 0
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  isDark: boolean;
  delay?: number;
  suffix?: string;
  cardIndex?: number;
}) => {
  const t = isDark ? T.dark : T.light;
  const floatDuration = 3.2 + cardIndex * 0.45;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.52, type: 'spring', stiffness: 220, damping: 22 }}
      whileHover={{
        y: -6,
        scale: 1.035,
        boxShadow: isDark
          ? `0 16px 36px -6px ${color}35`
          : `0 14px 30px -6px ${color}25`,
        borderColor: color,
        transition: { type: 'spring', stiffness: 380, damping: 24 }
      }}
      className="flex-1 min-w-[100px] rounded-xl p-3.5 relative overflow-hidden cursor-default group"
      style={{
        background: t.cardBg,
        border: `1px solid ${t.border}`,
        backdropFilter: 'blur(14px)',
        boxShadow: t.shadow
      }}
    >
      {/* Shimmer sweep with independent delay per card */}
      <motion.div
        className="absolute top-0 left-0 h-full w-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={{ x: ['-120%', '240%'] }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 2.0 + cardIndex * 0.7
        }}
        style={{ background: `linear-gradient(90deg,transparent,${color}25,transparent)` }}
      />

      {/* Floating icon with micro-motion and status beacon */}
      <motion.div
        animate={{ y: [0, -2.5, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut' }}
        style={{ color }}
        className="mb-1.5 flex items-center justify-between"
      >
        <span>{icon}</span>
        <motion.span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2 + cardIndex * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <div className="text-xl font-black tracking-tight" style={{ color: t.text }}>
        <AnimatedCounter target={value} suffix={suffix} delay={delay * 1000} />
      </div>
      <div className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: t.textMuted }}>
        {label}
      </div>
    </motion.div>
  );
};

interface EligibilityPageProps {
  onNavigateProfile?: () => void;
}

export const EligibilityPage: React.FC<EligibilityPageProps> = ({ onNavigateProfile }) => {
  const { user, profile: authProfile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const t = isDark ? T.dark : T.light;

  const [activeMode, setActiveMode] = useState<EligibilityMode>('my_eligibility');
  const [isLoadingSchemes, setIsLoadingSchemes] = useState<boolean>(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allSchemes, setAllSchemes] = useState<SchemeRecord[]>([]);

  const [myProfile, setMyProfile] = useState<CitizenEligibilityProfile | null>(null);
  const [anotherPersonProfile, setAnotherPersonProfile] = useState<CitizenEligibilityProfile>({
    fullName: 'Citizen',
    age: 35,
    gender: 'Male',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    occupation: 'Farmer',
    caste: 'General',
    isMinority: false,
    hasDisability: false,
    annualFamilyIncome: 150000,
    farmerCategory: 'Small',
    landOwnershipAcres: 2.5,
    ownsLand: true,
    cropType: 'Paddy / Rice',
    irrigationType: 'Borewell / Tube well',
    isOrganicFarmer: false,
    hasLivestock: true,
    isWomanFarmer: false,
    isTenantFarmer: false,
    hasAadhaar: true,
    hasBankAccountLinked: true,
    isPmKisanBeneficiary: true,
    hasSoilHealthCard: true
  });

  const [activeCategory, setActiveCategory] = useState<FilterCategory>('eligible');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('match');

  /* Subtle 3D tilt on mouse */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useTransform(mouseY, [-200, 200], [1.2, -1.2]), { stiffness: 160, damping: 28 });
  const rotY = useSpring(useTransform(mouseX, [-300, 300], [-1.2, 1.2]), { stiffness: 160, damping: 28 });

  const loadSchemes = async (force = false) => {
    try {
      setIsLoadingSchemes(true);
      setError(null);
      const schemes = await fetchAgricultureSchemes(force);
      setAllSchemes(schemes);
    } catch (err: any) {
      setError('Could not connect to Supabase database. Please check your connection and retry.');
    } finally {
      setIsLoadingSchemes(false);
    }
  };

  const loadProfile = async () => {
    if (!user?.uid) { setIsLoadingProfile(false); return; }
    try {
      setIsLoadingProfile(true);
      const dbProfile = await fetchCitizenProfileFromSupabase(user.uid);
      if (dbProfile) {
        setMyProfile(dbProfile);
      } else if (authProfile) {
        setMyProfile({
          fullName: authProfile.fullName || 'Citizen',
          age: authProfile.age || 35,
          gender: (authProfile.gender as any) || 'Male',
          state: authProfile.state || 'Andhra Pradesh',
          district: authProfile.district || 'Guntur',
          occupation: authProfile.occupation || 'Farmer',
          caste: (authProfile.casteCategory as any) || 'General',
          annualFamilyIncome: authProfile.annualFamilyIncome ? Number(authProfile.annualFamilyIncome) : 150000,
          farmerCategory: 'Small',
          landOwnershipAcres: 2.0,
          ownsLand: true,
          cropType: 'Paddy / Rice',
          irrigationType: 'Borewell / Tube well',
          isOrganicFarmer: false,
          hasLivestock: true,
          isWomanFarmer: authProfile.gender === 'Female',
          isTenantFarmer: false,
          hasAadhaar: true,
          hasBankAccountLinked: true,
          isPmKisanBeneficiary: true,
          hasSoilHealthCard: true
        });
      }
    } catch (err) {
      console.error('[EligibilityPage] Profile load error:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadSchemes();
    loadProfile();
  }, [user?.uid]);

  const activeCitizen = useMemo<CitizenEligibilityProfile>(() => {
    if (activeMode === 'my_eligibility') {
      return myProfile || {
        state: 'Andhra Pradesh', age: 35, gender: 'Male', occupation: 'Farmer',
        annualFamilyIncome: 150000, farmerCategory: 'Small', landOwnershipAcres: 2.0,
        ownsLand: true, hasAadhaar: true, hasBankAccountLinked: true,
        isPmKisanBeneficiary: true, hasSoilHealthCard: true
      };
    }
    return anotherPersonProfile;
  }, [activeMode, myProfile, anotherPersonProfile]);

  const allEvaluatedResults = useMemo<EvaluationResult[]>(() => {
    if (!allSchemes || allSchemes.length === 0) return [];
    return evaluateAllSchemes(allSchemes, activeCitizen);
  }, [allSchemes, activeCitizen]);

  const filteredResults = useMemo<EvaluationResult[]>(() => {
    let filtered = [...allEvaluatedResults];
    if (activeCategory === 'eligible') filtered = filtered.filter(r => r.category === 'eligible');
    else if (activeCategory === 'partial') filtered = filtered.filter(r => r.category === 'partial');
    else if (activeCategory === 'not_eligible') filtered = filtered.filter(r => r.category === 'not_eligible');
    else if (activeCategory === 'central') filtered = filtered.filter(r => { const st = (r.scheme.state || '').toLowerCase(); return !st || st === 'all' || st === 'central'; });
    else if (activeCategory === 'state') filtered = filtered.filter(r => { const st = (r.scheme.state || '').toLowerCase(); return st && st !== 'all' && st !== 'central'; });
    else if (activeCategory === 'women') filtered = filtered.filter(r => {
      const allTags = [
        ...(r.scheme.farmer_tags || []),
        ...(r.scheme.target_demographic || []),
        ...(r.scheme.tags || []),
        ...(r.scheme.eligibility_tags || [])
      ].map(t => t.toLowerCase());
      const name = (r.scheme.scheme_name || '').toLowerCase();
      const desc = (r.scheme.description || '').toLowerCase();
      return (
        allTags.some(t => t.includes('women') || t.includes('mahila') || t.includes('female')) ||
        name.includes('mahila') ||
        name.includes('women') ||
        desc.includes('women') ||
        desc.includes('mahila')
      );
    });
    else if (activeCategory === 'small') filtered = filtered.filter(r => { const tags = (r.scheme.farmer_tags || []).map(t => t.toLowerCase()); return tags.some(t => t.includes('small') || t.includes('marginal')); });
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.scheme.scheme_name.toLowerCase().includes(q) ||
        (r.scheme.ministry || '').toLowerCase().includes(q) ||
        (r.scheme.description || '').toLowerCase().includes(q) ||
        (r.scheme.state || '').toLowerCase().includes(q) ||
        r.benefitSummary.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'name') filtered.sort((a, b) => a.scheme.scheme_name.localeCompare(b.scheme.scheme_name));
    else if (sortBy === 'benefit') filtered.sort((a, b) => (b.benefitAmount ? 1 : 0) - (a.benefitAmount ? 1 : 0));
    else filtered.sort((a, b) => b.score - a.score);
    return filtered;
  }, [allEvaluatedResults, activeCategory, searchQuery, sortBy]);

  const eligibleCount = useMemo(() => allEvaluatedResults.filter(r => r.category === 'eligible').length, [allEvaluatedResults]);
  const partialCount = useMemo(() => allEvaluatedResults.filter(r => r.category === 'partial').length, [allEvaluatedResults]);

  return (
    <div className="space-y-6 w-full">
      {/* ═══════════════ HERO SECTION (OPEN LAYOUT MATCHING EXPLORE SCHEMES) ═══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full space-y-6 pt-1"
      >
        {/* Header Content: Centered Badge, Title, Accent Underline, Subtitle & Tabs */}
        <div className="text-center space-y-4">
          {/* Badge */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase backdrop-blur-md shadow-sm ${
              isDark ? 'border-[#00B87C]/30 bg-[#00B87C]/8 text-[#34D399]' : 'border-[#D4A017]/35 bg-[#FFF5D6] text-[#8A6210]'
            }`}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: t.accent }} />
              Digital Public Infrastructure • AI Eligibility Engine
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-heading leading-tight">
              <span style={{ color: t.text }}>Check Scheme </span>
              <span className={isDark
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00B87C] via-[#10B981] to-[#34D399]'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-[#B48418] via-[#D4A017] to-[#F59E0B]'
              }>
                Eligibility
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
            <p className="text-xs sm:text-sm max-w-lg mx-auto font-medium pt-1" style={{ color: t.textMuted }}>
              Instantly discover agriculture government schemes you qualify for — evaluated in real-time against your verified citizen profile.
            </p>
          </div>

          {/* Mode Selection Tabs in Center */}
          <div className="flex justify-center pt-2">
            <EligibilityTabs
              activeMode={activeMode}
              onSelectMode={setActiveMode}
              isDark={isDark}
            />
          </div>
        </div>

        {/* 3 Metric Cards matching Explore Schemes style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {[
              {
                label: 'Eligible Schemes',
                value: eligibleCount,
                sub: '● 100% Verified Match',
                icon: <Award className="w-5 h-5" />,
                colored: true,
              },
              {
                label: 'Partially Eligible',
                value: partialCount,
                sub: 'Minor criteria pending',
                icon: <Sparkles className="w-5 h-5" />,
                colored: true,
              },
              {
                label: 'Total Evaluated',
                value: allEvaluatedResults.length,
                sub: '● Real-time database check',
                icon: <ShieldCheck className="w-5 h-5" />,
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
                  <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: t.textMuted }}>
                    {stat.label}
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-black font-heading" style={{ color: t.text }}>
                    <AnimatedCounter target={stat.value} delay={si * 150} />
                  </h4>
                  <span
                    className="text-[10px] font-semibold block"
                    style={{ color: stat.colored ? t.accent : t.textMuted }}
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

      {/* ── ERROR ALERT ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold"
            style={{
              background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(254,242,242,1)',
              border: isDark ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(252,165,165,0.8)',
              color: isDark ? '#FCA5A5' : '#991B1B'
            }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={() => loadSchemes(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)' }}>
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TAB FORMS ── */}
      <AnimatePresence mode="wait">
        {activeMode === 'my_eligibility' && (
          <motion.div key="my_eligibility"
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <MyEligibilityForm
              profile={myProfile}
              isLoading={isLoadingProfile}
              onRefresh={loadProfile}
              onNavigateProfile={onNavigateProfile}
              isDark={isDark}
            />
          </motion.div>
        )}
        {activeMode === 'another_person' && (
          <motion.div key="another_person"
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnotherPersonForm
              initialData={anotherPersonProfile}
              onEvaluate={(newProfile) => setAnotherPersonProfile(newProfile)}
              isDark={isDark}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RESULTS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          <EligibilityFilters
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            eligibleCount={eligibleCount}
            partialCount={partialCount}
            totalCount={allEvaluatedResults.length}
            isDark={isDark}
          />

          {/* Loading Skeleton — premium shimmer */}
          {isLoadingSchemes ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="h-40 rounded-2xl relative overflow-hidden"
                  style={{ background: isDark ? 'rgba(12,26,43,0.88)' : 'rgba(240,253,244,0.8)', border: `1px solid ${t.border}` }}>
                  <motion.div className="absolute inset-0"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
                    style={{ background: `linear-gradient(90deg,transparent,${t.accentGlow},transparent)` }}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <EligibilityResults
              results={filteredResults}
              activeCategory={activeCategory}
              isDark={isDark}
            />
          )}
        </div>

        {/* Right sticky sidebar */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <CitizenSummaryCard
            citizen={activeCitizen}
            results={allEvaluatedResults}
            isDark={isDark}
          />
          <MissingInformationCard
            citizen={activeCitizen}
            onUpdateProfile={(updates) => {
              if (activeMode === 'my_eligibility') {
                setMyProfile(prev => (prev ? { ...prev, ...updates } : null));
              } else {
                setAnotherPersonProfile(prev => ({ ...prev, ...updates }));
              }
            }}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
};

export default EligibilityPage;
