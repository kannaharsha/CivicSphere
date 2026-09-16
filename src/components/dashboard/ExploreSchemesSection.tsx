import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, FileText, ChevronLeft, ChevronRight,
  Building2, CheckCircle2, ArrowUpRight,
  AlertCircle, RefreshCw, Layers,
  Bookmark, BookmarkCheck,
  Sparkles, Mic, ChevronDown, Globe, Tag, MapPin, Filter
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
import SchemeDetailView from './SchemeDetailView';

interface ExploreSchemesSectionProps {
  isDark: boolean;
}

// ── Parse comma-separated category string into individual clean tags ──
function parseCategoryTags(raw: string | undefined | null): string[] {
  if (!raw) return ['Government Scheme'];
  // Split on ", " but be careful not to split "Agriculture,Rural & Environment" — only split on ", " (comma + space)
  return raw.split(/, (?=[A-Z])/).map(c => c.trim()).filter(Boolean);
}

// ── Parse raw state value into a clean string array ──────────────────
// Handles values like: "['Andhra Pradesh', 'Kerala', ...]" OR "All India" OR "Karnataka"
function parseStateList(raw: string | undefined | null): string[] {
  if (!raw) return ['All India'];
  const trimmed = raw.trim();
  // Check if it looks like a Python-style list: [' ... ']
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    // Strip brackets, then split on comma and clean quotes
    const inner = trimmed.slice(1, -1);
    const parts = inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '').trim()).filter(Boolean);
    return parts.length > 0 ? parts : ['All India'];
  }
  // Plain comma-separated or single value
  const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts : ['All India'];
}

// ── Get a clean short display label for state (for card badges) ───────
function getStateLabel(raw: string | undefined | null): string {
  const states = parseStateList(raw);
  if (states.length === 0 || states[0] === 'All India') return 'All India';
  if (states.length === 1) return states[0];
  return `${states[0]} +${states.length - 1} more`;
}

function cleanSchemeTitle(title: string | undefined | null): string {
  if (!title) return 'Government Scheme';
  let cleaned = title.trim();
  cleaned = cleaned.replace(/^["'“](.*)["'”]$/, '$1').trim();
  return cleaned;
}

// ── SKELETON CARD ────────────────────────────────────────────────────
function SkeletonCard({ isDark }: { isDark: boolean }) {
  return (
    <div className={`rounded-3xl border p-6 flex flex-col gap-4 overflow-hidden relative ${
      isDark ? 'bg-[#0C1A2B]/80 border-slate-800' : 'bg-white/95 border-[#D4A017]/25 shadow-sm'
    }`}>
      {/* shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="flex items-center justify-between gap-3">
        <div className={`h-5 w-32 rounded-full animate-pulse ${isDark ? 'bg-[#00B87C]/20' : 'bg-[#FFF5D6]'}`} />
        <div className={`h-8 w-8 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-[#FFFBEF]'}`} />
      </div>
      <div className="space-y-2">
        <div className={`h-4 w-20 rounded-full animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`} />
      </div>
      <div className="space-y-2.5">
        <div className={`h-6 w-4/5 rounded-lg animate-pulse ${isDark ? 'bg-slate-800' : 'bg-[#FFFDF7]'}`} />
        <div className={`h-4 w-2/3 rounded-lg animate-pulse ${isDark ? 'bg-slate-800' : 'bg-[#FFFDF7]'}`} />
      </div>
      <div className={`h-4 w-full rounded animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`} />
      <div className={`h-4 w-5/6 rounded animate-pulse ${isDark ? 'bg-slate-800/40' : 'bg-slate-100'}`} />
      <div className={`h-14 w-full rounded-2xl animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-[#FFFBEF]'}`} />
      <div className={`h-10 w-full rounded-2xl animate-pulse mt-auto ${isDark ? 'bg-[#00B87C]/20' : 'bg-[#FFF5D6]'}`} />
    </div>
  );
}

// ── CATEGORY PILL (highlighted if it matches the active filter) ──────
function CategoryPill({
  label, isDark, isActive, onClick
}: { label: string; isDark: boolean; isActive?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={onClick ? `Filter by category: ${label}` : undefined}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border transition-all shrink-0 ${
        isActive
          ? isDark
            ? 'bg-[#00B87C] text-black border-[#00B87C] shadow-md shadow-[#00B87C]/30'
            : 'bg-[#D4A017] text-white border-[#D4A017] shadow-md shadow-amber-500/30'
          : isDark
            ? 'bg-[#00B87C]/12 border-[#00B87C]/30 text-[#34D399] hover:bg-[#00B87C]/25'
            : 'bg-[#FFF5D6] border-[#D4A017]/35 text-[#8A6210] hover:bg-[#FFE88A]'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {label}
    </button>
  );
}

// ── STATE / LOCATION PILL (highlighted if it matches the active state filter) ──
function StatePill({
  state, isDark, isActive, onClick
}: { state: string; isDark: boolean; isActive?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={onClick ? `Filter by state: ${state}` : undefined}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold border transition-all shrink-0 ${
        isActive
          ? isDark
            ? 'bg-[#00B87C] text-black border-[#00B87C] shadow-md shadow-[#00B87C]/30'
            : 'bg-[#D4A017] text-white border-[#D4A017] shadow-md shadow-amber-500/30'
          : isDark
            ? 'bg-[#00B87C]/10 border-[#00B87C]/25 text-[#34D399] hover:bg-[#00B87C]/20 hover:border-[#00B87C]/50'
            : 'bg-[#FFF5D6] border-[#D4A017]/35 text-[#8A6210] hover:bg-[#FFE88A] hover:border-[#D4A017]'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <MapPin className="w-2.5 h-2.5" />
      {state}
    </button>
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

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedMode, setSelectedMode] = useState('');

  const [bookmarkedIds, setBookmarkedIds] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem('civic_saved_schemes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeSchemeDetail, setActiveSchemeDetail] = useState<AgricultureScheme | null>(null);

  const [filters, setFilters] = useState<SchemeFiltersResponse>({
    categories: [], ministries: [], states: [], applicationModes: []
  });

  const [error, setError] = useState(false);

  // Rotating search prompts
  const flowPrompts = [
    'Search schemes by name: PM-Kisan, PMFBY, KCC…',
    'Search by benefit: ₹6,000/yr direct income support…',
    'Search by eligibility: Small & Marginal farmers, women…',
    'Search by technology: Solar pump & micro-irrigation…',
    'Search by subsidy: Organic farming, seeds & machinery…',
  ];
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentPromptIndex(p => (p + 1) % flowPrompts.length), 3200);
    return () => clearInterval(timer);
  }, []);

  // Debounce search
  useEffect(() => {
    const h = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(h);
  }, [search]);

  // Fetch filters once
  useEffect(() => {
    fetchAgricultureSchemeFilters().then(res => setFilters(res));
    fetchAgricultureSchemeCount().then(cnt => setTotalSchemes(cnt));
  }, []);

  // Fetch schemes whenever filters / page changes
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    fetchAgricultureSchemes({
      page, limit,
      search: debouncedSearch,
      category: selectedCategory,
      state: selectedState,
      application_mode: selectedMode,
    })
      .then(res => {
        if (!active) return;
        setSchemes(res.data || []);
        const total = res.pagination?.total || 0;
        setTotalSchemes(total);
        setTotalPages(res.pagination?.totalPages || Math.ceil(total / limit) || 1);
        setLoading(false);
      })
      .catch(() => { if (active) { setLoading(false); setError(true); } });

    return () => { active = false; };
  }, [page, debouncedSearch, selectedCategory, selectedState, selectedMode]);

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

  const toggleBookmark = (id: string | number, schemeName: string) => {
    setBookmarkedIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem('civic_saved_schemes', JSON.stringify(updated)); } catch {}
      if (exists) toast.error(`Removed from Saved: ${schemeName.slice(0, 26)}…`);
      else toast.success(`Saved to Profile: ${schemeName.slice(0, 26)}…`);
      return updated;
    });
  };

  const handleClearFilters = useCallback(() => {
    setSearch(''); setDebouncedSearch('');
    setSelectedCategory(''); setSelectedState(''); setSelectedMode('');
    setPage(1);
  }, []);

  // Click a category pill on a card → set filter
  const handleCategoryPillClick = useCallback((cat: string) => {
    setSelectedCategory(prev => prev === cat ? '' : cat);
    setPage(1);
  }, []);

  const hasActiveFilters = !!(search || selectedCategory || selectedState || selectedMode);

  const displaySchemes = useMemo(() => {
    const list = [...schemes];
    if (sortBy === 'alphabetical') list.sort((a, b) => a.scheme_name.localeCompare(b.scheme_name));
    else if (sortBy === 'highest') list.sort((a, b) => (b.benefits?.length || 0) - (a.benefits?.length || 0));
    return list;
  }, [schemes, sortBy]);

  const availableCategories = useMemo(() => {
    return (filters.categories && filters.categories.length > 0) ? filters.categories : [];
  }, [filters.categories]);

  // ── PALETTE ─────────────────────────────────────────────────────────
  const p = {
    accent: isDark ? '#00B87C' : '#D4A017',
    accentText: isDark ? 'text-[#00B87C]' : 'text-[#8A6210]',
    accentBright: isDark ? 'text-[#34D399]' : 'text-[#D4A017]',
    accentBg: isDark ? 'bg-[#00B87C]/12' : 'bg-[#FFF5D6]',
    accentBorder: isDark ? 'border-[#00B87C]/30' : 'border-[#D4A017]/35',
    accentBtn: isDark
      ? 'bg-gradient-to-r from-[#00B87C] to-[#10B981] text-white shadow-md shadow-[#00B87C]/25 hover:shadow-lg hover:shadow-[#00B87C]/40'
      : 'bg-gradient-to-r from-[#D4A017] to-[#F59E0B] text-white shadow-md shadow-[#D4A017]/25 hover:shadow-lg hover:shadow-amber-500/40',
    topLine: isDark
      ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
      : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent',
    primary: isDark ? 'text-white' : 'text-[#111827]',
    secondary: isDark ? 'text-slate-400' : 'text-[#8A6210]/75',
    card: isDark ? 'bg-[#0B1726] border-slate-800' : 'bg-white border-[#D4A017]/25',
    cardHover: isDark
      ? 'hover:border-[#00B87C]/55 hover:shadow-2xl hover:shadow-[#00B87C]/12'
      : 'hover:border-[#D4A017]/65 hover:shadow-2xl hover:shadow-amber-900/8',
    panelBg: isDark ? 'bg-[#0B1726] border-[#00B87C]/25' : 'bg-white border-[#D4A017]/35',
  };

  // ═══════════════════════════════════════════════════════════════════
  // VIEW 1: DEDICATED SCHEME DETAIL PAGE
  // ═══════════════════════════════════════════════════════════════════
  if (activeSchemeDetail) {
    return (
      <SchemeDetailView
        scheme={activeSchemeDetail}
        isDark={isDark}
        isSaved={bookmarkedIds.includes(activeSchemeDetail.scheme_id || activeSchemeDetail.id)}
        onBack={() => setActiveSchemeDetail(null)}
        onToggleBookmark={toggleBookmark}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveSchemeDetail(null);
          setPage(1);
        }}
        onSelectState={(st) => {
          setSelectedState(st);
          setActiveSchemeDetail(null);
          setPage(1);
        }}
        selectedCategory={selectedCategory}
        selectedState={selectedState}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // VIEW 2: EXPLORE SCHEMES MAIN LISTING
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="relative w-full select-none transition-colors duration-500 space-y-8">

      {/* ── 1. HERO HEADER ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center space-y-5 pt-1"
      >
        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase backdrop-blur-md shadow-sm ${
          isDark ? 'border-[#00B87C]/30 bg-[#00B87C]/8 text-[#34D399]' : 'border-[#D4A017]/35 bg-[#FFF5D6] text-[#8A6210]'
        }`}>
          <Sparkles className={`w-3.5 h-3.5 ${p.accentBright}`} />
          Digital Public Infrastructure • AI Scheme Discovery
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-heading leading-tight">
            <span className={p.primary}>Explore </span>
            <span className={isDark
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00B87C] via-[#10B981] to-[#34D399]'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-[#B48418] via-[#D4A017] to-[#F59E0B]'
            }>
              Government Schemes
            </span>
          </h1>
          <div className="flex justify-center pt-1">
            <div className={`h-1 w-28 sm:w-36 rounded-full ${p.topLine}`} />
          </div>
          <p className={`text-xs sm:text-sm max-w-lg mx-auto font-medium ${p.secondary} pt-1`}>
            Browse 860 verified agriculture & rural welfare schemes from the Government database.
          </p>
        </div>

        {/* ── 2. SEARCH BAR ──────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto pt-2 px-2 space-y-3">
          <motion.div
            whileHover={{ y: -1 }}
            className={`relative rounded-full border px-2 py-1.5 flex items-center transition-all duration-200 group ${
              isDark
                ? 'bg-[#0C1A2B] border-slate-800 hover:border-[#00B87C] hover:ring-2 hover:ring-[#00B87C]/15 shadow-lg shadow-black/30 focus-within:border-[#00B87C] focus-within:ring-2 focus-within:ring-[#00B87C]/20'
                : 'bg-white border-[#D4A017]/30 hover:border-[#D4A017] hover:ring-2 hover:ring-[#D4A017]/15 shadow-sm focus-within:border-[#D4A017] focus-within:ring-2 focus-within:ring-[#D4A017]/15'
            }`}
          >
            {/* Icon */}
            <div className="pl-2 pr-2.5 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                isDark ? 'bg-[#00B87C]/10 border-[#00B87C]/25 text-[#34D399]' : 'bg-[#FFF9EA] border-[#D4A017]/30 text-[#D4A017]'
              }`}>
                <Search className="w-4 h-4" />
              </div>
            </div>

            {/* Animated placeholder */}
            <div className="relative w-full h-10 flex items-center overflow-hidden">
              {!search && (
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentPromptIndex}
                      initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}
                      transition={{ duration: 0.22 }}
                      className="text-xs sm:text-sm font-medium text-slate-400 truncate select-none"
                    >
                      {flowPrompts[currentPromptIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                style={{ outline: 'none', boxShadow: 'none' }}
                className={`relative w-full h-full text-xs sm:text-sm font-semibold bg-transparent outline-none ring-0 border-none pr-3 transition-colors ${
                  isDark ? 'text-white caret-[#00B87C]' : 'text-slate-900 caret-[#D4A017]'
                }`}
              />
            </div>

            {/* Clear */}
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => setSearch('')}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer mr-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Voice */}
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={handleVoiceSearch}
              className={`p-2 rounded-full border shrink-0 cursor-pointer transition-all mr-1.5 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse border-rose-600'
                  : isDark
                    ? 'bg-slate-900 border-slate-800 text-[#00B87C] hover:bg-[#00B87C]/15 hover:border-[#00B87C]/40'
                    : 'bg-white border-[#D4A017]/25 text-[#8A6210] hover:bg-[#FFF9EA] hover:border-[#D4A017]/50 shadow-xs'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </motion.button>

            <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold shrink-0 mr-1 ${
              isDark ? 'border-slate-800 bg-slate-900 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}>
              <span>Ctrl</span><span>K</span>
            </div>
          </motion.div>

          {/* Quick Pill searches */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
            <span className={`text-[10px] font-bold ${p.secondary} flex items-center gap-1 shrink-0`}>
              <Sparkles className={`w-3 h-3 ${p.accentBright}`} /> Popular:
            </span>
            {[
              { label: 'PM Kisan', q: 'PM Kisan' },
              { label: 'Solar Pump', q: 'Solar' },
              { label: 'Crop Insurance', q: 'Insurance' },
              { label: 'Kisan Credit', q: 'Credit' },
              { label: 'Organic', q: 'Organic' },
            ].map(item => (
              <motion.button
                key={item.q} whileHover={{ y: -1.5 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSearch(item.q)}
                className={`px-3 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shadow-xs ${
                  search === item.q
                    ? isDark ? 'bg-[#00B87C] text-black border-[#00B87C] font-bold' : 'bg-[#D4A017] text-white border-[#D4A017] font-bold'
                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-[#00B87C]/50 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-[#D4A017] hover:text-[#8A6210]'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── 3. FILTER ROW ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Category */}
        {[
          {
            icon: <Tag className="w-3 h-3" />,
            label: 'Scheme Category',
            value: selectedCategory,
            onChange: (v: string) => { setSelectedCategory(v); setPage(1); },
            options: availableCategories,
            defaultLabel: `All Categories (${availableCategories.length})`,
            badge: selectedCategory ? 'Filtered' : `${availableCategories.length} types`,
          },
          {
            icon: <Globe className="w-3 h-3" />,
            label: 'State / Jurisdiction',
            value: selectedState,
            onChange: (v: string) => { setSelectedState(v); setPage(1); },
            options: filters.states,
            defaultLabel: 'All Regions (Pan India)',
            badge: selectedState ? selectedState.slice(0, 10) + (selectedState.length > 10 ? '…' : '') : 'Pan India',
          },
          {
            icon: <Filter className="w-3 h-3" />,
            label: 'Application Mode',
            value: selectedMode,
            onChange: (v: string) => { setSelectedMode(v); setPage(1); },
            options: ['Online', 'Offline'],
            defaultLabel: 'All Application Modes',
            badge: selectedMode || 'All Modes',
          },
        ].map((filter, fi) => (
          <motion.div
            key={fi}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`relative p-4 rounded-2xl border transition-all duration-200 group shadow-xs hover:shadow-md overflow-hidden ${
              isDark
                ? 'bg-[#0C1A2B] border-slate-800 hover:border-[#00B87C]/60 focus-within:border-[#00B87C]'
                : 'bg-white border-slate-200 hover:border-[#D4A017] focus-within:border-[#D4A017]'
            } ${filter.value ? (isDark ? 'border-[#00B87C]/50' : 'border-[#D4A017]/60') : ''}`}
          >
            <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 ${p.topLine} ${filter.value ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />

            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                  isDark ? 'bg-[#00B87C]/10 border-[#00B87C]/25 text-[#34D399]' : 'bg-[#FFF9EA] border-[#D4A017]/30 text-[#D4A017]'
                }`}>
                  {filter.icon}
                </div>
                <label className={`text-[10px] font-bold uppercase tracking-wider ${p.secondary}`}>{filter.label}</label>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                filter.value
                  ? isDark ? 'bg-[#00B87C] text-black border-[#00B87C]' : 'bg-[#D4A017] text-white border-[#D4A017]'
                  : isDark ? 'bg-slate-900 text-slate-500 border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {filter.badge}
              </span>
            </div>

            <div className="relative">
              <select
                value={filter.value}
                onChange={e => filter.onChange(e.target.value)}
                style={{ outline: 'none', boxShadow: 'none' }}
                className={`w-full h-9 pl-3 pr-8 text-xs font-semibold rounded-xl border outline-none ring-0 cursor-pointer appearance-none transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="">{filter.defaultLabel}</option>
                {filter.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
              <div className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:rotate-180 ${p.accentBright}`}>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Active Filters Strip */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between px-1 gap-3 flex-wrap"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold ${p.secondary}`}>Active Filters:</span>
              {selectedCategory && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${
                  isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/40 text-[#34D399]' : 'bg-[#FFF5D6] border-[#D4A017]/50 text-[#8A6210]'
                }`}>
                  📂 {selectedCategory}
                  <button onClick={() => setSelectedCategory('')} className="opacity-60 hover:opacity-100 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedState && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${
                  isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/40 text-[#34D399]' : 'bg-[#FFF5D6] border-[#D4A017]/50 text-[#8A6210]'
                }`}>
                  📍 {selectedState}
                  <button onClick={() => setSelectedState('')} className="opacity-60 hover:opacity-100 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedMode && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${
                  isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/40 text-[#34D399]' : 'bg-[#FFF5D6] border-[#D4A017]/50 text-[#8A6210]'
                }`}>
                  🖥️ {selectedMode}
                  <button onClick={() => setSelectedMode('')} className="opacity-60 hover:opacity-100 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {search && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${
                  isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/40 text-[#34D399]' : 'bg-[#FFF5D6] border-[#D4A017]/50 text-[#8A6210]'
                }`}>
                  🔍 "{search}"
                  <button onClick={() => setSearch('')} className="opacity-60 hover:opacity-100 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
            <button
              onClick={handleClearFilters}
              className={`text-xs font-black flex items-center gap-1 cursor-pointer transition-colors ${
                isDark ? 'text-rose-400 hover:text-rose-300' : 'text-rose-500 hover:text-rose-600'
              }`}
            >
              <RefreshCw className="w-3 h-3" /> Clear All
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. STATS STRIP ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Schemes',
            value: totalSchemes > 500 ? '860' : String(totalSchemes),
            sub: '● Live Database Count',
            icon: <Layers className="w-5 h-5" />,
            colored: true,
          },
          {
            label: 'Showing Results',
            value: loading ? '—' : String(displaySchemes.length),
            sub: hasActiveFilters ? 'Filtered results' : 'Current page',
            icon: <CheckCircle2 className="w-5 h-5" />,
            colored: !!hasActiveFilters,
          },
          {
            label: 'Saved Schemes',
            value: String(bookmarkedIds.length),
            sub: '● Bookmarked in Profile',
            icon: <Bookmark className="w-5 h-5" />,
            colored: bookmarkedIds.length > 0,
          },
        ].map((stat, si) => (
          <motion.div
            key={si}
            whileHover={{ y: -7, scale: 1.025 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className={`relative p-5 rounded-3xl border flex items-center justify-between backdrop-blur-xl transition-all shadow-sm overflow-hidden group ${
              isDark
                ? 'bg-gradient-to-br from-[#0C1A2B]/95 to-[#0F1C2E]/95 border-[#00B87C]/25 hover:border-[#00B87C]/55 hover:shadow-xl hover:shadow-[#00B87C]/10'
                : 'bg-gradient-to-br from-white/95 to-[#FFFDF7]/95 border-[#D4A017]/35 hover:border-[#D4A017]/60 hover:shadow-xl hover:shadow-amber-900/8'
            }`}
          >
            <div className={`absolute top-0 left-0 right-0 h-[2px] group-hover:h-[3px] transition-all duration-300 ${p.topLine}`} />
            <div className="space-y-0.5">
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${p.secondary}`}>{stat.label}</span>
              <h4 className={`text-2xl sm:text-3xl font-black font-heading ${p.primary}`}>{stat.value}</h4>
              <span className={`text-[10px] font-semibold block ${stat.colored ? p.accentBright : p.secondary}`}>{stat.sub}</span>
            </div>
            <div className={`p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
              stat.colored
                ? `${p.accentBg} ${p.accentBright} ${p.accentBorder}`
                : isDark ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── 5. RESULTS HEADER ──────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={`text-sm font-black font-heading ${p.primary}`}>
            {loading ? 'Loading Schemes…' : `${totalSchemes.toLocaleString()} Schemes${hasActiveFilters ? ' matched' : ' available'}`}
          </span>
          {hasActiveFilters && !loading && (
            <span className={`ml-2 text-xs font-semibold ${p.secondary}`}>
              — Page {page} of {totalPages}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold ${p.secondary}`}>Sort:</span>
          <select
            value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ outline: 'none', boxShadow: 'none' }}
            className={`h-9 px-3 text-xs font-black rounded-xl border outline-none ring-0 cursor-pointer shadow-sm transition-all ${
              isDark ? 'bg-slate-900 border-[#00B87C]/30 text-[#00B87C]' : 'bg-[#FFFDF7] border-[#D4A017]/35 text-[#8A6210]'
            }`}
          >
            <option value="recommended">Default</option>
            <option value="highest">Key Benefits</option>
            <option value="alphabetical">A–Z</option>
          </select>
        </div>
      </div>

      {/* ── 6. SCHEME CARDS GRID ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          [...Array(6)].map((_, i) => <SkeletonCard key={i} isDark={isDark} />)
        ) : error ? (
          <div className={`col-span-full py-16 flex flex-col items-center gap-4 rounded-[28px] border text-center ${
            isDark ? 'bg-[#0C1A2B]/60 border-slate-800' : 'bg-white/90 border-[#D4A017]/25'
          }`}>
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <div>
              <h3 className={`text-base font-black ${p.primary}`}>Could not load schemes</h3>
              <p className={`text-xs mt-1 ${p.secondary}`}>Check your server connection and try again.</p>
            </div>
          </div>
        ) : displaySchemes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`col-span-full py-20 px-8 rounded-[32px] border flex flex-col items-center justify-center text-center space-y-5 ${
              isDark ? 'bg-[#0C1A2B]/60 border-slate-800' : 'bg-white/90 border-[#D4A017]/25'
            }`}
          >
            <div className={`p-5 rounded-3xl ${p.accentBg} ${p.accentBorder} border`}>
              <AlertCircle className={`w-8 h-8 ${p.accentBright}`} />
            </div>
            <div>
              <h3 className={`text-lg font-black font-heading ${p.primary}`}>No Schemes Found</h3>
              <p className={`text-xs mt-1.5 ${p.secondary} max-w-xs mx-auto`}>
                No schemes match your current filters. Try a broader search or clear the filters.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleClearFilters}
              className={`px-6 py-2.5 rounded-xl text-xs font-black cursor-pointer ${p.accentBtn}`}
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displaySchemes.map((scheme, idx) => {
              const isSaved = bookmarkedIds.includes(scheme.scheme_id || scheme.id);
              const catTags = parseCategoryTags(scheme.category);
              const primaryCat = catTags[0] || 'Government Scheme';

              return (
                <motion.article
                  key={scheme.scheme_id || scheme.id}
                  layout
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: (idx % 9) * 0.04, ease: 'easeOut' }}
                  whileHover={{ y: -8, scale: 1.022 }}
                  className={`group relative rounded-[28px] border flex flex-col overflow-hidden backdrop-blur-xl transition-all duration-300 shadow-sm ${p.card} ${p.cardHover}`}
                >
                  {/* Top accent bar */}
                  <div className={`h-[3px] group-hover:h-[5px] w-full shrink-0 transition-all duration-300 ${p.topLine}`} />

                  <div className="p-5 flex flex-col gap-3.5 flex-1">
                    {/* Row 1: Primary category pill + State pill + Bookmark */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        {/* Primary category */}
                        <CategoryPill
                          label={primaryCat}
                          isDark={isDark}
                          isActive={selectedCategory === primaryCat}
                          onClick={() => handleCategoryPillClick(primaryCat)}
                        />
                        {/* State badge */}
                        {scheme.state && (() => {
                          const stList = parseStateList(scheme.state);
                          const isSingle = stList.length === 1 && stList[0] !== 'All India';
                          const label = getStateLabel(scheme.state);
                          return (
                            <StatePill
                              state={label}
                              isDark={isDark}
                              isActive={isSingle && selectedState === stList[0]}
                              onClick={isSingle ? () => { setSelectedState(prev => prev === stList[0] ? '' : stList[0]); setPage(1); } : undefined}
                            />
                          );
                        })()}
                      </div>

                      {/* Bookmark button */}
                      <motion.button
                        whileTap={{ scale: 0.82 }} whileHover={{ scale: 1.12 }}
                        onClick={() => toggleBookmark(scheme.scheme_id || scheme.id, scheme.scheme_name)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm shrink-0 ${
                          isSaved
                            ? isDark ? 'bg-[#00B87C] text-black border-[#00B87C]' : 'bg-[#D4A017] text-white border-[#D4A017]'
                            : isDark ? 'bg-slate-800/70 border-[#00B87C]/25 text-[#00B87C] hover:bg-[#00B87C]/20' : 'bg-[#FFF5D6] border-[#D4A017]/35 text-[#8A6210] hover:bg-[#FFE88A]'
                        }`}
                        title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
                      >
                        {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </motion.button>
                    </div>

                    {/* Extra categories (if multi-cat) */}
                    {catTags.length > 1 && (
                      <div className="flex items-center gap-1 flex-wrap -mt-1">
                        {catTags.slice(1).map((cat, ci) => (
                          <CategoryPill
                            key={ci} label={cat} isDark={isDark}
                            isActive={selectedCategory === cat}
                            onClick={() => handleCategoryPillClick(cat)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Title & Ministry */}
                    <div className="space-y-1">
                      <h3 className={`text-sm font-bold tracking-tight leading-snug line-clamp-2 font-sans ${p.primary}`}>
                        {cleanSchemeTitle(scheme.scheme_name)}
                      </h3>
                      {scheme.ministry_department && (
                        <p className={`flex items-center gap-1.5 text-[10px] font-semibold line-clamp-1 ${p.secondary}`}>
                          <Building2 className={`w-3 h-3 shrink-0 ${p.accentBright}`} />
                          {scheme.ministry_department}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {scheme.description || 'Welfare scheme enacted by the Government for eligible citizens.'}
                    </p>

                    {/* Benefits Box */}
                    {scheme.benefits && (
                      <div className={`p-3 rounded-2xl border text-xs leading-relaxed transition-colors ${
                        isDark ? 'bg-[#00B87C]/8 border-[#00B87C]/20 text-[#34D399]' : 'bg-[#FFFBEF] border-[#D4A017]/25 text-[#8A6210]'
                      }`}>
                        <span className={`text-[9px] font-black uppercase tracking-widest block mb-1 ${p.accentBright}`}>
                          Key Benefits
                        </span>
                        <p className="line-clamp-2 font-semibold">{scheme.benefits}</p>
                      </div>
                    )}

                    <div className="flex-1" />

                    {/* Action Buttons */}
                    <div className={`pt-3 border-t flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-[#D4A017]/15'}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveSchemeDetail(scheme)}
                        className={`flex-1 h-9 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          isDark
                            ? 'bg-slate-800/70 border-[#00B87C]/30 text-[#00B87C] hover:bg-[#00B87C]/18 hover:text-white'
                            : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210] hover:bg-[#FFE88A]'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" /> View Details
                      </motion.button>

                      {scheme.official_scheme_url && (
                        <motion.a
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                          href={scheme.official_scheme_url} target="_blank" rel="noopener noreferrer"
                          className={`h-9 px-4 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer ${p.accentBtn}`}
                        >
                          Apply <ArrowUpRight className="w-3.5 h-3.5" />
                        </motion.a>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── 7. PAGINATION ───────────────────────────────────────────── */}
      <AnimatePresence>
        {!loading && displaySchemes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`pt-6 pb-12 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isDark ? 'border-slate-800' : 'border-[#D4A017]/20'
            }`}
          >
            <p className={`text-xs font-semibold ${p.secondary}`}>
              Page <span className={`font-black ${p.accentBright}`}>{page}</span> of {totalPages}
              {' '}· Showing {displaySchemes.length} of {totalSchemes.toLocaleString()} schemes
            </p>

            <div className="flex items-center gap-1.5">
              <motion.button
                whileHover={page > 1 ? { scale: 1.04 } : {}} whileTap={page > 1 ? { scale: 0.96 } : {}}
                disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                className={`h-9 px-4 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-35 disabled:cursor-not-allowed ${
                  isDark ? 'bg-slate-900 border-[#00B87C]/30 text-[#00B87C] hover:bg-[#00B87C]/12' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210] hover:bg-[#FFE88A]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </motion.button>

              <div className="flex items-center gap-1">
                {(() => {
                  const pagesShown = Math.min(5, totalPages);
                  let start = Math.max(1, Math.min(page - 2, totalPages - pagesShown + 1));
                  return Array.from({ length: pagesShown }, (_, i) => start + i).map(pn => (
                    <motion.button
                      key={pn} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setPage(pn)}
                      className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        page === pn
                          ? isDark
                            ? 'bg-gradient-to-r from-[#00B87C] to-[#10B981] text-white shadow-md shadow-[#00B87C]/30'
                            : 'bg-gradient-to-r from-[#D4A017] to-[#F59E0B] text-white shadow-md shadow-amber-500/30'
                          : isDark
                            ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-[#00B87C]/40'
                            : 'bg-white border border-[#D4A017]/30 text-[#8A6210] hover:bg-[#FFF0C0]'
                      }`}
                    >
                      {pn}
                    </motion.button>
                  ));
                })()}
              </div>

              <motion.button
                whileHover={page < totalPages ? { scale: 1.04 } : {}} whileTap={page < totalPages ? { scale: 0.96 } : {}}
                disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className={`h-9 px-4 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-35 disabled:cursor-not-allowed ${
                  isDark ? 'bg-slate-900 border-[#00B87C]/30 text-[#00B87C] hover:bg-[#00B87C]/12' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210] hover:bg-[#FFE88A]'
                }`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
