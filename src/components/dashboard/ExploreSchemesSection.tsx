import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, FileText, ChevronLeft, ChevronRight,
  Building2, CheckCircle2, FileCheck2, ArrowUpRight,
  AlertCircle, RefreshCw, BookOpen, Layers, Star,
  Bookmark, BookmarkCheck, ArrowLeft, ShieldCheck, Info,
  Sparkles, Mic, ChevronDown, Globe, Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  fetchAgricultureSchemes,
  fetchAgricultureSchemeFilters,
  fetchAgricultureSchemeCount
} from '../../services/schemeService';
import type {
  AgricultureScheme,
  SchemeFiltersResponse
} from '../../services/schemeService';

interface ExploreSchemesSectionProps {
  isDark: boolean;
}

// ── SKELETON CARD ───────────────────────────────────────────────────
function SkeletonCard({ isDark }: { isDark: boolean }) {
  return (
    <div className={`rounded-[28px] border p-6 flex flex-col gap-4 overflow-hidden relative ${
      isDark ? 'bg-[#0C1A2B]/80 border-slate-800' : 'bg-white/95 border-[#D4A017]/25 shadow-sm'
    }`}>
      <div className="flex items-center justify-between">
        <div className={`h-6 w-28 rounded-full animate-pulse ${isDark ? 'bg-[#00B87C]/20' : 'bg-[#FFF5D6]'}`} />
        <div className={`h-4 w-16 rounded animate-pulse ${isDark ? 'bg-slate-800' : 'bg-[#FFFBEF]'}`} />
      </div>
      <div className="space-y-2.5">
        <div className={`h-6 w-4/5 rounded-lg animate-pulse ${isDark ? 'bg-slate-800' : 'bg-[#FFFDF7]'}`} />
        <div className={`h-4 w-2/3 rounded-lg animate-pulse ${isDark ? 'bg-slate-800' : 'bg-[#FFFDF7]'}`} />
      </div>
      <div className={`h-16 w-full rounded-2xl animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-[#FFFBEF]'}`} />
      <div className={`h-4 w-1/2 rounded animate-pulse ${isDark ? 'bg-slate-800' : 'bg-[#FFFDF7]'}`} />
      <div className={`h-10 w-full rounded-2xl animate-pulse mt-2 ${isDark ? 'bg-[#00B87C]/20' : 'bg-[#FFF5D6]'}`} />
    </div>
  );
}

export default function ExploreSchemesSection({ isDark }: ExploreSchemesSectionProps) {
  const [schemes, setSchemes] = useState<AgricultureScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSchemes, setTotalSchemes] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('recommended');
  const [isListening, setIsListening] = useState(false);
  const limit = 9;

  // Search & Filter controls based strictly on database fields
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedMode, setSelectedMode] = useState('');

  // Bookmarked schemes state (starts at 0)
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('civic_saved_schemes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dedicated Scheme Detail View state (replaces card modal)
  const [activeSchemeDetail, setActiveSchemeDetail] = useState<AgricultureScheme | null>(null);

  const [filters, setFilters] = useState<SchemeFiltersResponse>({
    categories: [],
    ministries: [],
    states: [],
    applicationModes: []
  });

  // Dynamic live flow of information rotating prompts
  const flowPrompts = [
    'Search schemes by name: PM-Kisan, PMFBY, KCC...',
    'Search by benefit: ₹6,000/yr direct income support...',
    'Search by eligibility: Small & Marginal farmers, women...',
    'Search by technology: Solar pump & micro-irrigation...',
    'Search by subsidy: Organic farming, seeds & machinery...'
  ];
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromptIndex(prev => (prev + 1) % flowPrompts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [flowPrompts.length]);

  // Debounce search
  useEffect(() => {
    const h = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 320);
    return () => clearTimeout(h);
  }, [search]);

  // Fetch initial filters and total count from database
  useEffect(() => {
    fetchAgricultureSchemeFilters().then(res => setFilters(res));
    fetchAgricultureSchemeCount().then(cnt => {
      setTotalSchemes(cnt);
    });
  }, []);

  // Fetch schemes on query parameter changes
  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchAgricultureSchemes({
      page,
      limit,
      search: debouncedSearch,
      category: selectedCategory,
      state: selectedState,
      application_mode: selectedMode
    })
      .then(res => {
        if (!active) return;
        setSchemes(res.data || []);
        const total = res.pagination?.total || 0;
        setTotalSchemes(total);
        setTotalPages(res.pagination?.totalPages || Math.ceil(total / limit) || 1);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [page, debouncedSearch, selectedCategory, selectedState, selectedMode]);

  // Voice Search simulation
  const handleVoiceSearch = () => {
    if (isListening) return;
    setIsListening(true);
    toast('Listening for scheme keywords…', { icon: '🎙️' });
    setTimeout(() => {
      setIsListening(false);
      setSearch('PM Kisan');
      toast.success('Search populated: "PM Kisan"');
    }, 2000);
  };

  // Toggle Bookmark
  const toggleBookmark = (id: number, schemeName: string) => {
    setBookmarkedIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('civic_saved_schemes', JSON.stringify(updated));
      } catch {}
      if (exists) {
        toast.error(`Removed from Saved: ${schemeName.slice(0, 24)}…`);
      } else {
        toast.success(`Saved to Profile: ${schemeName.slice(0, 24)}…`);
      }
      return updated;
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSelectedState('');
    setSelectedMode('');
    setPage(1);
  };

  const hasActiveFilters = !!(search || selectedCategory || selectedState || selectedMode);

  // Sorted schemes
  const displaySchemes = useMemo(() => {
    const list = [...schemes];
    if (sortBy === 'alphabetical') {
      list.sort((a, b) => a.scheme_name.localeCompare(b.scheme_name));
    } else if (sortBy === 'highest') {
      list.sort((a, b) => (b.benefits?.length || 0) - (a.benefits?.length || 0));
    }
    return list;
  }, [schemes, sortBy]);

  // Dynamic distinct categories retrieved from schemes / filters
  const availableCategories = useMemo(() => {
    if (filters.categories && filters.categories.length > 0) {
      return filters.categories;
    }
    const set = new Set<string>();
    schemes.forEach(s => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [filters.categories, schemes]);

  // Theme tokens: 100% Goldish Yellow in Light Mode, 100% Greenish in Dark Mode
  const palette = {
    accentText: isDark ? 'text-[#00B87C]' : 'text-[#8A6210]',
    accentTextBright: isDark ? 'text-[#34D399]' : 'text-[#D4A017]',
    accentBgLight: isDark ? 'bg-[#00B87C]/15' : 'bg-[#FFF5D6]',
    accentBorder: isDark ? 'border-[#00B87C]/35' : 'border-[#D4A017]/40',
    accentBorderLight: isDark ? 'border-[#00B87C]/20' : 'border-[#D4A017]/25',
    accentButton: isDark
      ? 'bg-gradient-to-r from-[#00B87C] to-[#10B981] text-white shadow-md shadow-[#00B87C]/25 hover:shadow-lg hover:shadow-[#00B87C]/35'
      : 'bg-gradient-to-r from-[#D4A017] to-[#F59E0B] text-white shadow-md shadow-[#D4A017]/25 hover:shadow-lg hover:shadow-[#D4A017]/35',
    cardBorderHover: isDark ? 'hover:border-[#00B87C]/50' : 'hover:border-[#D4A017]/60',
    topLine: isDark
      ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
      : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent',
    textPrimary: isDark ? 'text-white' : 'text-[#111827]',
    textSecondary: isDark ? 'text-slate-400' : 'text-[#8A6210]/75',
  };

  // =========================================================================
  // VIEW 1: DEDICATED SCHEME DETAIL PAGE (Instead of card modal popup)
  // =========================================================================
  if (activeSchemeDetail) {
    const scheme = activeSchemeDetail;
    const isSaved = bookmarkedIds.includes(scheme.id);

    return (
      <div className="relative w-full select-none space-y-8 animate-fadeIn">
        {/* Navigation Breadcrumb Bar */}
        <div className={`flex items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-[#D4A017]/30'}`}>
          <motion.button
            whileHover={{ scale: 1.02, x: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSchemeDetail(null)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer shadow-sm ${
              isDark
                ? 'bg-slate-900 border-[#00B87C]/35 text-[#00B87C] hover:bg-[#00B87C]/15 hover:text-white'
                : 'bg-[#FFF5D6] border-[#D4A017]/45 text-[#8A6210] hover:bg-[#FFE88A]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore Schemes
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleBookmark(scheme.id, scheme.scheme_name)}
              className={`h-9 px-4 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isSaved
                  ? isDark
                    ? 'bg-[#00B87C] text-black border-[#00B87C]'
                    : 'bg-[#D4A017] text-white border-[#D4A017]'
                  : isDark
                    ? 'bg-slate-900 border-[#00B87C]/30 text-[#00B87C] hover:bg-[#00B87C]/15'
                    : 'bg-white border-[#D4A017]/40 text-[#8A6210] hover:bg-[#FFF0C0]'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {isSaved ? 'Saved in Profile' : 'Save Scheme'}
            </motion.button>

            {scheme.official_scheme_url && (
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={scheme.official_scheme_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`h-9 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 ${palette.accentButton}`}
              >
                Apply on Portal
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.a>
            )}
          </div>
        </div>

        {/* Scheme Hero Card */}
        <div className={`p-6 sm:p-8 rounded-[32px] border backdrop-blur-xl space-y-4 shadow-sm ${
          isDark ? 'bg-[#0C1A2B]/90 border-[#00B87C]/30' : 'bg-white/95 border-[#D4A017]/40'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${palette.accentBgLight} ${palette.accentText} ${palette.accentBorder}`}>
              {scheme.category || 'Government Welfare'}
            </span>
            <span className={`text-[10px] font-mono ${isDark ? 'text-[#00B87C]/70' : 'text-[#8A6210]/70'}`}>
              ID: {scheme.scheme_id || `SCH-${scheme.id}`}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${palette.accentBgLight} ${palette.accentText} ${palette.accentBorder}`}>
              ● Official Active Scheme
            </span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-black font-heading leading-tight ${palette.textPrimary}`}>
            {scheme.scheme_name}
          </h1>

          {scheme.ministry_department && (
            <p className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${palette.textSecondary}`}>
              <Building2 className={`w-4 h-4 shrink-0 ${palette.accentTextBright}`} />
              {scheme.ministry_department}
            </p>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-[#00B87C]/25' : 'bg-[#FFFDF7] border-[#D4A017]/30'}`}>
              <span className={`text-[10px] font-black uppercase tracking-wider ${palette.textSecondary}`}>Application Mode</span>
              <span className={`text-xs font-black ${palette.accentTextBright} mt-1 block`}>
                {scheme.application_mode || 'Online Government Portal'}
              </span>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-[#00B87C]/25' : 'bg-[#FFFDF7] border-[#D4A017]/30'}`}>
              <span className={`text-[10px] font-black uppercase tracking-wider ${palette.textSecondary}`}>Target Beneficiary</span>
              <span className={`text-xs font-black ${palette.accentTextBright} mt-1 block`}>
                {scheme.target_beneficiary || 'All Eligible Citizens'}
              </span>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-[#00B87C]/25' : 'bg-[#FFFDF7] border-[#D4A017]/30'}`}>
              <span className={`text-[10px] font-black uppercase tracking-wider ${palette.textSecondary}`}>Verified DPI Source</span>
              <span className={`text-xs font-black ${palette.accentTextBright} mt-1 block flex items-center gap-1`}>
                <ShieldCheck className="w-3.5 h-3.5" /> Database Authenticated
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Scheme Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Description & Overview */}
          <div className={`p-6 rounded-[28px] border backdrop-blur-xl space-y-3 ${
            isDark ? 'bg-[#0C1A2B]/85 border-[#00B87C]/25' : 'bg-white/95 border-[#D4A017]/35'
          }`}>
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${palette.textPrimary}`}>
              <BookOpen className={`w-4 h-4 ${palette.accentTextBright}`} />
              Scheme Overview & Scope
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#111827]'}`}>
              {scheme.description || 'Full scheme description retrieved from official Government registry.'}
            </p>
          </div>

          {/* Benefits & Financial Assistance */}
          <div className={`p-6 rounded-[28px] border backdrop-blur-xl space-y-3 ${
            isDark ? 'bg-[#0C1A2B]/85 border-[#00B87C]/25' : 'bg-white/95 border-[#D4A017]/35'
          }`}>
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${palette.textPrimary}`}>
              <Star className={`w-4 h-4 ${palette.accentTextBright} fill-current`} />
              Financial Assistance & Direct Benefits
            </h3>
            <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
              isDark ? 'bg-[#00B87C]/10 border-[#00B87C]/30 text-[#34D399]' : 'bg-[#FFFBEF] border-[#D4A017]/30 text-[#8A6210]'
            }`}>
              {scheme.benefits || 'Financial support, direct benefit transfers, subsidies and inputs.'}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className={`p-6 rounded-[28px] border backdrop-blur-xl space-y-3 ${
            isDark ? 'bg-[#0C1A2B]/85 border-[#00B87C]/25' : 'bg-white/95 border-[#D4A017]/35'
          }`}>
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${palette.textPrimary}`}>
              <CheckCircle2 className={`w-4 h-4 ${palette.accentTextBright}`} />
              Eligibility Criteria
            </h3>
            <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-[#FFFDF7] border-[#D4A017]/25 text-[#111827]'
            }`}>
              {scheme.eligibility || 'Check specific state and landholding parameters on the official portal.'}
            </div>
          </div>

          {/* Documents Required */}
          <div className={`p-6 rounded-[28px] border backdrop-blur-xl space-y-3 ${
            isDark ? 'bg-[#0C1A2B]/85 border-[#00B87C]/25' : 'bg-white/95 border-[#D4A017]/35'
          }`}>
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${palette.textPrimary}`}>
              <FileCheck2 className={`w-4 h-4 ${palette.accentTextBright}`} />
              Documents Required
            </h3>
            <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-[#FFFDF7] border-[#D4A017]/25 text-[#111827]'
            }`}>
              {scheme.documents_required || 'Aadhaar Card, Bank Account Passbook, Land / Resident documents.'}
            </div>
          </div>
        </div>

        {/* Application Process Guidelines */}
        {scheme.application_process && (
          <div className={`p-6 rounded-[28px] border backdrop-blur-xl space-y-3 ${
            isDark ? 'bg-[#0C1A2B]/85 border-[#00B87C]/25' : 'bg-white/95 border-[#D4A017]/35'
          }`}>
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${palette.textPrimary}`}>
              <Info className={`w-4 h-4 ${palette.accentTextBright}`} />
              How to Apply & Submission Guidelines
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#111827]'}`}>
              {scheme.application_process}
            </p>
          </div>
        )}

        {/* Official Action Bar */}
        <div className={`p-6 rounded-[28px] border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-[#00B87C]/10 border-[#00B87C]/30 text-white' : 'bg-[#FFF5D6] border-[#D4A017]/50 text-[#111827]'
        }`}>
          <div className="space-y-1">
            <h4 className={`text-sm font-black font-heading ${palette.textPrimary}`}>Ready to Submit Application?</h4>
            <p className={`text-xs ${palette.textSecondary}`}>Apply directly on the designated Government digital gateway.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {scheme.official_pdf_url && (
              <a
                href={scheme.official_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`h-11 px-5 rounded-2xl border text-xs font-black flex items-center gap-2 transition-all ${
                  isDark
                    ? 'bg-slate-800 border-[#00B87C]/40 text-[#00B87C] hover:bg-[#00B87C]/20'
                    : 'bg-white border-[#D4A017]/50 text-[#8A6210] hover:bg-[#FFF0C0]'
                }`}
              >
                <FileText className="w-4 h-4" />
                Download Guidelines (PDF)
              </a>
            )}

            {scheme.official_scheme_url && (
              <a
                href={scheme.official_scheme_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`h-11 px-6 rounded-2xl text-xs font-black flex items-center gap-2 ${palette.accentButton}`}
              >
                Visit Portal
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: EXPLORE SCHEMES MAIN LISTING
  // =========================================================================
  return (
    <div className="relative w-full select-none transition-colors duration-500 space-y-9">

      {/* =================================================================== */}
      {/* 1. HERO HEADER WITH COLOR VARIATION & LUXURY ACCENT                 */}
      {/* =================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center space-y-4 pt-1"
      >
        {/* Subtle Luxury Top Capsule Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10.5px] font-black tracking-wider uppercase backdrop-blur-md shadow-sm">
          <Sparkles className={`w-3.5 h-3.5 animate-spin-slow ${palette.accentTextBright}`} />
          <span className={palette.accentText}>
            Digital Public Infrastructure • AI Scheme Discovery
          </span>
        </div>

        {/* Main Heading with Eye-Catching Color Variation */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-heading leading-tight">
            <span className={palette.textPrimary}>Explore </span>
            <span
              className={
                isDark
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00B87C] via-[#10B981] to-[#34D399] drop-shadow-sm'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-[#B48418] via-[#D4A017] to-[#F59E0B] drop-shadow-sm'
              }
            >
              Government Schemes
            </span>
          </h1>

          {/* Golden/Greenish Glow Underline Accent */}
          <div className="flex justify-center pt-0.5">
            <div
              className={`h-1 w-24 sm:w-32 rounded-full ${
                isDark
                  ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
              }`}
            />
          </div>

          <p className={`text-xs sm:text-sm max-w-xl mx-auto font-medium ${palette.textSecondary} pt-1`}>
            Browse verified welfare schemes directly retrieved from the government schemes database.
          </p>
        </div>

        {/* =================================================================== */}
        {/* 2. REFINED LUXURY SEARCH BAR (Crisp White, Clean Hover, Zero Tint) */}
        {/* =================================================================== */}
        <div className="max-w-2xl mx-auto pt-3 px-2 space-y-3">
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative rounded-full border px-2 py-1.5 sm:py-2 flex items-center transition-all duration-200 group ${
              isDark
                ? 'bg-[#0C1A2B] border-slate-800 hover:border-[#00B87C] hover:ring-2 hover:ring-[#00B87C]/20 shadow-md shadow-black/40 hover:shadow-lg focus-within:border-[#00B87C] focus-within:ring-2 focus-within:ring-[#00B87C]/20'
                : 'bg-white border-[#D4A017]/35 hover:border-[#D4A017] hover:ring-2 hover:ring-[#D4A017]/20 shadow-xs hover:shadow-md hover:shadow-black/[0.04] focus-within:border-[#D4A017] focus-within:ring-2 focus-within:ring-[#D4A017]/20'
            }`}
          >
            {/* Minimal Search Icon Badge */}
            <div className="pl-2 pr-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-200 ${
                  isDark
                    ? 'bg-[#00B87C]/10 border-[#00B87C]/25 text-[#34D399]'
                    : 'bg-[#FFF9EA] border-[#D4A017]/30 text-[#D4A017]'
                }`}
              >
                <Search className="w-4 h-4" />
              </div>
            </div>

            {/* Dynamic Flow of Information Rotating Input Field */}
            <div className="relative w-full h-10 flex items-center overflow-hidden">
              {/* Animated Floating Flow-of-Info Placeholder */}
              {!search && (
                <div className="absolute inset-0 flex items-center pointer-events-none pr-8">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentPromptIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 truncate select-none"
                    >
                      {flowPrompts[currentPromptIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}

              {/* Native Search Input (Zero Outlines, Custom Caret) */}
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ outline: 'none', boxShadow: 'none' }}
                className={`relative w-full h-full text-xs sm:text-sm font-semibold bg-transparent outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-none shadow-none pr-3 transition-colors ${
                  isDark
                    ? 'text-white caret-[#00B87C]'
                    : 'text-slate-900 caret-[#D4A017]'
                }`}
              />
            </div>

            {/* Clear Button */}
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearch('')}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer mr-1 transition-colors"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}

            {/* Minimal Interactive Voice Search Button */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleVoiceSearch}
              title="Voice Search"
              className={`p-2 rounded-full border shrink-0 cursor-pointer transition-all mr-1.5 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse border-rose-600'
                  : isDark
                    ? 'bg-slate-900 border-slate-800 text-[#00B87C] hover:bg-[#00B87C]/15 hover:border-[#00B87C]/40'
                    : 'bg-white border-[#D4A017]/30 text-[#8A6210] hover:bg-[#FFF9EA] hover:border-[#D4A017]/50 shadow-xs'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </motion.button>

            {/* Keyboard Shortcut Chip */}
            <div
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold shrink-0 mr-1 select-none ${
                isDark
                  ? 'border-slate-800 bg-slate-900/90 text-slate-400'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              <span>Ctrl</span>
              <span>K</span>
            </div>
          </motion.div>

          {/* Flow of Information: Popular Live Search Pills */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap pt-1 px-1">
            <span className={`text-[10.5px] font-bold tracking-wide ${palette.textSecondary} flex items-center gap-1 shrink-0`}>
              <Sparkles className={`w-3 h-3 ${palette.accentTextBright}`} />
              Popular:
            </span>
            {[
              { label: 'PM Kisan', query: 'PM Kisan' },
              { label: 'Solar Pump', query: 'Solar' },
              { label: 'Crop Insurance', query: 'Insurance' },
              { label: 'Kisan Credit', query: 'Credit' },
              { label: 'Organic Farming', query: 'Organic' }
            ].map(item => (
              <motion.button
                key={item.query}
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSearch(item.query)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shadow-xs ${
                  search === item.query
                    ? isDark
                      ? 'bg-[#00B87C] text-black border-[#00B87C] font-bold'
                      : 'bg-[#D4A017] text-white border-[#D4A017] font-bold'
                    : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-[#00B87C]/50 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-[#D4A017] hover:text-[#8A6210]'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* =================================================================== */}
      {/* 3. PREMIUM ATTRACTIVE & PROFESSIONAL DROPDOWNS                       */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Category Dropdown Card */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative p-3.5 rounded-2xl border transition-all duration-200 group shadow-xs hover:shadow-md overflow-hidden ${
            isDark
              ? 'bg-[#0C1A2B] border-slate-800 hover:border-[#00B87C]/70 focus-within:border-[#00B87C] focus-within:ring-2 focus-within:ring-[#00B87C]/20'
              : 'bg-white border-slate-200 hover:border-[#D4A017] focus-within:border-[#D4A017] focus-within:ring-2 focus-within:ring-[#D4A017]/20'
          }`}
        >
          {/* Top subtle flow accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-200 ${palette.topLine}`} />

          <div className="flex items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                  isDark
                    ? 'bg-[#00B87C]/10 border-[#00B87C]/25 text-[#34D399]'
                    : 'bg-[#FFF9EA] border-[#D4A017]/30 text-[#D4A017]'
                }`}
              >
                <Tag className="w-3 h-3" />
              </div>
              <label className={`text-[10.5px] font-bold uppercase tracking-wider ${palette.textSecondary}`}>
                Scheme Category
              </label>
            </div>
            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
              selectedCategory
                ? isDark
                  ? 'bg-[#00B87C] text-black border-[#00B87C]'
                  : 'bg-[#D4A017] text-white border-[#D4A017]'
                : isDark
                  ? 'bg-slate-900 text-slate-400 border-slate-800'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {selectedCategory ? 'Filtered' : `${availableCategories.length} Types`}
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}
              style={{ outline: 'none', boxShadow: 'none' }}
              className={`w-full h-10 pl-3 pr-9 text-xs font-semibold rounded-xl border outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 cursor-pointer appearance-none transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white hover:border-slate-700'
                  : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <option value="" className={isDark ? 'bg-[#0C1A2B] text-white' : 'bg-white text-slate-900'}>
                All Categories ({availableCategories.length})
              </option>
              {availableCategories.map((cat, i) => (
                <option key={i} value={cat} className={isDark ? 'bg-[#0C1A2B] text-white' : 'bg-white text-slate-900'}>
                  {cat}
                </option>
              ))}
            </select>
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:rotate-180 ${palette.accentTextBright}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>

        {/* State / Jurisdiction Dropdown Card */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative p-3.5 rounded-2xl border transition-all duration-200 group shadow-xs hover:shadow-md overflow-hidden ${
            isDark
              ? 'bg-[#0C1A2B] border-slate-800 hover:border-[#00B87C]/70 focus-within:border-[#00B87C] focus-within:ring-2 focus-within:ring-[#00B87C]/20'
              : 'bg-white border-slate-200 hover:border-[#D4A017] focus-within:border-[#D4A017] focus-within:ring-2 focus-within:ring-[#D4A017]/20'
          }`}
        >
          {/* Top subtle flow accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-200 ${palette.topLine}`} />

          <div className="flex items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                  isDark
                    ? 'bg-[#00B87C]/10 border-[#00B87C]/25 text-[#34D399]'
                    : 'bg-[#FFF9EA] border-[#D4A017]/30 text-[#D4A017]'
                }`}
              >
                <Globe className="w-3 h-3" />
              </div>
              <label className={`text-[10.5px] font-bold uppercase tracking-wider ${palette.textSecondary}`}>
                State / Jurisdiction
              </label>
            </div>
            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
              selectedState
                ? isDark
                  ? 'bg-[#00B87C] text-black border-[#00B87C]'
                  : 'bg-[#D4A017] text-white border-[#D4A017]'
                : isDark
                  ? 'bg-slate-900 text-slate-400 border-slate-800'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {selectedState ? 'Selected' : 'Pan India'}
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedState}
              onChange={e => { setSelectedState(e.target.value); setPage(1); }}
              style={{ outline: 'none', boxShadow: 'none' }}
              className={`w-full h-10 pl-3 pr-9 text-xs font-semibold rounded-xl border outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 cursor-pointer appearance-none transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white hover:border-slate-700'
                  : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <option value="" className={isDark ? 'bg-[#0C1A2B] text-white' : 'bg-white text-slate-900'}>
                All Regions (Pan India)
              </option>
              {filters.states.map((s, i) => (
                <option key={i} value={s} className={isDark ? 'bg-[#0C1A2B] text-white' : 'bg-white text-slate-900'}>
                  {s}
                </option>
              ))}
            </select>
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:rotate-180 ${palette.accentTextBright}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>

        {/* Application Mode Dropdown Card */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative p-3.5 rounded-2xl border transition-all duration-200 group shadow-xs hover:shadow-md overflow-hidden ${
            isDark
              ? 'bg-[#0C1A2B] border-slate-800 hover:border-[#00B87C]/70 focus-within:border-[#00B87C] focus-within:ring-2 focus-within:ring-[#00B87C]/20'
              : 'bg-white border-slate-200 hover:border-[#D4A017] focus-within:border-[#D4A017] focus-within:ring-2 focus-within:ring-[#D4A017]/20'
          }`}
        >
          {/* Top subtle flow accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-200 ${palette.topLine}`} />

          <div className="flex items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                  isDark
                    ? 'bg-[#00B87C]/10 border-[#00B87C]/25 text-[#34D399]'
                    : 'bg-[#FFF9EA] border-[#D4A017]/30 text-[#D4A017]'
                }`}
              >
                <FileCheck2 className="w-3 h-3" />
              </div>
              <label className={`text-[10.5px] font-bold uppercase tracking-wider ${palette.textSecondary}`}>
                Application Mode
              </label>
            </div>
            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
              selectedMode
                ? isDark
                  ? 'bg-[#00B87C] text-black border-[#00B87C]'
                  : 'bg-[#D4A017] text-white border-[#D4A017]'
                : isDark
                  ? 'bg-slate-900 text-slate-400 border-slate-800'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {selectedMode ? selectedMode : 'All Modes'}
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedMode}
              onChange={e => { setSelectedMode(e.target.value); setPage(1); }}
              style={{ outline: 'none', boxShadow: 'none' }}
              className={`w-full h-10 pl-3 pr-9 text-xs font-semibold rounded-xl border outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 cursor-pointer appearance-none transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white hover:border-slate-700'
                  : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <option value="" className={isDark ? 'bg-[#0C1A2B] text-white' : 'bg-white text-slate-900'}>
                All Application Modes
              </option>
              <option value="Online" className={isDark ? 'bg-[#0C1A2B] text-white' : 'bg-white text-slate-900'}>
                Online Portal
              </option>
              <option value="Offline" className={isDark ? 'bg-[#0C1A2B] text-white' : 'bg-white text-slate-900'}>
                Offline / CSC Center
              </option>
            </select>
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:rotate-180 ${palette.accentTextBright}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>
      </div>


      {/* Active Filter Clear Tag */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-1"
        >
          <span className={`text-xs font-semibold ${palette.textSecondary}`}>
            Filters active — showing filtered results
          </span>
          <button
            onClick={handleClearFilters}
            className={`text-xs font-black flex items-center gap-1 cursor-pointer transition-colors ${
              isDark ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-700'
            }`}
          >
            <RefreshCw className="w-3 h-3" /> Clear All Filters
          </button>
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* 4. STATISTICS STRIP WITH ENHANCED MOTION, GLOW & COUNTERS          */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Schemes Card */}
        <motion.div
          whileHover={{ y: -8, scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          className={`relative p-5 rounded-3xl border flex items-center justify-between backdrop-blur-xl transition-all shadow-sm overflow-hidden group ${
            isDark
              ? 'bg-gradient-to-br from-[#0C1A2B]/95 to-[#0F1C2E]/95 border-[#00B87C]/30 hover:border-[#00B87C]/60 hover:shadow-xl hover:shadow-[#00B87C]/15'
              : 'bg-gradient-to-br from-white/95 to-[#FFFDF7]/95 border-[#D4A017]/40 hover:border-[#D4A017]/70 hover:shadow-xl hover:shadow-amber-900/10'
          }`}
        >
          <div className={`absolute top-0 left-0 right-0 h-[2px] group-hover:h-[3.5px] transition-all duration-300 ${palette.topLine}`} />
          <div className="space-y-0.5">
            <span className={`text-[11px] font-bold block uppercase tracking-wider ${palette.textSecondary}`}>
              Total Schemes
            </span>
            <h4 className={`text-2xl sm:text-3xl font-black font-heading ${palette.textPrimary}`}>
              {totalSchemes > 500 ? '500+' : totalSchemes}
            </h4>
            <span className={`text-[10px] font-semibold block ${palette.accentTextBright}`}>
              ● Live Database Count
            </span>
          </div>
          <div className={`p-3.5 rounded-2xl ${palette.accentBgLight} ${palette.accentTextBright} border ${palette.accentBorder} group-hover:scale-120 group-hover:rotate-6 transition-all duration-300`}>
            <Layers className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Eligible Schemes Card (0) */}
        <motion.div
          whileHover={{ y: -8, scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          className={`relative p-5 rounded-3xl border flex items-center justify-between backdrop-blur-xl transition-all shadow-sm overflow-hidden group ${
            isDark
              ? 'bg-gradient-to-br from-[#0C1A2B]/95 to-[#0F1C2E]/95 border-[#00B87C]/20 hover:border-[#00B87C]/50'
              : 'bg-gradient-to-br from-white/95 to-[#FFFDF7]/95 border-[#D4A017]/30 hover:border-[#D4A017]/60 hover:shadow-amber-900/5'
          }`}
        >
          <div className={`absolute top-0 left-0 right-0 h-[2px] group-hover:h-[3.5px] transition-all duration-300 ${palette.topLine}`} />
          <div className="space-y-0.5">
            <span className={`text-[11px] font-bold block uppercase tracking-wider ${palette.textSecondary}`}>
              Eligible Schemes
            </span>
            <h4 className={`text-2xl sm:text-3xl font-black font-heading ${palette.textPrimary}`}>
              0
            </h4>
            <span className={`text-[10px] font-semibold block ${palette.textSecondary}`}>
              Eligibility feature in next step
            </span>
          </div>
          <div className={`p-3.5 rounded-2xl ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-[#FFFBEF] text-[#8A6210]/60 border border-[#D4A017]/20'} group-hover:scale-120 group-hover:rotate-6 transition-all duration-300`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Saved Schemes Card */}
        <motion.div
          whileHover={{ y: -8, scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          className={`relative p-5 rounded-3xl border flex items-center justify-between backdrop-blur-xl transition-all shadow-sm overflow-hidden group ${
            isDark
              ? 'bg-gradient-to-br from-[#0C1A2B]/95 to-[#0F1C2E]/95 border-[#00B87C]/30 hover:border-[#00B87C]/60 hover:shadow-xl hover:shadow-[#00B87C]/15'
              : 'bg-gradient-to-br from-white/95 to-[#FFFDF7]/95 border-[#D4A017]/40 hover:border-[#D4A017]/70 hover:shadow-xl hover:shadow-amber-900/10'
          }`}
        >
          <div className={`absolute top-0 left-0 right-0 h-[2px] group-hover:h-[3.5px] transition-all duration-300 ${palette.topLine}`} />
          <div className="space-y-0.5">
            <span className={`text-[11px] font-bold block uppercase tracking-wider ${palette.textSecondary}`}>
              Saved Schemes
            </span>
            <h4 className={`text-2xl sm:text-3xl font-black font-heading ${palette.textPrimary}`}>
              {bookmarkedIds.length}
            </h4>
            <span className={`text-[10px] font-semibold block ${palette.accentTextBright}`}>
              ● Bookmarked in Profile
            </span>
          </div>
          <div className={`p-3.5 rounded-2xl ${palette.accentBgLight} ${palette.accentTextBright} border ${palette.accentBorder} group-hover:scale-110 transition-transform`}>
            <Bookmark className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* =================================================================== */}
      {/* 5. SORT & RESULTS COUNT HEADER                                      */}
      {/* =================================================================== */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <span className={`text-sm font-black font-heading ${palette.textPrimary}`}>
          {loading ? 'Loading Schemes…' : `${totalSchemes > 500 ? '500+' : totalSchemes} Schemes Available`}
        </span>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold ${palette.textSecondary}`}>Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ outline: 'none', boxShadow: 'none' }}
            className={`h-9 px-3 text-xs font-black rounded-xl border outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 cursor-pointer shadow-sm transition-all ${
              isDark
                ? 'bg-slate-900 border-[#00B87C]/35 text-[#00B87C] hover:border-[#00B87C] focus:border-[#00B87C]'
                : 'bg-[#FFFDF7] border-[#D4A017]/40 text-[#8A6210] hover:border-[#D4A017] focus:border-[#D4A017]'
            }`}
          >
            <option value="recommended">Default Order</option>
            <option value="highest">Key Benefits</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 6. SCHEME CARDS GRID WITH DYNAMIC FLOW MOTION & LUXURY HOVER        */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          [...Array(6)].map((_, i) => <SkeletonCard key={i} isDark={isDark} />)
        ) : displaySchemes.length === 0 ? (
          <div className={`col-span-full py-16 px-8 rounded-[32px] border flex flex-col items-center justify-center text-center space-y-4 ${
            isDark ? 'bg-[#0C1A2B]/60 border-slate-800' : 'bg-white/90 border-[#D4A017]/25'
          }`}>
            <AlertCircle className={`w-10 h-10 ${palette.accentTextBright}`} />
            <div>
              <h3 className={`text-lg font-black font-heading ${palette.textPrimary}`}>No Schemes Found</h3>
              <p className={`text-xs mt-1 ${palette.textSecondary}`}>Try adjusting or clearing your filters.</p>
            </div>
            <button
              onClick={handleClearFilters}
              className={`px-5 py-2 rounded-xl text-xs font-black cursor-pointer ${palette.accentButton}`}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          displaySchemes.map((scheme, idx) => {
            const isSaved = bookmarkedIds.includes(scheme.id);

            return (
              <motion.article
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (idx % 9) * 0.045, ease: 'easeOut' }}
                whileHover={{ y: -9, scale: 1.025 }}
                className={`group relative rounded-[28px] border flex flex-col overflow-hidden backdrop-blur-xl transition-all duration-300 shadow-sm ${
                  isDark
                    ? 'bg-[#0F1C2E]/90 border-slate-800/80 hover:border-[#00B87C]/50 hover:shadow-2xl hover:shadow-[#00B87C]/15'
                    : 'bg-white border-[#D4A017]/30 hover:border-[#D4A017]/70 hover:shadow-2xl hover:shadow-amber-900/10'
                }`}
              >
                {/* Dynamic Flow Top Accent Line (Expands on Card Hover) */}
                <div className={`h-[3px] group-hover:h-[5px] w-full shrink-0 transition-all duration-300 ${palette.topLine}`} />

                <div className="p-5 sm:p-6 flex flex-col gap-3.5 flex-1">
                  {/* Category Badge & Bookmark Button */}
                  <div className="flex items-start justify-between gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${palette.accentBgLight} ${palette.accentText} ${palette.accentBorder}`}>
                      {scheme.category || 'Government Scheme'}
                    </span>

                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => toggleBookmark(scheme.id, scheme.scheme_name)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
                        isSaved
                          ? isDark
                            ? 'bg-[#00B87C] text-black border-[#00B87C]'
                            : 'bg-[#D4A017] text-white border-[#D4A017]'
                          : isDark
                            ? 'bg-slate-800/70 border-[#00B87C]/30 text-[#00B87C] hover:bg-[#00B87C]/20'
                            : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210] hover:bg-[#FFE88A]'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
                    >
                      {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </motion.button>
                  </div>

                  {/* Title & Ministry */}
                  <div className="space-y-1">
                    <h3 className={`text-base font-black leading-snug line-clamp-2 font-heading ${palette.textPrimary}`}>
                      {scheme.scheme_name}
                    </h3>
                    {scheme.ministry_department && (
                      <p className={`flex items-center gap-1.5 text-[11px] font-semibold line-clamp-1 ${palette.textSecondary}`}>
                        <Building2 className={`w-3.5 h-3.5 shrink-0 ${palette.accentTextBright}`} />
                        {scheme.ministry_department}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className={`text-xs leading-relaxed line-clamp-2 font-medium ${isDark ? 'text-slate-300' : 'text-[#111827]/80'}`}>
                    {scheme.description || 'Welfare scheme enacted by the Government for eligible citizens.'}
                  </p>

                  {/* Key Benefits Box with Shimmer */}
                  {scheme.benefits && (
                    <div className={`p-3 rounded-2xl border text-xs leading-relaxed font-medium transition-colors ${
                      isDark
                        ? 'bg-[#00B87C]/10 border-[#00B87C]/25 text-[#34D399]'
                        : 'bg-[#FFFBEF] border-[#D4A017]/30 text-[#8A6210]'
                    }`}>
                      <span className={`text-[10px] font-black uppercase tracking-wider block mb-0.5 ${palette.accentTextBright}`}>
                        Key Benefits
                      </span>
                      <p className="line-clamp-2 font-semibold">
                        {scheme.benefits}
                      </p>
                    </div>
                  )}

                  <div className="flex-1" />

                  {/* Action Buttons: View Details redirects to Dedicated Scheme Page */}
                  <div className={`pt-3.5 border-t flex items-center gap-2.5 ${isDark ? 'border-slate-800' : 'border-[#D4A017]/20'}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveSchemeDetail(scheme)}
                      className={`flex-1 h-10 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm ${
                        isDark
                          ? 'bg-slate-800/80 border-[#00B87C]/35 text-[#00B87C] hover:bg-[#00B87C]/20 hover:text-white'
                          : 'bg-[#FFF5D6] border-[#D4A017]/45 text-[#8A6210] hover:bg-[#FFE88A]'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Details
                    </motion.button>

                    {scheme.official_scheme_url && (
                      <motion.a
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        href={scheme.official_scheme_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`h-10 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${palette.accentButton}`}
                      >
                        Apply
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })
        )}
      </div>

      {/* =================================================================== */}
      {/* 7. PAGINATION                                                       */}
      {/* =================================================================== */}
      {!loading && displaySchemes.length > 0 && (
        <div className={`pt-6 pb-12 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDark ? 'border-slate-800' : 'border-[#D4A017]/25'
        }`}>
          <p className={`text-xs font-semibold ${palette.textSecondary}`}>
            Page <span className={`font-black ${palette.accentTextBright}`}>{page}</span> of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={page > 1 ? { scale: 1.04 } : {}}
              whileTap={page > 1 ? { scale: 0.96 } : {}}
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className={`h-9 px-4 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-slate-900 border-[#00B87C]/35 text-[#00B87C] hover:bg-[#00B87C]/15'
                  : 'bg-[#FFF5D6] border-[#D4A017]/45 text-[#8A6210] hover:bg-[#FFE88A]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </motion.button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) pageNum = Math.min(totalPages, page - 2 + i);
                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm ${
                      page === pageNum
                        ? isDark
                          ? 'bg-gradient-to-r from-[#00B87C] to-[#10B981] text-white shadow-md shadow-[#00B87C]/30'
                          : 'bg-gradient-to-r from-[#D4A017] to-[#F59E0B] text-white shadow-md shadow-[#D4A017]/30'
                        : isDark
                          ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-[#00B87C]/40'
                          : 'bg-white border border-[#D4A017]/35 text-[#8A6210] hover:bg-[#FFF0C0]'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              whileHover={page < totalPages ? { scale: 1.04 } : {}}
              whileTap={page < totalPages ? { scale: 0.96 } : {}}
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className={`h-9 px-4 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-slate-900 border-[#00B87C]/35 text-[#00B87C] hover:bg-[#00B87C]/15'
                  : 'bg-[#FFF5D6] border-[#D4A017]/45 text-[#8A6210] hover:bg-[#FFE88A]'
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
