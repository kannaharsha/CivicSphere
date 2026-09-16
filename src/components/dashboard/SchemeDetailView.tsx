import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bookmark, BookmarkCheck, ArrowUpRight, Share2,
  Copy, Check, Building2, MapPin, Globe, ShieldCheck,
  Star, CheckCircle2, FileCheck2, Tag, FileText,
  AlertCircle, ChevronDown, Search, Sparkles,
  Award, DollarSign, Users, Calendar, Percent, CheckSquare,
  Square, ExternalLink, Download, HelpCircle, Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { AgricultureScheme } from '../../services/schemeService';

interface SchemeDetailViewProps {
  scheme: AgricultureScheme;
  isDark: boolean;
  isSaved: boolean;
  onBack: () => void;
  onToggleBookmark: (id: string | number, name: string) => void;
  onSelectCategory: (cat: string) => void;
  onSelectState: (state: string) => void;
  selectedCategory?: string;
  selectedState?: string;
}

// ── State list parser ────────────────────────────────────────────────
function parseStateList(raw: string | undefined | null): string[] {
  if (!raw) return ['All India'];
  const trimmed = raw.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1);
    const parts = inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '').trim()).filter(Boolean);
    return parts.length > 0 ? parts : ['All India'];
  }
  const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts : ['All India'];
}

function getStateLabel(raw: string | undefined | null): string {
  const states = parseStateList(raw);
  if (states.length === 0 || states[0] === 'All India') return 'All India';
  if (states.length === 1) return states[0];
  return `${states[0]} +${states.length - 1} more`;
}

function parseCategoryTags(raw: string | undefined | null): string[] {
  if (!raw) return ['Government Scheme'];
  return raw.split(/, (?=[A-Z])/).map(c => c.trim()).filter(Boolean);
}

function cleanSchemeTitle(title: string | undefined | null): string {
  if (!title) return 'Government Scheme';
  return title
    .replace(/["'“”]/g, '')
    .trim();
}

// ── Application Process Helpers ─────────────────────────────────────
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function isProcessHeadingOnly(str: string): boolean {
  if (!str) return true;
  const t = decodeHtmlEntities(str).trim();
  return /^(?:>|\s)*(?:\*\*|__)?(?:Application Procedure|Registration Process|Application Process|Procedure|How to apply)(?:\*\*|__)?\s*:?\s*$/i.test(t);
}

interface ParsedStepItem {
  title: string;
  body: string;
  links: { text: string; url: string; isPdf: boolean }[];
}

function parseStepItem(rawStep: string, index: number): ParsedStepItem {
  let text = decodeHtmlEntities(rawStep || '').trim();

  // Remove markdown blockquote or bullet prefix if present
  text = text.replace(/^>\s*/, '').replace(/^•\s*/, '');

  let title = '';
  let body = text;

  // Pattern 1: **Step X: Title:** Body or **Step X - Title:** Body or **Title:** Body
  const titledMatch = text.match(/^(\*{0,2}(?:Step\s*[-–—:]?\s*\d+|\d+\.)\s*[:\-–—]\s*)([A-Za-z0-9\s/&,()\-–—]+?)(:\*{0,2}|\*{0,2}:|\*{2})\s*(.*)$/i);
  if (titledMatch) {
    title = titledMatch[2].trim();
    body = titledMatch[4].trim() || title;
  } else {
    // Pattern 2: **Step X:** Body or Step X: Body or 1. Body
    const stepNumMatch = text.match(/^(\*{0,2}(?:Step\s*[-–—:]?\s*\d+|\d+\.)\s*[:\-–—]\s*\*{0,2}|\*{2}(?:Step\s*[-–—:]?\s*\d+|\d+\.)\*{2}\s*[:\-–—]?|\d+\.\s+)\s*(.*)$/i);
    if (stepNumMatch) {
      body = stepNumMatch[2].trim();
    }
  }

  // Clean off any remaining leading/trailing bold asterisks if leftover
  body = body.replace(/^\*\*\s*/, '').replace(/\s*\*\*$/, '');

  // If title is still empty, derive a smart stage title from action keywords in body
  if (!title) {
    const lower = body.toLowerCase();
    if (lower.includes('fill in') || lower.includes('fill out') || lower.includes('filling') || lower.startsWith('fill')) {
      title = 'Fill Application Details';
    } else if (lower.includes('attach') || lower.includes('upload') || lower.includes('enclose') || lower.includes('passport-sized') || (lower.includes('document') && lower.includes('copy'))) {
      title = 'Attach Required Documents';
    } else if (lower.includes('collect') || lower.includes('request the hard copy') || lower.includes('obtain') || lower.includes('prescribed format') || lower.includes('download')) {
      title = 'Obtain Prescribed Form';
    } else if (lower.includes('visit') || lower.includes('reach out to') || lower.includes('approach') || lower.includes('portal') || lower.includes('website')) {
      title = 'Visit Portal / Department Office';
    } else if (lower.includes('prepare') || lower.includes('project report') || lower.includes('dpr')) {
      title = 'Prepare Detailed Project Report';
    } else if (lower.includes('submit') || lower.includes('submission') || lower.includes('forward')) {
      title = 'Submit Application for Review';
    } else if (lower.includes('verification') || lower.includes('scrutiny') || lower.includes('inspected') || lower.includes('reviewed')) {
      title = 'Departmental Verification';
    } else if (lower.includes('disbursement') || lower.includes('sanction') || lower.includes('subsidy release') || lower.includes('approval')) {
      title = 'Sanction & Subsidy Release';
    } else {
      title = `Step ${index + 1}`;
    }
  }

  // Extract all markdown links [text](url)
  const links: { text: string; url: string; isPdf: boolean }[] = [];
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(body)) !== null) {
    const isPdf = match[2].toLowerCase().endsWith('.pdf') || match[1].toLowerCase().includes('pdf') || match[1].toLowerCase().includes('form');
    links.push({ text: match[1], url: match[2], isPdf });
  }

  return { title, body, links };
}

function FormattedProcessText({ text, isDark }: { text: string; isDark: boolean }) {
  if (!text) return null;

  const decoded = decodeHtmlEntities(text);

  // Split by markdown links: [Link Text](url)
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const renderSegmentWithBoldAndUrls = (segment: string, segKey: string) => {
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const subParts: React.ReactNode[] = [];
    let subLastIndex = 0;
    let bMatch: RegExpExecArray | null;

    const renderPlainTextOrUrl = (str: string, pKey: string) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urlParts: React.ReactNode[] = [];
      let uLastIndex = 0;
      let uMatch: RegExpExecArray | null;

      while ((uMatch = urlRegex.exec(str)) !== null) {
        if (uMatch.index > uLastIndex) {
          urlParts.push(str.slice(uLastIndex, uMatch.index));
        }
        const foundUrl = uMatch[1].replace(/[.,;:)]+$/, '');
        const isPdf = foundUrl.toLowerCase().endsWith('.pdf');
        urlParts.push(
          <a
            key={`${pKey}-url-${uMatch.index}`}
            href={foundUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 font-semibold underline decoration-2 transition-all hover:opacity-80 mx-1 ${isDark ? 'text-[#00B87C] decoration-[#00B87C]/40' : 'text-[#8A6210] decoration-[#D4A017]/50'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {isPdf ? <FileText className="w-3.5 h-3.5 inline shrink-0" /> : <Globe className="w-3.5 h-3.5 inline shrink-0" />}
            <span>{foundUrl.length > 35 ? foundUrl.slice(0, 32) + '…' : foundUrl}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0 opacity-70" />
          </a>
        );
        uLastIndex = uMatch.index + foundUrl.length;
      }
      if (uLastIndex < str.length) {
        urlParts.push(str.slice(uLastIndex));
      }
      return urlParts;
    };

    while ((bMatch = boldRegex.exec(segment)) !== null) {
      if (bMatch.index > subLastIndex) {
        subParts.push(renderPlainTextOrUrl(segment.slice(subLastIndex, bMatch.index), `${segKey}-plain-${subLastIndex}`));
      }
      subParts.push(
        <strong key={`${segKey}-bold-${bMatch.index}`} className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {bMatch[1]}
        </strong>
      );
      subLastIndex = bMatch.index + bMatch[0].length;
    }
    if (subLastIndex < segment.length) {
      subParts.push(renderPlainTextOrUrl(segment.slice(subLastIndex), `${segKey}-plain-end`));
    }
    return subParts;
  };

  while ((match = linkRegex.exec(decoded)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderSegmentWithBoldAndUrls(decoded.slice(lastIndex, match.index), `seg-${lastIndex}`));
    }
    const linkText = match[1];
    const linkUrl = match[2];
    const isPdf = linkUrl.toLowerCase().endsWith('.pdf') || linkText.toLowerCase().includes('pdf') || linkText.toLowerCase().includes('form');
    parts.push(
      <a
        key={`link-${match.index}`}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 font-bold underline decoration-2 transition-all hover:opacity-85 mx-0.5 ${isDark
            ? 'text-[#00B87C] decoration-[#00B87C]/50 hover:text-[#34D399]'
            : 'text-[#8A6210] decoration-[#D4A017]/60 hover:text-[#B3800D]'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {isPdf ? <FileText className="w-3.5 h-3.5 inline shrink-0 text-rose-400" /> : <ExternalLink className="w-3.5 h-3.5 inline shrink-0" />}
        <span>{linkText}</span>
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < decoded.length) {
    parts.push(renderSegmentWithBoldAndUrls(decoded.slice(lastIndex), `seg-end`));
  }

  return <>{parts}</>;
}

interface ParsedNoteItem {
  title?: string;
  content: string;
  isHighlight: boolean;
}

function parseProcessNotes(rawNotes: string[]): ParsedNoteItem[] {
  const result: ParsedNoteItem[] = [];
  for (const rawNote of rawNotes) {
    const decoded = decodeHtmlEntities(rawNote || '');
    const chunks = decoded.split(/(?:<br\s*\/?>|\n\n+)/gi).map(c => c.trim()).filter(Boolean);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const calloutMatch = chunk.match(/^>?\s*\*\*([^*]+)\*\*:?\s*([\s\S]*)$/i);

      if (calloutMatch) {
        const title = calloutMatch[1].replace(/:$/, '').trim();
        let content = calloutMatch[2].trim();

        if (!content && i + 1 < chunks.length && !chunks[i + 1].startsWith('>')) {
          content = chunks[i + 1].trim();
          i++;
        }

        result.push({
          title,
          content,
          isHighlight: true,
        });
      } else {
        result.push({
          content: chunk.replace(/^•\s*/, '').trim(),
          isHighlight: false,
        });
      }
    }
  }
  return result;
}

export default function SchemeDetailView({
  scheme: s,
  isDark,
  isSaved,
  onBack,
  onToggleBookmark,
  onSelectCategory,
  onSelectState,
  selectedCategory,
  selectedState
}: SchemeDetailViewProps) {
  // ── States ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [copiedId, setCopiedId] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState<Set<number>>(new Set());
  const [onlyMandatoryDocs, setOnlyMandatoryDocs] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaqIndices, setExpandedFaqIndices] = useState<Set<number>>(new Set([0]));
  const [activeProcessIdx, setActiveProcessIdx] = useState(0);

  // ── Luxury Palette (Solid, High-Contrast, Zero Mud) ────────────────
  const p = {
    panelBg: isDark ? 'bg-[#0B1726] border-[#00B87C]/30' : 'bg-[#FFFFFF] border-[#D4A017]/35',
    subPanel: isDark ? 'bg-[#0E1E31] border-[#00B87C]/20' : 'bg-[#FFF9EA] border-[#D4A017]/25',
    cardInner: isDark ? 'bg-[#0E1E31] border-slate-800' : 'bg-[#FFFDF9] border-[#D4A017]/25',
    primary: isDark ? 'text-white' : 'text-slate-900',
    secondary: isDark ? 'text-slate-300' : 'text-slate-700',
    muted: isDark ? 'text-slate-400' : 'text-[#8A6210]',
    accent: isDark ? '#00B87C' : '#D4A017',
    accentText: isDark ? 'text-[#00B87C]' : 'text-[#8A6210]',
    accentBright: isDark ? 'text-[#34D399]' : 'text-[#D4A017]',
    accentBg: isDark ? 'bg-[#00B87C]/12' : 'bg-[#FFF5D6]',
    accentBorder: isDark ? 'border-[#00B87C]/30' : 'border-[#D4A017]/35',
    accentBtn: isDark
      ? 'bg-gradient-to-r from-[#00B87C] to-[#10B981] text-white shadow-md shadow-[#00B87C]/25 hover:shadow-lg hover:shadow-[#00B87C]/40'
      : 'bg-gradient-to-r from-[#D4A017] to-[#F59E0B] text-white shadow-md shadow-[#D4A017]/25 hover:shadow-lg hover:shadow-amber-500/40',
  };

  // ── Data Parsers ───────────────────────────────────────────────────
  const catTags = useMemo(() => parseCategoryTags(s.category), [s.category]);
  const stateList = useMemo(() => parseStateList(s.raw_state || s.state), [s.raw_state, s.state]);
  const isPanIndia = stateList.length === 1 && stateList[0] === 'All India';

  // Description & Objectives
  const { overviewText, objectives } = useMemo(() => {
    const raw = s.description || '';
    const objMarker = raw.indexOf('> Objectives:') !== -1 ? '> Objectives:' : raw.indexOf('Objectives:') !== -1 ? 'Objectives:' : null;
    if (!objMarker) {
      return { overviewText: raw, objectives: [] };
    }
    const [before, after] = raw.split(objMarker);
    const parsedObjs = (after || '')
      .split(/\n(?=\d+\.)/)
      .map(line => line.trim().replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
    return { overviewText: before.trim(), objectives: parsedObjs };
  }, [s.description]);

  // Benefits
  const benefitsData = useMemo(() => {
    const raw = s.raw_benefits;
    let summary: string[] = [];
    let subsidy: { min_percentage?: number; max_percentage?: number } | null = null;
    let projectCosts: { category: string; max_cost: number | null }[] = [];

    if (raw && typeof raw === 'object') {
      if (Array.isArray(raw.summary)) {
        summary = raw.summary;
      }
      if (raw.subsidy && (raw.subsidy.min_percentage || raw.subsidy.max_percentage)) {
        subsidy = raw.subsidy;
      }
      if (Array.isArray(raw.project_costs)) {
        projectCosts = raw.project_costs;
      }
    }

    if (summary.length === 0 && s.benefits) {
      summary = s.benefits.split(/\. (?=[A-Z0-9])/).map(b => b.trim()).filter(Boolean);
    }

    return { summary, subsidy, projectCosts };
  }, [s.raw_benefits, s.benefits]);

  // Eligibility
  const eligibilityData = useMemo(() => {
    const raw = s.raw_eligibility;
    let age: { min?: number; max?: number } | null = null;
    let income: { max?: number } | null = null;
    let stateReq: string | null = null;
    let occupation: string | null = null;
    let conditions: string[] = [];
    let priority: string[] = [];

    if (raw && typeof raw === 'object') {
      if (raw.age && (raw.age.min != null || raw.age.max != null)) age = raw.age;
      if (raw.income && raw.income.max != null) income = raw.income;
      if (raw.state) stateReq = raw.state;
      if (raw.occupation) occupation = raw.occupation;
      if (Array.isArray(raw.conditions)) conditions = raw.conditions;
      if (Array.isArray(raw.priority)) priority = raw.priority;
    }

    if (conditions.length === 0 && s.eligibility) {
      conditions = s.eligibility.split(/\. (?=[A-Z0-9])/).map(c => c.trim()).filter(Boolean);
    }

    return { age, income, stateReq, occupation, conditions, priority };
  }, [s.raw_eligibility, s.eligibility]);

  // Documents
  const documentsList = useMemo(() => {
    const raw = s.raw_documents;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((d: any) => ({
        name: d.name || d.type || 'Official Document',
        type: d.type || 'Identity & Legal Proof',
        mandatory: d.mandatory !== false,
      }));
    }
    if (s.documents_required) {
      return s.documents_required.split(',').map(d => ({
        name: d.trim(),
        type: 'Required Verification',
        mandatory: true,
      })).filter(d => Boolean(d.name));
    }
    return [
      { name: 'Aadhaar Card / Official Identification Proof', type: 'Identity Proof', mandatory: true },
      { name: 'Bank Account Passbook (Aadhaar linked)', type: 'Financial Document', mandatory: true },
      { name: 'Residential / Domicile Certificate', type: 'Residence Proof', mandatory: true },
    ];
  }, [s.raw_documents, s.documents_required]);

  // Application Process
  const processData = useMemo(() => {
    const raw = s.raw_application_process;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((item: any) => ({
        mode: item.mode || s.application_mode || 'Online Portal',
        url: item.url || '',
        steps: (Array.isArray(item.steps) ? item.steps : [item.steps || 'Follow application steps on portal.'])
          .filter((st: any) => typeof st === 'string' && st.trim().length > 0 && !isProcessHeadingOnly(st)),
        notes: Array.isArray(item.notes) ? item.notes : item.notes ? [item.notes] : [],
      }));
    }
    if (s.application_process) {
      return [{
        mode: s.application_mode || 'Online Portal',
        url: s.official_scheme_url || '',
        steps: s.application_process
          .split(';')
          .map(st => st.trim())
          .filter((st: string) => Boolean(st) && !isProcessHeadingOnly(st)),
        notes: [],
      }];
    }
    return [{
      mode: s.application_mode || 'Online Portal',
      url: s.official_scheme_url || '',
      steps: [
        'Visit designated Government portal or local Agriculture Extension office.',
        'Fill the standardized registration form with applicant details and land/business records.',
        'Upload required verification documents and submit for scrutiny.',
        'Receive application acknowledgement number to track processing status.'
      ],
      notes: [],
    }];
  }, [s.raw_application_process, s.application_process, s.application_mode, s.official_scheme_url]);

  // FAQs
  const faqList = useMemo(() => {
    const raw = s.raw_faq;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.filter((f: any) => f && f.question && f.answer);
    }
    return [];
  }, [s.raw_faq]);

  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return faqList;
    const q = faqSearch.toLowerCase();
    return faqList.filter(f =>
      f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [faqList, faqSearch]);

  // Official Links
  const officialLinks = useMemo(() => {
    const links: { url: string; title: string; type: 'portal' | 'registration' | 'pdf' | 'source' }[] = [];
    const seen = new Set<string>();

    const addLink = (url: string | undefined | null, title: string, type: 'portal' | 'registration' | 'pdf' | 'source') => {
      if (!url || typeof url !== 'string') return;
      const clean = url.trim();
      if (clean && !seen.has(clean)) {
        seen.add(clean);
        links.push({ url: clean, title, type });
      }
    };

    if (s.official_scheme_url) addLink(s.official_scheme_url, 'Official Scheme Portal', 'portal');
    if (s.official_pdf_url) addLink(s.official_pdf_url, 'Official Scheme Guidelines (PDF)', 'pdf');

    if (Array.isArray(s.registration_links)) {
      s.registration_links.forEach((l, i) => addLink(l, `Online Application Gateway ${i + 1}`, 'registration'));
    }
    if (Array.isArray(s.official_urls)) {
      s.official_urls.forEach((l, i) => addLink(l, `Official Government Registry ${i + 1}`, 'source'));
    }

    return links;
  }, [s.official_scheme_url, s.official_pdf_url, s.registration_links, s.official_urls]);

  // Handlers
  const handleCopyId = () => {
    const val = String(s.scheme_id || s.id || '');
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedId(true);
    toast.success('Scheme ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleShare = () => {
    const text = `${cleanSchemeTitle(s.scheme_name)} — Check details on CivicSphere: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: s.scheme_name, text, url: window.location.href }).catch(() => { });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Scheme link copied to clipboard');
    }
  };

  const toggleDocCheck = (idx: number) => {
    setCheckedDocs(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleFaq = (idx: number) => {
    setExpandedFaqIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const expandAllFaqs = () => {
    if (expandedFaqIndices.size === faqList.length) {
      setExpandedFaqIndices(new Set());
    } else {
      setExpandedFaqIndices(new Set(faqList.map((_, i) => i)));
    }
  };

  // Filtered documents
  const displayedDocs = onlyMandatoryDocs ? documentsList.filter(d => d.mandatory) : documentsList;
  const docProgressPercent = Math.round((checkedDocs.size / (documentsList.length || 1)) * 100);

  // Tabs config
  const tabs = [
    { id: 'overview', label: 'Overview & Objectives' },
    { id: 'coverage', label: isPanIndia ? 'Coverage (Pan-India)' : `Jurisdiction (${stateList.length} State${stateList.length > 1 ? 's' : ''})` },
    { id: 'benefits', label: 'Benefits & Subsidy' },
    { id: 'eligibility', label: 'Eligibility Criteria' },
    { id: 'documents', label: `Documents (${documentsList.length})` },
    { id: 'process', label: 'How to Apply' },
    ...(faqList.length > 0 ? [{ id: 'faq', label: `FAQs (${faqList.length})` }] : []),
    ...(officialLinks.length > 0 ? [{ id: 'links', label: 'Official Portals' }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative w-full select-none space-y-7 pb-24"
    >
      {/* ── Top Navigation & Actions Bar ─────────────────────── */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-5 border-b ${isDark ? 'border-slate-800' : 'border-[#D4A017]/25'
        }`}>
        <motion.button
          whileHover={{ scale: 1.03, x: -3 }}
          whileTap={{ scale: 0.96 }}
          onClick={onBack}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isDark
              ? 'bg-[#0B1726] border-[#00B87C]/35 text-[#00B87C] hover:bg-[#00B87C]/15 shadow-sm hover:shadow-[#00B87C]/20'
              : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210] hover:bg-[#FFE88A] shadow-xs'
            }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Schemes Directory
        </motion.button>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Scheme ID Pill with Copy */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCopyId}
            title="Click to copy Scheme ID"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono transition-all cursor-pointer ${isDark
                ? 'bg-[#0B1726] border-slate-800 text-slate-400 hover:text-white hover:border-[#00B87C]/40'
                : 'bg-white border-[#D4A017]/30 text-slate-600 hover:text-slate-900 hover:border-[#D4A017]'
              }`}
          >
            {copiedId ? <Check className="w-3 h-3 text-[#00B87C]" /> : <Copy className="w-3 h-3 opacity-60" />}
            <span>ID: {s.scheme_id ? String(s.scheme_id).slice(0, 8) + '…' : '—'}</span>
          </motion.button>

          {/* Share button */}
          <motion.button
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleShare}
            title="Share Scheme"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${isDark
                ? 'bg-[#0B1726] border-slate-800 text-slate-300 hover:text-[#00B87C] hover:border-[#00B87C]/35'
                : 'bg-white border-[#D4A017]/30 text-[#8A6210] hover:bg-[#FFF5D6] hover:border-[#D4A017]'
              }`}
          >
            <Share2 className="w-4 h-4" />
          </motion.button>

          {/* Save Bookmark */}
          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onToggleBookmark(s.scheme_id || s.id, s.scheme_name)}
            className={`h-9 px-4 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isSaved
                ? isDark
                  ? 'bg-[#00B87C] text-black border-[#00B87C] shadow-md shadow-[#00B87C]/30'
                  : 'bg-[#D4A017] text-white border-[#D4A017] shadow-md shadow-amber-500/30'
                : isDark
                  ? 'bg-[#0B1726] border-[#00B87C]/30 text-[#00B87C] hover:bg-[#00B87C]/15'
                  : 'bg-white border-[#D4A017]/40 text-[#8A6210] hover:bg-[#FFF5D6]'
              }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isSaved ? 'Saved Scheme' : 'Save Scheme'}
          </motion.button>

          {/* Primary CTA */}
          {s.official_scheme_url && (
            <motion.a
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              href={s.official_scheme_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`h-9 px-5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md ${p.accentBtn}`}
            >
              Apply on Portal <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.a>
          )}
        </div>
      </div>

      {/* ── LUXURY HERO HEADER CARD ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`p-6 sm:p-8 rounded-[30px] border relative overflow-hidden shadow-xl ${p.panelBg}`}
      >
        {/* Top Royal Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-[2.5px] ${isDark
            ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
            : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
          }`} />

        <div className="relative space-y-6">
          {/* Metadata Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {catTags.map((cat, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectCategory(cat)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${selectedCategory === cat
                    ? isDark
                      ? 'bg-[#00B87C] text-black border-[#00B87C] shadow-sm shadow-[#00B87C]/30'
                      : 'bg-[#D4A017] text-white border-[#D4A017] shadow-sm shadow-amber-500/30'
                    : isDark
                      ? 'bg-[#00B87C]/12 border-[#00B87C]/30 text-[#34D399] hover:bg-[#00B87C]/20'
                      : 'bg-[#FFF5D6] border-[#D4A017]/35 text-[#8A6210] hover:bg-[#FFE88A]'
                  }`}
              >
                {cat}
              </motion.button>
            ))}

            {/* State Badge */}
            {s.state && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectState(stateList[0] || 'All India')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${isDark
                    ? 'bg-[#00B87C]/10 border-[#00B87C]/25 text-[#34D399] hover:bg-[#00B87C]/20'
                    : 'bg-[#FFF5D6] border-[#D4A017]/35 text-[#8A6210] hover:bg-[#FFE88A]'
                  }`}
              >
                <MapPin className="w-3 h-3" />
                {getStateLabel(s.state)}
              </motion.button>
            )}

            {/* Active Status Pill with Dual-Ring Radar Ping */}
            <div className={`ml-auto inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${isDark ? 'bg-[#00B87C]/10 border-[#00B87C]/30 text-[#34D399]' : 'bg-[#FFFBEF] border-[#D4A017]/40 text-[#8A6210]'
              }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B87C] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B87C]" />
              </span>
              Active Scheme
            </div>
          </div>

          {/* Scheme Title & Ministry */}
          <div className="space-y-2">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-snug font-sans ${p.primary}`}>
              {cleanSchemeTitle(s.scheme_name)}
            </h1>
            {s.ministry_department && (
              <p className={`flex items-center gap-2 text-xs sm:text-sm font-medium ${p.muted}`}>
                <Building2 className={`w-4 h-4 shrink-0 ${p.accentBright}`} />
                {s.ministry_department}
              </p>
            )}
          </div>

          {/* Executive 6-Metric Intelligence Ribbon with Spring Hover */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {/* 1. Mode */}
            <motion.div
              whileHover={{ y: -4, scale: 1.025 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={`p-3.5 rounded-2xl border transition-all shadow-sm ${p.cardInner} ${isDark
                  ? 'hover:border-[#00B87C]/60 hover:shadow-md hover:shadow-[#00B87C]/12'
                  : 'hover:border-[#D4A017]/60 hover:shadow-md hover:shadow-amber-900/8'
                }`}
            >
              <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${p.muted}`}>Application Mode</span>
              <span className={`text-xs font-bold mt-1 flex items-center gap-1.5 truncate ${p.primary}`}>
                <Sparkles className={`w-3.5 h-3.5 shrink-0 ${p.accentBright}`} />
                {s.application_mode || 'Online Portal'}
              </span>
            </motion.div>

            {/* 2. Coverage */}
            <motion.div
              whileHover={{ y: -4, scale: 1.025 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={`p-3.5 rounded-2xl border transition-all shadow-sm ${p.cardInner} ${isDark
                  ? 'hover:border-[#00B87C]/60 hover:shadow-md hover:shadow-[#00B87C]/12'
                  : 'hover:border-[#D4A017]/60 hover:shadow-md hover:shadow-amber-900/8'
                }`}
            >
              <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${p.muted}`}>Coverage Scope</span>
              <span className={`text-xs font-bold mt-1 flex items-center gap-1.5 truncate ${p.primary}`}>
                <Globe className={`w-3.5 h-3.5 shrink-0 ${p.accentBright}`} />
                {isPanIndia ? 'Pan-India' : `${stateList.length} State${stateList.length > 1 ? 's' : ''}`}
              </span>
            </motion.div>

            {/* 3. Beneficiary */}
            <motion.div
              whileHover={{ y: -4, scale: 1.025 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={`p-3.5 rounded-2xl border transition-all shadow-sm ${p.cardInner} ${isDark
                  ? 'hover:border-[#00B87C]/60 hover:shadow-md hover:shadow-[#00B87C]/12'
                  : 'hover:border-[#D4A017]/60 hover:shadow-md hover:shadow-amber-900/8'
                }`}
            >
              <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${p.muted}`}>Target Group</span>
              <span className={`text-xs font-bold mt-1 flex items-center gap-1.5 truncate ${p.primary}`}>
                <Users className={`w-3.5 h-3.5 shrink-0 ${p.accentBright}`} />
                {eligibilityData.occupation || s.target_beneficiary || 'Eligible Citizens'}
              </span>
            </motion.div>

            {/* 4. Subsidy / Benefit */}
            <motion.div
              whileHover={{ y: -4, scale: 1.025 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={`p-3.5 rounded-2xl border transition-all shadow-sm ${p.cardInner} ${isDark
                  ? 'hover:border-[#00B87C]/60 hover:shadow-md hover:shadow-[#00B87C]/12'
                  : 'hover:border-[#D4A017]/60 hover:shadow-md hover:shadow-amber-900/8'
                }`}
            >
              <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${p.muted}`}>Subsidy Support</span>
              <span className={`text-xs font-bold mt-1 flex items-center gap-1 truncate ${p.accentBright}`}>
                <Percent className="w-3.5 h-3.5 shrink-0" />
                {benefitsData.subsidy
                  ? `${benefitsData.subsidy.min_percentage}% – ${benefitsData.subsidy.max_percentage}%`
                  : 'Direct Assistance'}
              </span>
            </motion.div>

            {/* 5. Age */}
            <motion.div
              whileHover={{ y: -4, scale: 1.025 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={`p-3.5 rounded-2xl border transition-all shadow-sm ${p.cardInner} ${isDark
                  ? 'hover:border-[#00B87C]/60 hover:shadow-md hover:shadow-[#00B87C]/12'
                  : 'hover:border-[#D4A017]/60 hover:shadow-md hover:shadow-amber-900/8'
                }`}
            >
              <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${p.muted}`}>Age Eligibility</span>
              <span className={`text-xs font-bold mt-1 flex items-center gap-1.5 truncate ${p.primary}`}>
                <Calendar className={`w-3.5 h-3.5 shrink-0 ${p.accentBright}`} />
                {eligibilityData.age ? `${eligibilityData.age.min || 18} – ${eligibilityData.age.max || 60} Yrs` : 'All Ages'}
              </span>
            </motion.div>

            {/* 6. Verification */}
            <motion.div
              whileHover={{ y: -4, scale: 1.025 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={`p-3.5 rounded-2xl border transition-all shadow-sm ${p.cardInner} ${isDark
                  ? 'hover:border-[#00B87C]/60 hover:shadow-md hover:shadow-[#00B87C]/12'
                  : 'hover:border-[#D4A017]/60 hover:shadow-md hover:shadow-amber-900/8'
                }`}
            >
              <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${p.muted}`}>Registry Status</span>
              <span className={`text-xs font-bold mt-1 flex items-center gap-1.5 truncate ${p.accentBright}`}>
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                DB Verified
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── TAB NAVIGATION BAR WITH SLIDING LIQUID PILL ─ */}
      <div className={`relative z-10 p-1.5 rounded-2xl border backdrop-blur-xl flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-md transition-all ${isDark ? 'bg-[#0B1726] border-[#00B87C]/30 shadow-black/30' : 'bg-white border-[#D4A017]/35 shadow-amber-900/5'
        }`}>
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold tracking-wide whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${isActive
                  ? isDark ? 'text-black font-black' : 'text-white font-black'
                  : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-[#8A6210] hover:text-slate-900'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSchemeDetailTab"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className={`absolute inset-0 rounded-xl shadow-md ${isDark
                      ? 'bg-gradient-to-r from-[#00B87C] to-[#10B981] shadow-[#00B87C]/35'
                      : 'bg-gradient-to-r from-[#D4A017] to-[#F59E0B] shadow-amber-500/35'
                    }`}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── ACTIVE TAB CONTENT (Separate section view with Smooth Stagger) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full"
        >
          {/* ── 1. LOCATION / JURISDICTION CARD ───────────────────── */}
          {activeTab === 'coverage' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`rounded-[28px] border overflow-hidden shadow-lg relative ${p.panelBg}`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${isDark
                  ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
                }`} />

              {/* Header Bar */}
              <div className={`px-6 py-4 border-b flex items-center justify-between gap-3 ${isDark ? 'border-slate-800 bg-[#0E1E31]' : 'border-[#D4A017]/25 bg-[#FFF9EA]'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/30 text-[#00B87C]' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#D4A017]'
                    }`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest block ${p.muted}`}>
                      Jurisdiction & Geographical Coverage
                    </span>
                    <span className={`text-sm font-bold ${p.primary}`}>
                      {isPanIndia ? 'Pan-India — All States & UTs' : `${stateList.length} State${stateList.length > 1 ? 's' : ''} Covered`}
                    </span>
                  </div>
                </div>
                {/* Count Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/35 text-[#34D399]' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210]'
                  }`}>
                  {isPanIndia ? '36 States + UTs' : `${stateList.length} region${stateList.length > 1 ? 's' : ''}`}
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-5 space-y-4">
                {isPanIndia ? (
                  <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isDark ? 'bg-[#00B87C]/10 border-[#00B87C]/25' : 'bg-[#FFFBEF] border-[#D4A017]/30'
                    }`}>
                    <Globe className={`w-8 h-8 shrink-0 ${isDark ? 'text-[#00B87C]' : 'text-[#D4A017]'}`} />
                    <div>
                      <p className={`text-sm font-bold ${p.primary}`}>
                        Available Nationwide
                      </p>
                      <p className={`text-xs mt-0.5 ${p.muted}`}>
                        This scheme is eligible for qualified farmers and citizens across all states, union territories, and administrative zones of India.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={`text-xs ${p.muted}`}>
                      This scheme is operational in the following states. Click any state tag to filter all schemes from that region:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {stateList.map((st, si) => (
                        <motion.button
                          key={si}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onSelectState(st)}
                          title={`Filter schemes from ${st}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${selectedState === st
                              ? isDark
                                ? 'bg-[#00B87C] text-black border-[#00B87C] shadow-md shadow-[#00B87C]/30'
                                : 'bg-[#D4A017] text-white border-[#D4A017] shadow-md shadow-amber-500/30'
                              : isDark
                                ? 'bg-[#0E1E31] border-slate-800 text-[#34D399] hover:bg-[#00B87C]/20 hover:border-[#00B87C]/50'
                                : 'bg-[#FFF5D6] border-[#D4A017]/35 text-[#8A6210] hover:bg-[#FFE88A] hover:border-[#D4A017] shadow-xs'
                            }`}
                        >
                          <MapPin className="w-3 h-3" />
                          {st}
                        </motion.button>
                      ))}
                    </div>
                    <p className={`text-[11px] ${isDark ? 'text-[#00B87C]/80' : 'text-[#8A6210]/90'}`}>
                      💡 Tap any state pill to explore related schemes dedicated to that territory
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ── 2. OVERVIEW & OBJECTIVES ───────────────────────── */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 sm:p-7 rounded-[28px] border space-y-5 shadow-lg relative ${p.panelBg}`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${isDark
                  ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
                }`} />

              <div className="flex items-center justify-between border-b pb-4 border-inherit">
                <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2.5 ${p.primary}`}>
                  <div className={`p-2 rounded-xl border ${p.subPanel}`}>
                    <FileText className={`w-4 h-4 ${p.accentBright}`} />
                  </div>
                  Executive Overview & Scheme Scope
                </h3>
                <span className={`text-xs font-semibold ${p.muted}`}>
                  Government Registry
                </span>
              </div>

              {/* Main Description */}
              <div className={`p-5 rounded-2xl border text-sm leading-relaxed font-sans ${p.cardInner} ${p.secondary}`}>
                {overviewText || 'Official scheme details from verified Central / State Agriculture Registry.'}
              </div>

              {/* Objectives Grid (if parsed) */}
              {objectives.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${p.accentBright}`}>
                    <Award className="w-4 h-4" /> Core Policy Objectives
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {objectives.map((obj, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -3, scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className={`p-4 rounded-2xl border flex items-start gap-3 transition-all shadow-xs ${p.subPanel}`}
                      >
                        <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border ${isDark ? 'bg-[#00B87C]/20 border-[#00B87C]/40 text-[#00B87C]' : 'bg-[#FFF5D6] border-[#D4A017]/50 text-[#8A6210]'
                          }`}>
                          {i + 1}
                        </span>
                        <p className={`text-xs sm:text-sm leading-relaxed ${p.secondary}`}>
                          {obj}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── 3. BENEFITS & FINANCIAL ASSISTANCE ─────────────── */}
          {activeTab === 'benefits' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 sm:p-7 rounded-[28px] border space-y-6 shadow-lg relative ${p.panelBg}`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${isDark
                  ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
                }`} />

              <div className="flex items-center justify-between border-b pb-4 border-inherit">
                <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2.5 ${p.primary}`}>
                  <div className={`p-2 rounded-xl border ${p.subPanel}`}>
                    <Star className={`w-4 h-4 ${p.accentBright} fill-current`} />
                  </div>
                  Benefits & Financial Assistance
                </h3>
                {benefitsData.subsidy && (
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/35 text-[#34D399]' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210]'
                    }`}>
                    {benefitsData.subsidy.min_percentage}% – {benefitsData.subsidy.max_percentage}% Subsidy Available
                  </div>
                )}
              </div>

              {/* Subsidy Highlight Banner if present */}
              {benefitsData.subsidy && (
                <div className={`p-5 rounded-2xl border flex items-center justify-between flex-wrap gap-4 ${isDark ? 'bg-[#0E1E31] border-[#00B87C]/30' : 'bg-[#FFFBEF] border-[#D4A017]/35'
                  }`}>
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#00B87C]/20 border-[#00B87C]/40 text-[#00B87C]' : 'bg-[#FFF5D6] border-[#D4A017]/50 text-[#D4A017]'
                      }`}>
                      <Percent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`text-base font-bold ${p.primary}`}>
                        State Subsidy Assistance: {benefitsData.subsidy.min_percentage}% – {benefitsData.subsidy.max_percentage}%
                      </h4>
                      <p className={`text-xs mt-0.5 ${p.muted}`}>
                        Back-ended capital subsidy provided upon project appraisal by approved financial institutions.
                      </p>
                    </div>
                  </div>
                  <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border ${isDark ? 'bg-[#0B1726] border-[#00B87C]/40 text-[#34D399]' : 'bg-white border-[#D4A017]/40 text-[#8A6210]'
                    }`}>
                    Govt Subsidized
                  </span>
                </div>
              )}

              {/* Structured Benefits List */}
              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${p.muted}`}>
                  <ShieldCheck className="w-4 h-4 text-[#00B87C]" /> Entitlements & Direct Support Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {benefitsData.summary.map((b, i) => {
                    const parts = b.split(':');
                    const hasPrefix = parts.length > 1 && parts[0].length < 35;
                    const title = hasPrefix ? parts[0].trim() : null;
                    const text = hasPrefix ? parts.slice(1).join(':').trim() : b;

                    return (
                      <motion.div
                        key={i}
                        whileHover={{ y: -3, scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className={`p-4 rounded-2xl border transition-all shadow-xs ${p.cardInner}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border ${isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/30 text-[#00B87C]' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#D4A017]'
                            }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <div className="space-y-1">
                            {title && (
                              <h5 className={`text-xs font-bold ${p.primary}`}>
                                {title}
                              </h5>
                            )}
                            <p className={`text-xs leading-relaxed ${p.secondary}`}>
                              {text}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Project Cost Ceilings (if available) */}
              {benefitsData.projectCosts.length > 0 && (
                <div className="space-y-3 pt-3">
                  <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${p.muted}`}>
                    <DollarSign className="w-4 h-4 text-[#00B87C]" /> Maximum Project Cost Ceilings by Sector
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                    {benefitsData.projectCosts.map((pc, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.015, y: -2 }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs shadow-xs ${p.subPanel}`}
                      >
                        <span className={`font-semibold truncate ${p.primary}`} title={pc.category}>
                          {pc.category}
                        </span>
                        <span className={`font-bold shrink-0 px-2 py-0.5 rounded-md border ${isDark ? 'bg-[#0B1726] border-[#00B87C]/30 text-[#34D399]' : 'bg-white border-[#D4A017]/30 text-[#8A6210]'
                          }`}>
                          {pc.max_cost ? `₹${(pc.max_cost / 100000).toFixed(1)}L` : 'Custom'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── 4. ELIGIBILITY CRITERIA ────────────────────────── */}
          {activeTab === 'eligibility' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 sm:p-7 rounded-[28px] border space-y-6 shadow-lg relative ${p.panelBg}`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${isDark
                  ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
                }`} />

              <div className="flex items-center justify-between border-b pb-4 border-inherit">
                <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2.5 ${p.primary}`}>
                  <div className={`p-2 rounded-xl border ${p.subPanel}`}>
                    <CheckCircle2 className={`w-4 h-4 ${p.accentBright}`} />
                  </div>
                  Eligibility Matrix & Quotas
                </h3>
                <span className={`text-xs font-semibold ${p.muted}`}>
                  Qualification Norms
                </span>
              </div>

              {/* Key Parameters 4-Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Age */}
                <motion.div
                  whileHover={{ y: -3, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`p-4 rounded-2xl border ${p.cardInner}`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${p.muted}`}>Age Limit</span>
                  <span className={`text-sm font-bold mt-1 block ${p.primary}`}>
                    {eligibilityData.age ? `${eligibilityData.age.min || 18} – ${eligibilityData.age.max || 65} Years` : 'No Age Bar'}
                  </span>
                </motion.div>

                {/* Income */}
                <motion.div
                  whileHover={{ y: -3, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`p-4 rounded-2xl border ${p.cardInner}`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${p.muted}`}>Income Ceiling</span>
                  <span className={`text-sm font-bold mt-1 block ${p.accentBright}`}>
                    {eligibilityData.income?.max ? `≤ ₹${(eligibilityData.income.max / 100000).toFixed(1)} Lakh/yr` : 'No Limit'}
                  </span>
                </motion.div>

                {/* Domicile / State */}
                <motion.div
                  whileHover={{ y: -3, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`p-4 rounded-2xl border ${p.cardInner}`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${p.muted}`}>Domicile / Region</span>
                  <span className={`text-sm font-bold mt-1 block truncate ${p.primary}`}>
                    {eligibilityData.stateReq || (isPanIndia ? 'Any Indian State' : stateList[0])}
                  </span>
                </motion.div>

                {/* Target Group */}
                <motion.div
                  whileHover={{ y: -3, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`p-4 rounded-2xl border ${p.cardInner}`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${p.muted}`}>Occupation</span>
                  <span className={`text-sm font-bold mt-1 block truncate ${p.primary}`}>
                    {eligibilityData.occupation || 'Farmer / Beneficiary'}
                  </span>
                </motion.div>
              </div>

              {/* Priority Beneficiary Quota Chips */}
              {eligibilityData.priority.length > 0 && (
                <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? 'bg-[#0E1E31] border-[#00B87C]/25' : 'bg-[#FFFBEF] border-[#D4A017]/30'
                  }`}>
                  <div className="flex items-center gap-2">
                    <Award className={`w-4 h-4 ${p.accentBright}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${p.primary}`}>
                      Priority Beneficiary Categories
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eligibilityData.priority.map((pr, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border ${isDark
                            ? 'bg-[#0B1726] border-[#00B87C]/40 text-[#34D399]'
                            : 'bg-white border-[#D4A017]/50 text-[#8A6210]'
                          }`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#00B87C]" />
                        {pr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions Checklist */}
              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${p.muted}`}>
                  <FileCheck2 className="w-4 h-4 text-[#00B87C]" /> Mandatory Eligibility Conditions ({eligibilityData.conditions.length})
                </h4>
                <div className="space-y-2.5">
                  {eligibilityData.conditions.map((cond, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 4 }}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${p.subPanel}`}
                    >
                      <div className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border ${isDark ? 'bg-[#00B87C]/20 border-[#00B87C]/40 text-[#00B87C]' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210]'
                        }`}>
                        {i + 1}
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed ${p.secondary}`}>
                        {cond}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 5. REQUIRED DOCUMENTS CHECKLIST ─────────────────── */}
          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 sm:p-7 rounded-[28px] border space-y-6 shadow-lg relative ${p.panelBg}`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${isDark
                  ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
                }`} />

              <div className="flex items-center justify-between border-b pb-4 border-inherit flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${p.subPanel}`}>
                    <FileCheck2 className={`w-4 h-4 ${p.accentBright}`} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold uppercase tracking-widest ${p.primary}`}>
                      Document Verification Checklist
                    </h3>
                    <p className={`text-xs ${p.muted}`}>
                      {checkedDocs.size} of {documentsList.length} documents marked ready ({docProgressPercent}%)
                    </p>
                  </div>
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOnlyMandatoryDocs(false)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${!onlyMandatoryDocs
                        ? isDark
                          ? 'bg-[#00B87C] text-black border-[#00B87C]'
                          : 'bg-[#D4A017] text-white border-[#D4A017]'
                        : isDark
                          ? 'bg-[#0E1E31] border-slate-800 text-slate-400'
                          : 'bg-white border-[#D4A017]/30 text-slate-600'
                      }`}
                  >
                    All ({documentsList.length})
                  </button>
                  <button
                    onClick={() => setOnlyMandatoryDocs(true)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${onlyMandatoryDocs
                        ? isDark
                          ? 'bg-[#00B87C] text-black border-[#00B87C]'
                          : 'bg-[#D4A017] text-white border-[#D4A017]'
                        : isDark
                          ? 'bg-[#0E1E31] border-slate-800 text-slate-400'
                          : 'bg-white border-[#D4A017]/30 text-slate-600'
                      }`}
                  >
                    Mandatory Only
                  </button>
                </div>
              </div>

              {/* ── Document Readiness Progress Bar (Luxury Executive Card - Screenshot 2 Fix) ── */}
              <div className={`p-5 sm:p-6 rounded-2xl border relative overflow-hidden transition-all shadow-md ${isDark
                  ? 'bg-gradient-to-r from-[#091829] via-[#0E2238] to-[#091829] border-[#00B87C]/35 shadow-black/30'
                  : 'bg-gradient-to-r from-[#FFFDF9] via-[#FFF9EE] to-[#FFF5E6] border-[#D4A017]/40 shadow-amber-900/8'
                }`}>
                {/* Top Glowing Hairline Accent */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] ${isDark
                    ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
                    : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
                  }`} />

                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${isDark
                        ? 'bg-[#00B87C]/15 border-[#00B87C]/35 text-[#00B87C]'
                        : 'bg-[#FFF0C8] border-[#D4A017]/40 text-[#8A6210]'
                      }`}>
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className={`text-xs sm:text-sm font-bold tracking-tight block ${p.primary}`}>
                        Document Readiness Progress
                      </span>
                      <span className={`text-[11px] font-medium block ${p.muted}`}>
                        Verify physical copies or scans before submission
                      </span>
                    </div>
                  </div>

                  <div className={`px-3.5 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${isDark
                      ? 'bg-[#00B87C]/15 border-[#00B87C]/40 text-[#34D399] shadow-sm'
                      : 'bg-white border-[#D4A017]/40 text-[#8A6210] shadow-xs'
                    }`}>
                    <Sparkles className={`w-3.5 h-3.5 ${p.accentBright}`} />
                    <span>{checkedDocs.size} / {documentsList.length} Ready ({docProgressPercent}%)</span>
                  </div>
                </div>

                {/* Progress Track & Fill */}
                <div className={`h-3.5 w-full rounded-full overflow-hidden p-0.5 border relative ${isDark
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-[#F2E5CA] border-[#D4A017]/35 shadow-inner'
                  }`}>
                  <motion.div
                    initial={false}
                    animate={{ width: `${Math.max(docProgressPercent, 2)}%` }}
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                    className={`h-full rounded-full transition-all relative overflow-hidden ${isDark
                        ? 'bg-gradient-to-r from-[#00B87C] via-[#10B981] to-[#34D399] shadow-md shadow-[#00B87C]/40'
                        : 'bg-gradient-to-r from-[#D4A017] via-[#F59E0B] to-[#FBBF24] shadow-md shadow-amber-500/40'
                      }`}
                  >
                    {/* Subtle Sheen Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                  </motion.div>
                </div>

                <p className={`text-xs mt-3 font-medium flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-[#7A5508]'
                  }`}>
                  {checkedDocs.size === documentsList.length
                    ? '🎉 All required documents verified! You are fully prepared to submit your application.'
                    : '💡 Tap each document card below to mark it as ready once you have prepared your original copy or scan.'}
                </p>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayedDocs.map((doc, i) => {
                  const isChecked = checkedDocs.has(i);
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.015, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleDocCheck(i)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none shadow-xs ${isChecked
                          ? isDark
                            ? 'bg-[#00B87C]/15 border-[#00B87C]/50 shadow-sm'
                            : 'bg-[#FFF5D6] border-[#D4A017]/60 shadow-xs'
                          : p.cardInner
                        }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 shrink-0 transition-colors ${isChecked ? 'text-[#00B87C]' : p.muted}`}
                      >
                        {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-bold leading-snug transition-colors ${isChecked
                            ? isDark ? 'text-white' : 'text-slate-900'
                            : p.primary
                          }`}>
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}>
                            {doc.type}
                          </span>
                          {doc.mandatory ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${isDark ? 'bg-rose-950/40 border-rose-800 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700'
                              }`}>
                              Mandatory
                            </span>
                          ) : (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}>
                              Optional
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── 6. STEP-BY-STEP APPLICATION PROCESS ────────────── */}
          {activeTab === 'process' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 sm:p-7 rounded-[28px] border space-y-6 shadow-lg relative ${p.panelBg}`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${isDark
                  ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
                }`} />

              <div className="flex items-center justify-between border-b pb-4 border-inherit flex-wrap gap-3">
                <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2.5 ${p.primary}`}>
                  <div className={`p-2 rounded-xl border ${p.subPanel}`}>
                    <Briefcase className={`w-4 h-4 ${p.accentBright}`} />
                  </div>
                  How to Apply: Step-by-Step Roadmap
                </h3>

                <div className="flex items-center gap-2 flex-wrap">
                  {processData.length > 1 ? (
                    <div className="flex items-center gap-1.5 p-1 rounded-xl border border-inherit">
                      {processData.map((pr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveProcessIdx(idx)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeProcessIdx === idx
                              ? isDark
                                ? 'bg-[#00B87C] text-black shadow-sm'
                                : 'bg-[#D4A017] text-white shadow-sm'
                              : isDark
                                ? 'text-slate-400 hover:text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          {pr.mode || `Mode ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/35 text-[#34D399]' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210]'
                      }`}>
                      Mode: {processData[0]?.mode || s.application_mode || 'Online'}
                    </span>
                  )}
                </div>
              </div>

              {/* Display Active Process */}
              {(() => {
                const currentProc = processData[activeProcessIdx] || processData[0];
                if (!currentProc) return null;

                const parsedSteps = currentProc.steps.map((rawStep: string, idx: number) => parseStepItem(rawStep, idx));
                const parsedNotes = parseProcessNotes(currentProc.notes);

                return (
                  <div className="space-y-6">
                    {/* Official Document / Form Banner if provided */}
                    {currentProc.url && (
                      <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border ${p.subPanel}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/30 text-[#34D399]' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210]'
                            }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className={`text-xs sm:text-sm font-bold ${p.primary}`}>
                              Official Application Form & Guidelines
                            </h4>
                            <p className={`text-[11px] sm:text-xs ${p.muted}`}>
                              Access the verified government application format or guideline document
                            </p>
                          </div>
                        </div>
                        <a
                          href={currentProc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${p.accentBtn}`}
                        >
                          <span>Open Form Document</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Steps Timeline with Glowing Connecting Line */}
                    <div className="relative space-y-5 pl-2 sm:pl-4">
                      {/* Vertical Connecting Line */}
                      <div className={`absolute left-5 sm:left-7 top-5 bottom-5 w-0.5 ${isDark ? 'bg-gradient-to-b from-[#00B87C] via-[#00B87C]/40 to-[#00B87C]/10' : 'bg-gradient-to-b from-[#D4A017] via-[#D4A017]/40 to-[#D4A017]/10'
                        }`} />

                      {parsedSteps.map((stepItem: ParsedStepItem, si: number) => (
                        <motion.div
                          key={si}
                          whileHover={{ scale: 1.008, x: 3 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className="relative flex items-start gap-4 z-10"
                        >
                          {/* Number Badge */}
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl text-xs font-black flex items-center justify-center shrink-0 border shadow-md transition-transform ${isDark
                              ? 'bg-[#0B1726] border-[#00B87C] text-[#00B87C] shadow-[#00B87C]/25'
                              : 'bg-white border-[#D4A017] text-[#8A6210] shadow-amber-500/20'
                            }`}>
                            {si + 1 < 10 ? `0${si + 1}` : si + 1}
                          </div>

                          {/* Content Card */}
                          <div className={`flex-1 p-4 sm:p-5 rounded-2xl border shadow-xs space-y-3 ${p.cardInner}`}>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/30 text-[#34D399]' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210]'
                                  }`}>
                                  Step {si + 1}
                                </span>
                                <h5 className={`text-xs sm:text-sm font-bold tracking-tight ${p.primary}`}>
                                  {stepItem.title}
                                </h5>
                              </div>
                              <span className={`text-[10px] sm:text-[11px] font-medium ${p.muted}`}>
                                Stage {si + 1} of {parsedSteps.length}
                              </span>
                            </div>

                            {/* Clean parsed body text */}
                            <div className={`text-xs sm:text-sm leading-relaxed ${p.secondary}`}>
                              <FormattedProcessText text={stepItem.body} isDark={isDark} />
                            </div>

                            {/* Action Link Pills inside step */}
                            {stepItem.links.length > 0 && (
                              <div className="pt-2 flex flex-wrap gap-2 border-t border-inherit/40">
                                {stepItem.links.map((link, li) => (
                                  <a
                                    key={li}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${isDark
                                        ? 'bg-[#0E1E31] border-[#00B87C]/30 text-[#00B87C] hover:bg-[#00B87C]/15 hover:border-[#00B87C]'
                                        : 'bg-[#FFFBEF] border-[#D4A017]/40 text-[#8A6210] hover:bg-[#FFE88A]/70 hover:border-[#D4A017]'
                                      }`}
                                  >
                                    {link.isPdf ? (
                                      <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                    ) : (
                                      <Globe className="w-3.5 h-3.5 shrink-0" />
                                    )}
                                    <span>{link.text || (link.isPdf ? 'Download Form (PDF)' : 'Visit Portal')}</span>
                                    <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Structured Guidelines & Notes Callout */}
                    {parsedNotes.length > 0 && (
                      <div className={`p-5 rounded-2xl border space-y-3.5 ${isDark ? 'bg-[#0E1E31] border-[#00B87C]/25' : 'bg-[#FFFBEF] border-[#D4A017]/35'
                        }`}>
                        <div className="flex items-center gap-2 border-b pb-2.5 border-inherit">
                          <AlertCircle className={`w-4 h-4 ${p.accentBright}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${p.primary}`}>
                            Important Applicant Advice & Guidelines
                          </span>
                        </div>

                        <div className="space-y-3">
                          {parsedNotes.map((note, ni) => (
                            <div
                              key={ni}
                              className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${note.isHighlight
                                  ? isDark
                                    ? 'bg-[#0B1726]/70 border-[#00B87C]/30 text-slate-200'
                                    : 'bg-white/80 border-[#D4A017]/40 text-slate-800'
                                  : isDark
                                    ? 'bg-transparent border-transparent text-slate-300'
                                    : 'bg-transparent border-transparent text-slate-700'
                                }`}
                            >
                              {note.title && (
                                <p className={`font-bold uppercase text-[11px] tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#34D399]' : 'text-[#8A6210]'
                                  }`}>
                                  <span>📌</span> {note.title}
                                </p>
                              )}
                              <p className={note.title ? 'pl-4' : ''}>
                                <FormattedProcessText text={note.content} isDark={isDark} />
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* ── 7. FREQUENTLY ASKED QUESTIONS (FAQ) ────────────── */}
          {activeTab === 'faq' && faqList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 sm:p-7 rounded-[28px] border space-y-6 shadow-lg relative ${p.panelBg}`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${isDark
                  ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
                }`} />

              <div className="flex items-center justify-between border-b pb-4 border-inherit flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${p.subPanel}`}>
                    <HelpCircle className={`w-4 h-4 ${p.accentBright}`} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold uppercase tracking-widest ${p.primary}`}>
                      Frequently Asked Questions ({faqList.length})
                    </h3>
                    <p className={`text-xs ${p.muted}`}>
                      Clarifications on rules, qualifications, and disbursal
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={expandAllFaqs}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${isDark
                      ? 'bg-[#0B1726] border-[#00B87C]/30 text-[#00B87C] hover:bg-[#00B87C]/15'
                      : 'bg-white border-[#D4A017]/40 text-[#8A6210] hover:bg-[#FFF5D6]'
                    }`}
                >
                  {expandedFaqIndices.size === faqList.length ? 'Collapse All' : 'Expand All'}
                </motion.button>
              </div>

              {/* Search FAQ Input */}
              {faqList.length > 4 && (
                <div className="relative">
                  <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${p.muted}`} />
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={e => setFaqSearch(e.target.value)}
                    placeholder="Search FAQs by question or keyword…"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${isDark
                        ? 'bg-[#0E1E31] border-slate-800 text-white placeholder-slate-500 focus:border-[#00B87C]'
                        : 'bg-white border-[#D4A017]/30 text-slate-900 placeholder-slate-400 focus:border-[#D4A017]'
                      }`}
                  />
                </div>
              )}

              {/* Accordion List with Rotating Chevron */}
              <div className="space-y-3">
                {filteredFaqs.map((faq, fi) => {
                  const isOpen = expandedFaqIndices.has(fi);
                  return (
                    <motion.div
                      key={fi}
                      whileHover={{ scale: 1.006 }}
                      className={`rounded-2xl border transition-all overflow-hidden shadow-xs ${p.cardInner}`}
                    >
                      <button
                        onClick={() => toggleFaq(fi)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <span className={`text-xs sm:text-sm font-bold flex items-center gap-2.5 ${p.primary}`}>
                          <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 border ${isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/30 text-[#00B87C]' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#D4A017]'
                            }`}>
                            Q
                          </span>
                          {faq.question}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className={`p-1 rounded-lg border shrink-0 ${p.subPanel}`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.24, ease: 'easeInOut' }}
                            className={`px-4 pb-4 pt-1 border-t text-xs sm:text-sm leading-relaxed ${p.secondary} ${isDark ? 'border-slate-800' : 'border-[#D4A017]/15'
                              }`}
                          >
                            <div className="flex items-start gap-2.5 pt-2">
                              <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}>
                                A
                              </span>
                              <p>{faq.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── 8. OFFICIAL PORTALS & DOWNLOADS ────────────────── */}
          {activeTab === 'links' && officialLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 sm:p-7 rounded-[28px] border space-y-6 shadow-lg relative ${p.panelBg}`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${isDark
                  ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
                }`} />

              <div className="flex items-center justify-between border-b pb-4 border-inherit">
                <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2.5 ${p.primary}`}>
                  <div className={`p-2 rounded-xl border ${p.subPanel}`}>
                    <Globe className={`w-4 h-4 ${p.accentBright}`} />
                  </div>
                  Official Digital Portals & Verified Gateways
                </h3>
                <span className={`text-xs font-semibold ${p.muted}`}>
                  Verified Government Sources
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {officialLinks.map((link, li) => (
                  <motion.div
                    key={li}
                    whileHover={{ scale: 1.015, y: -2 }}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xs ${p.cardInner}`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${p.primary}`}>
                          {link.title}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${isDark ? 'bg-[#00B87C]/15 border-[#00B87C]/30 text-[#34D399]' : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210]'
                          }`}>
                          {link.type}
                        </span>
                      </div>
                      <p className={`text-[11px] font-mono truncate ${p.muted}`}>
                        {link.url}
                      </p>
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${isDark
                          ? 'bg-[#0B1726] border-[#00B87C]/30 text-[#00B87C] hover:bg-[#00B87C]/20'
                          : 'bg-[#FFF5D6] border-[#D4A017]/40 text-[#8A6210] hover:bg-[#FFE88A]'
                        }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── 9. TAGS ────────────────────────────────────────── */}
      {s.tags && s.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-5 rounded-2xl border ${p.subPanel}`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${p.muted}`}>
              <Tag className="w-3.5 h-3.5" /> Registry Tags:
            </span>
            {s.tags.map((t, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-xl text-xs font-bold border ${p.accentBg} ${p.accentText} ${p.accentBorder}`}
              >
                #{t}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── 10. LUXURY ACTION BANNER ───────────────────────── */}
      <motion.div
        whileHover={{ scale: 1.008 }}
        className={`p-7 rounded-[30px] border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden ${isDark
            ? 'bg-gradient-to-br from-[#00B87C]/15 via-[#0C1A2B] to-[#071422] border-[#00B87C]/35 shadow-[#00B87C]/10'
            : 'bg-gradient-to-br from-[#FFF5D6] via-[#FFFDF7] to-[#FFF9EA] border-[#D4A017]/45 shadow-amber-900/10'
          }`}
      >
        {/* Top Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-[2.5px] ${isDark
            ? 'bg-gradient-to-r from-transparent via-[#00B87C] to-transparent'
            : 'bg-gradient-to-r from-transparent via-[#D4A017] to-transparent'
          }`} />

        <div className="space-y-1 text-center sm:text-left relative z-10">
          <h4 className={`text-base sm:text-lg font-bold font-sans ${p.primary}`}>
            Ready to Begin Your Application?
          </h4>
          <p className={`text-xs sm:text-sm ${p.muted}`}>
            Submit application directly on the designated State / Central Digital Gateway.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap justify-center relative z-10">
          {s.official_pdf_url && (
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              href={s.official_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`h-11 px-5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${isDark
                  ? 'bg-[#0B1726] border-[#00B87C]/40 text-[#00B87C] hover:bg-[#00B87C]/20 shadow-sm'
                  : 'bg-white border-[#D4A017]/50 text-[#8A6210] hover:bg-[#FFF0C0] shadow-xs'
                }`}
            >
              <Download className="w-4 h-4" /> Download Guidelines (PDF)
            </motion.a>
          )}
          {s.official_scheme_url && (
            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href={s.official_scheme_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`h-11 px-7 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg ${p.accentBtn}`}
            >
              Apply on Portal <ArrowUpRight className="w-4 h-4" />
            </motion.a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
