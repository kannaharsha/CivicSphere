/**
 * CivicSphere — My Documents Page (Government Document Information Center)
 * Read-only knowledge hub for government documents required in agriculture schemes.
 *
 * Features:
 *  • Fetches document definitions from Supabase (static fallback if unavailable)
 *  • Search by name, scheme, or category
 *  • Category & filter chip navigation
 *  • Individual viewport-triggered card animations (no group stagger)
 *  • Frequently required documents horizontal scroll
 *  • Government guidance cards
 *
 * NO uploads. NO storage. NO user data. Informational only.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { fetchGovernmentDocuments } from './supabaseDocumentService';
import { GOVERNMENT_DOCUMENTS } from './documentData';
import type { GovernmentDocument, DocumentCategory, DocumentInfoStats } from './documentTypes';
import type { FilterOption } from './DocumentFilters';

import { DocumentHero } from './DocumentHero';
import { DocumentCategories } from './DocumentCategories';
import { DocumentSearch } from './DocumentSearch';
import { DocumentFilters } from './DocumentFilters';
import { DocumentGrid } from './DocumentGrid';
import { FrequentlyRequiredDocuments } from './FrequentlyRequiredDocuments';
import { GovernmentGuidance } from './GovernmentGuidance';
import { DocumentDetailModal } from './DocumentDetailModal';

interface MyDocumentsPageProps {
  isDark: boolean;
}

export const MyDocumentsPage: React.FC<MyDocumentsPageProps> = ({ isDark }) => {
  const accentColor = isDark ? '#00B87C' : '#D4A537';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#6B7280';

  /* ── Selected Document for Full Educational View Modal ── */
  const [selectedDoc, setSelectedDoc] = useState<GovernmentDocument | null>(null);

  /* ── Data ── */
  const [documents, setDocuments] = useState<GovernmentDocument[]>(GOVERNMENT_DOCUMENTS);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Filter state ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  /* ── Ref for scroll-to-grid ── */
  const gridRef = useRef<HTMLDivElement>(null);

  /* ── Load documents once ── */
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchGovernmentDocuments().then(docs => {
      if (!cancelled) {
        setDocuments(docs.length > 0 ? docs : GOVERNMENT_DOCUMENTS);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  /* ── Stats ── */
  const stats = useMemo<DocumentInfoStats>(() => ({
    total: documents.length,
    agriculture: documents.filter(d => d.category === 'agriculture').length,
    identity: documents.filter(d => d.category === 'identity').length,
    land: documents.filter(d => d.category === 'land').length,
  }), [documents]);

  /* ── Filtered documents ── */
  const filteredDocs = useMemo(() => {
    let result = [...documents];

    // Category filter from sidebar
    if (activeCategory !== 'all') {
      result = result.filter(d => d.category === activeCategory);
    }

    // Chip filter
    if (activeFilter === 'priority') {
      result = result.filter(d => d.isMostRequired);
    } else if (activeFilter !== 'all') {
      // activeFilter is a DocumentCategory
      result = result.filter(d => d.category === activeFilter);
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.issuingAuthority.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.relatedSchemes.some(s => s.toLowerCase().includes(q))
      );
    }

    return result;
  }, [documents, activeCategory, activeFilter, searchQuery]);

  /* ── Handlers ── */
  const handleCategorySelect = useCallback((cat: DocumentCategory | 'all') => {
    setActiveCategory(cat);
    setActiveFilter('all');
    setSearchQuery('');
  }, []);

  const handleFrequentDocClick = useCallback((docId: string) => {
    // Find the doc's category and scroll to the grid
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setActiveCategory(doc.category);
      setActiveFilter('priority');
      setSearchQuery('');
    }
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [documents]);

  const hasActiveFilters = searchQuery || activeCategory !== 'all' || activeFilter !== 'all';

  return (
    <div className="space-y-10 w-full">

      {/* ── 1. HERO ── */}
      <DocumentHero stats={stats} isDark={isDark} />

      {/* ── 2. FREQUENTLY REQUIRED ── */}
      {!isLoading && (
        <FrequentlyRequiredDocuments
          docs={documents}
          isDark={isDark}
          accentColor={accentColor}
          onViewDoc={(docId) => {
            const doc = documents.find(d => d.id === docId);
            if (doc) setSelectedDoc(doc);
          }}
        />
      )}

      {/* ── 3. CATEGORY CARDS ── */}
      <DocumentCategories
        activeCategory={activeCategory}
        onSelect={handleCategorySelect}
        isDark={isDark}
      />

      {/* ── 4. SEARCH BAR ── */}
      <DocumentSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDark={isDark}
        accentColor={accentColor}
        resultCount={filteredDocs.length}
      />

      {/* ── 5. FILTER CHIPS ── */}
      <DocumentFilters
        activeFilter={activeFilter}
        onFilterChange={(f) => {
          setActiveFilter(f);
          setActiveCategory('all');
        }}
        isDark={isDark}
      />

      {/* ── 6. RESULTS SUMMARY ── */}
      <div ref={gridRef}>
        <motion.div
          key={`${filteredDocs.length}-${activeCategory}-${activeFilter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="w-1 h-5 rounded-full" style={{ background: accentColor }} />
          <span className="text-sm font-black" style={{ color: textColor }}>
            {filteredDocs.length} Government Document{filteredDocs.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>

          {hasActiveFilters && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setActiveFilter('all');
              }}
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                color: mutedColor,
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              Clear filters
            </motion.button>
          )}
        </motion.div>

        {/* ── 7. DOCUMENT GRID ── */}
        <DocumentGrid
          documents={filteredDocs}
          isDark={isDark}
          accentColor={accentColor}
          isLoading={isLoading}
          onOpenDetails={(doc) => setSelectedDoc(doc)}
        />
      </div>

      {/* ── 8. GOVERNMENT GUIDANCE ── */}
      <GovernmentGuidance isDark={isDark} />

      {/* ── 9. FULL EDUCATIONAL MODAL VIEW ── */}
      <DocumentDetailModal
        doc={selectedDoc}
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        isDark={isDark}
        accentColor={accentColor}
      />
    </div>
  );
};

export default MyDocumentsPage;
