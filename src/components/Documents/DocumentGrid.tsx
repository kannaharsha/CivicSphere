/**
 * CivicSphere — Document Grid (Read-Only)
 * Responsive 3/2/1 column grid.
 * Plain div wrapper — NO stagger parent.
 * Each DocumentCard self-animates via useInView + index delay.
 */

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import type { GovernmentDocument } from './documentTypes';
import { DocumentCard } from './DocumentCard';

interface DocumentGridProps {
  documents: GovernmentDocument[];
  isDark: boolean;
  accentColor: string;
  isLoading?: boolean;
  onOpenDetails?: (doc: GovernmentDocument) => void;
}

/* Skeleton card */
const SkeletonCard = ({ isDark, delay, accentColor }: { isDark: boolean; delay: number; accentColor: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 220, damping: 24 }}
    className="h-52 rounded-2xl relative overflow-hidden"
    style={{
      background: isDark ? 'rgba(9,19,33,0.90)' : 'rgba(248,250,252,0.95)',
      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
    }}
  >
    <motion.div
      className="absolute inset-0"
      animate={{ x: ['-100%', '220%'] }}
      transition={{ duration: 1.7, repeat: Infinity, ease: 'linear', delay: delay * 0.4 }}
      style={{
        background: isDark
          ? 'linear-gradient(90deg,transparent,rgba(0,184,124,0.07),transparent)'
          : 'linear-gradient(90deg,transparent,rgba(212,160,23,0.06),transparent)',
      }}
    />
    <div className="p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl"
          style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 rounded-lg w-3/4"
            style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)' }} />
          <div className="h-2.5 rounded-lg w-1/2"
            style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' }} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 rounded-lg w-full"
          style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' }} />
        <div className="h-2.5 rounded-lg w-4/5"
          style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)' }} />
      </div>
      <div className="flex gap-2 pt-1">
        {[75, 95, 65].map((w, i) => (
          <div key={i} className="h-6 rounded-lg"
            style={{ width: w, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' }} />
        ))}
      </div>
    </div>
  </motion.div>
);

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents, isDark, accentColor, isLoading, onOpenDetails
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} isDark={isDark} delay={i * 0.07} accentColor={accentColor} />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="rounded-2xl p-14 text-center space-y-4"
        style={{
          background: isDark ? 'rgba(9,19,33,0.90)' : 'rgba(255,255,255,0.97)',
          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: isDark ? `${accentColor}12` : `${accentColor}09` }}
        >
          <SearchX className="w-8 h-8" style={{ color: accentColor }} />
        </motion.div>
        <div>
          <h3 className="text-base font-black" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
            No Documents Found
          </h3>
          <p className="text-xs mt-1.5 max-w-sm mx-auto" style={{ color: isDark ? '#64748B' : '#9CA3AF' }}>
            Try clearing your search query or selecting a different category filter.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    /* Plain div — no motion stagger parent — each card self-animates via useInView */
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch w-full">
      <AnimatePresence mode="popLayout" initial={false}>
        {documents.map((doc, i) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            isDark={isDark}
            index={i}
            accentColor={accentColor}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
