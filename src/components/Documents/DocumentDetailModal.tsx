/**
 * CivicSphere — Document Detail Modal (Full Educational View)
 * Displays comprehensive government document information with tabs, step-by-step guides,
 * validity details, warnings, and associated schemes in a high-grade citizen modal.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Info, HelpCircle, Building2, ListChecks, AlertOctagon,
  Clock, MapPin, Sparkles, CheckCircle2, AlertTriangle, FileText,
  ExternalLink, ArrowRight, ShieldCheck
} from 'lucide-react';
import type { GovernmentDocument } from './documentTypes';

interface DocumentDetailModalProps {
  doc: GovernmentDocument | null;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  accentColor: string;
}

type TabType = 'overview' | 'how-to' | 'requirements' | 'mistakes';

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  doc,
  isOpen,
  onClose,
  isDark,
  accentColor,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!isOpen || !doc) return null;

  const modalBg = isDark
    ? 'linear-gradient(150deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 29, 0.98) 100%)'
    : 'linear-gradient(150deg, rgba(255, 255, 255, 0.99) 0%, rgba(248, 250, 252, 0.98) 100%)';

  const cardInnerBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
  const borderCol = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const headingColor = isDark ? '#F1F5F9' : '#1E293B';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview & Need', icon: <Info className="w-3.5 h-3.5" /> },
    { id: 'how-to', label: 'How to Obtain', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'requirements', label: 'Key Details', icon: <ListChecks className="w-3.5 h-3.5" /> },
    { id: 'mistakes', label: 'Mistakes to Avoid', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl z-10 my-auto flex flex-col max-h-[90vh]"
          style={{
            background: modalBg,
            border: `1.5px solid ${accentColor}35`,
            backdropFilter: 'blur(20px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top colored accent line */}
          <div
            className="h-1.5 w-full flex-shrink-0"
            style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80, transparent)` }}
          />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 pb-4 border-b flex-shrink-0 relative" style={{ borderColor: borderCol }}>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-5 right-5 p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)',
                color: textColor,
              }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 pr-10">
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md p-3"
                style={{
                  background: isDark
                    ? `linear-gradient(135deg, ${accentColor}30, ${accentColor}12)`
                    : `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                  border: `1.5px solid ${accentColor}40`,
                }}
              >
                <FileText className="w-6 h-6" style={{ color: accentColor }} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{
                      background: `${accentColor}18`,
                      color: accentColor,
                      border: `1px solid ${accentColor}30`,
                    }}
                  >
                    {doc.category.toUpperCase()}
                  </span>
                  {doc.isMostRequired && (
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{
                        background: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.12)',
                        color: '#F59E0B',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      Most Required
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: headingColor }}>
                  {doc.name}
                </h2>

                <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: mutedColor }}>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    {doc.issuingAuthority}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    {doc.issuingOffice}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200"
                    style={{
                      background: isActive ? `${accentColor}20` : 'transparent',
                      color: isActive ? accentColor : mutedColor,
                      border: `1px solid ${isActive ? `${accentColor}40` : 'transparent'}`,
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Body Content (Scrollable) */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Description Card */}
                <div
                  className="p-4 rounded-2xl space-y-2"
                  style={{ background: cardInnerBg, border: `1px solid ${borderCol}` }}
                >
                  <div className="flex items-center gap-2 text-xs font-black" style={{ color: accentColor }}>
                    <Info className="w-4 h-4" />
                    What is this document?
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: textColor }}>
                    {doc.description}
                  </p>
                </div>

                {/* Why Required Card */}
                <div
                  className="p-4 rounded-2xl space-y-2"
                  style={{ background: cardInnerBg, border: `1px solid ${borderCol}` }}
                >
                  <div className="flex items-center gap-2 text-xs font-black" style={{ color: accentColor }}>
                    <HelpCircle className="w-4 h-4" />
                    Why the Government Requires It
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: textColor }}>
                    {doc.whyRequired}
                  </p>
                </div>

                {/* Validity Badge Card */}
                <div
                  className="p-4 rounded-2xl flex items-start gap-3"
                  style={{
                    background: `${accentColor}0C`,
                    border: `1px solid ${accentColor}25`,
                  }}
                >
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                  <div>
                    <div className="text-xs font-black" style={{ color: accentColor }}>
                      Official Document Validity
                    </div>
                    <p className="text-xs sm:text-sm font-semibold mt-0.5" style={{ color: textColor }}>
                      {doc.validity}
                    </p>
                  </div>
                </div>

                {/* Related Schemes */}
                {doc.relatedSchemes && doc.relatedSchemes.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-1.5 text-xs font-black" style={{ color: headingColor }}>
                      <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                      Directly Applicable Government Schemes ({doc.relatedSchemes.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doc.relatedSchemes.map((scheme) => (
                        <span
                          key={scheme}
                          className="px-3 py-1 rounded-lg text-xs font-bold"
                          style={{
                            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                            color: textColor,
                            border: `1px solid ${borderCol}`,
                          }}
                        >
                          {scheme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'how-to' && (
              <div className="space-y-4">
                <div className="text-xs font-bold" style={{ color: mutedColor }}>
                  Follow these verified government application steps to obtain or update your {doc.name}:
                </div>

                <div className="space-y-2.5">
                  {doc.howToObtain.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl flex items-start gap-3.5 transition-all"
                      style={{ background: cardInnerBg, border: `1px solid ${borderCol}` }}
                    >
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs"
                        style={{
                          background: `${accentColor}20`,
                          color: accentColor,
                          border: `1px solid ${accentColor}35`,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed pt-1" style={{ color: textColor }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  className="p-4 rounded-2xl flex items-center justify-between"
                  style={{ background: cardInnerBg, border: `1px solid ${borderCol}` }}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <Building2 className="w-4 h-4" style={{ color: accentColor }} />
                    <span style={{ color: mutedColor }}>Issuing Office / Portal:</span>
                    <strong style={{ color: textColor }}>{doc.issuingOffice}</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-4">
                {/* Important Notes */}
                <div className="space-y-2">
                  <div className="text-xs font-black flex items-center gap-1.5" style={{ color: headingColor }}>
                    <ShieldCheck className="w-4 h-4" style={{ color: accentColor }} />
                    Important Points to Verify
                  </div>
                  <div className="space-y-2">
                    {doc.importantNotes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl flex items-start gap-2.5"
                        style={{ background: cardInnerBg, border: `1px solid ${borderCol}` }}
                      >
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                        <span className="text-xs sm:text-sm leading-relaxed" style={{ color: textColor }}>
                          {note}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Details on Document */}
                {doc.requiredInfo && doc.requiredInfo.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-black" style={{ color: headingColor }}>
                      Mandatory Fields that must be clearly visible:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doc.requiredInfo.map((info, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                          style={{
                            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                            color: textColor,
                            border: `1px solid ${borderCol}`,
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
                          {info}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mistakes' && (
              <div className="space-y-3">
                <div
                  className="p-3 rounded-xl flex items-center gap-2 text-xs font-bold"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  Common verification issues that lead to scheme application rejection:
                </div>

                <div className="space-y-2.5">
                  {doc.commonMistakes.map((mistake, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl flex items-start gap-3"
                      style={{
                        background: isDark ? 'rgba(239, 68, 68, 0.04)' : 'rgba(239, 68, 68, 0.03)',
                        border: isDark ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(239, 68, 68, 0.12)',
                      }}
                    >
                      <span className="font-black text-xs px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 flex-shrink-0 mt-0.5">
                        Avoid
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed" style={{ color: textColor }}>
                        {mistake}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            className="p-4 sm:p-5 border-t flex items-center justify-between flex-shrink-0"
            style={{ borderColor: borderCol, background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}
          >
            <span className="text-xs font-semibold" style={{ color: mutedColor }}>
              Official Citizen Reference Guide
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
              style={{
                background: accentColor,
                color: isDark ? '#000000' : '#FFFFFF',
              }}
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
